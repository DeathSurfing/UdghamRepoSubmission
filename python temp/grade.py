import json
import requests
import PyPDF2
import docx
import sys
from pymongo import MongoClient
from bson import ObjectId

# Check if three arguments are provided
if len(sys.argv) != 4:
    print("Usage: python script.py <cvUrl> <jobprompt> <objectId>")
    sys.exit(1)

# Get arguments
cvUrl = sys.argv[1]
jobprompt = sys.argv[2]
object_id = sys.argv[3]  # MongoDB document _id

# MongoDB Connection
MONGO_URI = "mongodb://localhost:27017"  # Change if necessary
DB_NAME = "cv_database"
COLLECTION_NAME = "candidates"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

def extract_text_from_file(resumepath: str) -> str:
    if resumepath.endswith(".pdf"):
        with open(resumepath, "rb") as file:
            reader = PyPDF2.PdfReader(file)
            text = "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])
    elif resumepath.endswith(".docx") or resumepath.endswith(".doc"):
        doc = docx.Document(resumepath)
        text = "\n".join([para.text for para in doc.paragraphs])
    else:
        raise ValueError("Unsupported file format")
    return text

def analyze_resume(resumepath: str, jobprompt: str):
    resume_text = extract_text_from_file(resumepath)
    
    ollama_url = "http://127.0.0.1:11434/api/generate"
    model = "deepseek-coder:latest"
    
    prompt = f"""
    Analyze the following resume for the given job prompt and provide a JSON response with the following structure:
    {{
        "rating": <integer from 0 to 10>,
        "exceptional_qualities": [<list of exceptional qualities>],
        "bad_habits": [<list of bad habits detected>]
    }}
    
    Job Prompt:
    {jobprompt}
    
    Resume:
    {resume_text}
    """
    
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False
    }
    
    response = requests.post(ollama_url, json=payload)
    
    if response.status_code == 200:
        try:
            data = response.json()
            content = data.get("response", "{}")  # Get response content
            analysis_result = json.loads(content)  # Parse JSON output
            return analysis_result
        except json.JSONDecodeError:
            return {"error": "Failed to parse JSON response from Ollama."}
    else:
        return {"error": f"Ollama API error: {response.status_code}"}

def update_mongodb(object_id, result):
    """Updates the existing document in MongoDB by adding the analysis result."""
    query = {"_id": ObjectId(object_id)}
    update_data = {"$set": {"analysis_result": result}}

    update_result = collection.update_one(query, update_data)
    
    if update_result.modified_count > 0:
        print("Updated MongoDB document successfully!")
    else:
        print("No document found with the given ID, or no changes made.")

if __name__ == "__main__":
    result = analyze_resume(cvUrl, jobprompt)
    print(json.dumps(result, indent=4))

    if "error" not in result:
        update_mongodb(object_id, result)
