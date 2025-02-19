from pymongo import MongoClient
import numpy as np

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

def fetch_and_normalize_scores():
    client = MongoClient("mongodb://localhost:27017/")  # Adjust if needed
    db = client["job_analysis"]  # Ensure consistency with your previous script
    collection = db["resume_reviews"]

    # Fetch all documents where analysis_result.rating exists
    docs = list(collection.find({"analysis_result.rating": {"$exists": True}}, {"analysis_result.rating": 1}))
    
    if not docs:
        print("No valid ratings found.")
        return []
    
    ratings = [doc["analysis_result"]["rating"] for doc in docs]
    normalized_scores = normalize_scores(ratings)

    # Update database with normalized scores
    for doc, score in zip(docs, normalized_scores):
        collection.update_one({'_id': doc['_id']}, {'$set': {'analysis_result.normalized_score': score}})
    
    print("Normalization complete.")
    return normalized_scores

# Example Usage
if __name__ == "__main__":
    fetch_and_normalize_scores()
