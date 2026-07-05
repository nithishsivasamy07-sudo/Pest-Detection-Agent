import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")

class PestDetectionDatabase:
    def __init__(self):
        self.client = MongoClient(MONGO_URI)
        self.db = self.client["pest_detection_agent"]
        self.history = self.db["scan_history"]

    def insert_record(self, record):
        """Inserts a scan transaction report into history."""
        try:
            result = self.history.insert_one(record)
            return str(result.inserted_id)
        except Exception as e:
            print(f"Error seeding record: {e}")
            return None

    def get_all_records(self):
        """Retrieves history in descending timestamp order."""
        try:
            records = list(self.history.find().sort("timestamp", -1))
            for doc in records:
                if '_id' in doc:
                    doc['_id'] = str(doc['_id'])
            return records
        except Exception as e:
            print(f"Error querying history: {e}")
            return []

    def delete_record_by_id(self, record_id):
        """Removes a scan record from historical archives."""
        try:
            result = self.history.delete_one({"id": record_id})
            return result.deleted_count > 0
        except Exception as e:
            print(f"Error deleting record: {e}")
            return False

    def health_check(self):
        """Verifies connection liveness with the MongoDB container cluster."""
        try:
            self.client.server_info()
            return True
        except Exception:
            return False
