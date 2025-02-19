import json
import PyPDF2
import docx
import sys
from pymongo import MongoClient
from bson import ObjectId
import numpy as np
from pathlib import Path
import ollama  # Added Ollama import

# Check if job prompt is provided
if len(sys.argv) != 2:
    print("Usage: python script.py <jobprompt>")
    sys.exit(1)

# Get job prompt
jobprompt = sys.argv[1]

# MongoDB Connection
MONGO_URI = "mongodb://localhost:27017"  # Change if necessary
DB_NAME = "cv_database"
COLLECTION_NAME = "candidates"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

def extract_text_from_file(resumepath: str) -> str:
    # Adjust path to go up one level and into backend/uploads
    base_dir = Path(__file__).parent
    uploads_dir = base_dir.parent / 'backend' / 'uploads'

    # Remove leading '/uploads/' if it exists
    resumepath_clean = resumepath.lstrip('/').replace('uploads/', '')

    resume_full_path = (uploads_dir / resumepath_clean).resolve()

    if not resume_full_path.exists():
        raise FileNotFoundError(f"Resume file not found at {resume_full_path}")

    if resume_full_path.suffix == ".pdf":
        with open(resume_full_path, "rb") as file:
            reader = PyPDF2.PdfReader(file)
            text = "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])
    elif resume_full_path.suffix in [".docx", ".doc"]:
        doc = docx.Document(resume_full_path)
        text = "\n".join([para.text for para in doc.paragraphs])
    else:
        raise ValueError("Unsupported file format")
    return text

def analyze_resume(resumepath: str, jobprompt: str):
    resume_text = extract_text_from_file(resumepath)
    
    model = "llama3.2:1b"
    
    prompt = f"""

    You are a very smart AI that can analyze resumes for a job.
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

    Your Response MUST ONLY HAVE THE JSON STRUCTURE as shown above.
    """
    
    try:
        response = ollama.generate(
            model=model,
            prompt=prompt,
            stream=False
        )
        content = response.get('response', '{}')
        analysis_result = json.loads(content)
        return analysis_result
    except json.JSONDecodeError as e:
        return {"error": f"Failed to parse JSON response: {str(e)}"}
    except Exception as e:
        return {"error": f"Ollama error: {str(e)}"}

def update_mongodb(object_id, result):
    """Updates the existing document in MongoDB by adding the analysis result."""
    query = {"_id": ObjectId(object_id)}
    update_data = {"$set": {"analysis_result": result}}

    update_result = collection.update_one(query, update_data)
    
    if update_result.modified_count > 0:
        print(f"Updated document {object_id} successfully!")
    else:
        print(f"No changes made for document {object_id}.")

def normalize_scores(values):
    mean = np.mean(values)
    std_dev = np.std(values)
    
    if std_dev == 0:
        return [50] * len(values)  # Avoid division by zero, assign median score
    
    z_scores = [(x - mean) / std_dev for x in values]
    min_z, max_z = min(z_scores), max(z_scores)
    
    # Map z-scores to 0-100
    normalized_scores = [
        100 * (z - min_z) / (max_z - min_z) if max_z - min_z != 0 else 50
        for z in z_scores
    ]
    
    return normalized_scores

if __name__ == "__main__":
    # Fetch all documents from the collection
    candidates = collection.find()
    ratings = []
    candidate_ids = []
    
    for candidate in candidates:
        object_id = candidate.get("_id")
        cv_url = candidate.get("cvUrl")

        if not cv_url:
            print(f"No CV URL found for document {object_id}, skipping.")
            continue

        print(f"Analyzing resume for document {object_id}...")
        result = analyze_resume(cv_url, jobprompt)
        print(json.dumps(result, indent=4))

        if "rating" in result:
            ratings.append(result["rating"])
            candidate_ids.append(object_id)
            update_mongodb(object_id, result)
        else:
            print(f"Error analyzing document {object_id}: {result.get('error', 'Unknown error')}")
    
    # Normalize scores after all resumes are analyzed
    if ratings:
        normalized_scores = normalize_scores(ratings)
        for object_id, score in zip(candidate_ids, normalized_scores):
            collection.update_one({'_id': object_id}, {'$set': {'analysis_result.normalized_score': score}})
        print("Normalization complete.")
    else:
        print("No valid ratings found for normalization.")