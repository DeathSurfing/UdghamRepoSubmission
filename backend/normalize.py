import numpy as np
from pymongo import MongoClient

# MongoDB Setup
MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "cv_database"
COLLECTION_NAME = "candidates"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

def normalize_scores(values):
    """Normalize scores using z-score normalization."""
    mean, std_dev = np.mean(values), np.std(values)
    if std_dev == 0:
        return [50] * len(values)  # Default score if no variation
    return [50 + (50 * (x - mean) / std_dev) for x in values]

def normalize_candidate_ratings():
    """Fetch ratings, normalize them, and update MongoDB."""
    docs = list(collection.find({"analysis_result.rating": {"$exists": True}}, {"analysis_result.rating": 1}))
    
    if not docs:
        print("⚠️ No ratings found to normalize.")
        return
    
    ratings = [doc["analysis_result"]["rating"] for doc in docs]
    normalized_scores = normalize_scores(ratings)

    updates = [
        {"filter": {"_id": doc["_id"]}, "update": {"$set": {"analysis_result.normalized_score": score}}}
        for doc, score in zip(docs, normalized_scores)
    ]

    # Bulk update
    if updates:
        for update in updates:
            collection.update_one(update["filter"], update["update"])
    
    print("✅ Normalization complete!")

if __name__ == "__main__":
    normalize_candidate_ratings()
