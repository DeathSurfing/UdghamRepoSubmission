import sys
import json
import requests
import PyPDF2
import docx
import os
from pymongo import MongoClient
from bson import ObjectId

sys.stdout.reconfigure(encoding='utf-8')

MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "cv_database"
COLLECTION_NAME = "candidates"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
OLLAMA_MODEL = "mistral"

def extract_text_from_file(file_path):
    """Extract text from PDF or DOCX files."""
    text = ""
    try:
        if file_path.endswith(".pdf"):
            with open(file_path, "rb") as file:
                reader = PyPDF2.PdfReader(file)
                text = "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])
        elif file_path.endswith(".docx"):
            doc = docx.Document(file_path)
            text = "\n".join([para.text for para in doc.paragraphs])
        os.remove(file_path)
    except Exception as e:
        return f"Error extracting text: {e}"
    return text

def analyze_resume(resume_text, job_prompt):
    """Send resume text to Ollama and receive a structured JSON response."""
    prompt = f"""
    You are an AI hiring assistant. Analyze the following resume for the job description provided.

    **Return ONLY a JSON object in this format (without extra text):**
    {{
        "rating": <integer between 0-10>,
        "exceptional_qualities": ["quality1", "quality2"],
        "bad_habits": ["habit1", "habit2"]
    }}

    Job Description:
    {job_prompt}

    Resume Content:
    {resume_text}
    """

    try:
        response = requests.post(OLLAMA_URL, json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False})

        if response.status_code == 200:
            try:
                data = response.json()
                response_text = data.get("response", "").strip()
                json_data = json.loads(response_text)
                
                # ✅ Return only the final JSON object
                return json_data

            except json.JSONDecodeError:
                return {"error": "Invalid JSON from Ollama"}

        return {"error": f"Ollama API error: {response.status_code}"}

    except Exception as e:
        return {"error": str(e)}

def update_candidate_score(candidate):
    """Fetch and process candidate data, then update MongoDB."""
    resume_text = extract_text_from_file(candidate["cvUrl"])
    if not resume_text:
        return {"error": f"Could not extract resume text for {candidate['name']}"}

    job_prompt = "Analyze this resume for a software engineer role requiring Python expertise."
    result = analyze_resume(resume_text, job_prompt)

    if "error" not in result:
        collection.update_one({"_id": candidate["_id"]}, {"$set": {"analysis_result": result}})
    
    return result

if __name__ == "__main__":
    candidates = list(collection.find({}, {"_id": 1, "name": 1, "cvUrl": 1}))
    
    if not candidates:
        print(json.dumps({"error": "No candidates found in database."}))
        sys.exit(1)
    
    final_results = []

    for candidate in candidates:
        result = update_candidate_score(candidate)
        final_results.append({"name": candidate["name"], "result": result})

    # ✅ Print only a single JSON object for all candidates
    print(json.dumps({"candidates": final_results, "status": "Grading process complete."}))
