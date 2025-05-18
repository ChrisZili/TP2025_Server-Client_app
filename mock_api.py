from fastapi import FastAPI, File, UploadFile, HTTPException, requests
from fastapi.responses import JSONResponse
import uvicorn
from typing import Optional, Dict, Any
import os
import uuid
from datetime import datetime
import base64
from pydantic import BaseModel
import threading
import time
import requests as req
import json
app = FastAPI()

# In-memory storage for processed images (replace with your actual storage solution)
processed_images = {}

processing_queue = []
queue_lock = threading.Lock()

def processing_worker():
    while True:
        with queue_lock:
            if processing_queue:
                processing_id = processing_queue.pop(0)
            else:
                processing_id = None
        if processing_id:
            time.sleep(15)
            if processing_id in processed_images:
                processed_images[processing_id]["status"] = "processed"
                processed_images[processing_id]["processed_at"] = datetime.now().isoformat()
                processed_images[processing_id]["answer"] = "Zdravý"
                rec_endpoint = processed_images[processing_id].get("recieving_endpoint")
                if rec_endpoint:
                    try:
                        resp = req.post(
                            rec_endpoint,
                            json={
                                "status": "processed",
                                "answer": processed_images[processing_id]["answer"],
                                "file": {
                                    "id": processed_images[processing_id]["id"],
                                    "data": processed_images[processing_id]["data"],
                                    "extension": processed_images[processing_id]["extension"]
                                }
                            }
                        )
                        print("--------------------------------")
                        print(f"Sent result to {rec_endpoint}, status: {resp.status_code}, message: {resp.text}")
                    except Exception as e:
                        print(f"Error sending result: {e}")
        else:
            time.sleep(1)

# Start the worker thread
threading.Thread(target=processing_worker, daemon=True).start()

class FileData(BaseModel):
    id: int
    data: str
    extension: str

class MethodData(BaseModel):
    name: str
    parameters: Optional[Dict[str, Any]] = None

class Metadata(BaseModel):
    original_photo_id: int
    user_id: int
    patient_id: int
    eye_side: str
    diagnosis: str
    device_name: str
    device_type: str
    camera_type: str

class ImagePayload(BaseModel):
    file: FileData
    method: MethodData
    metadata: Metadata
    recieving_endpoint: Optional[str] = None

@app.post("/process-image")
async def process_image(
    payload: ImagePayload
):
    try:
        # print(f"Received payload: {payload}")
        # Decode base64 image
        photo_id = payload.file.id
        # Load image from file path
        image_data = base64.b64decode(payload.file.data)
        print(f"Received payload: {payload.file}")
        print(f"Received payload: {payload.method}")
        print(f"Received payload: {payload.metadata}")
        print(f"Received payload: {payload.recieving_endpoint}")
        
  # Print only the first 20 bytes for brevity

        # Use the provided extension, default to 'png' if not provided
        ext = payload.file.extension.lower()
        if ext not in ["png", "jpg", "jpeg"]:
            raise HTTPException(status_code=400, detail="Unsupported file extension")

        unique_filename = f"{uuid.uuid4().hex}.{ext}"

        # Save the file (optional)
        # file_path = f"uploads/{unique_filename}"
        # os.makedirs("uploads", exist_ok=True)
        # with open(file_path, "wb") as f:
        #     f.write(image_data)

        # Create a processing record
        
        
        # In a real implementation, you would:
        # 1. Save the file to your storage system
        # 2. Queue the processing job
        # 3. Return a processing ID for status checking
        processing_id = payload.file.id
        # Create the initial record in processed_images
        processed_images[processing_id] = {
            "id": processing_id,
            "status": "pending",
            "answer": None,
            "recieving_endpoint": payload.recieving_endpoint,
            "data": base64.b64encode(image_data).decode('utf-8'),
            "extension": ext
            # ... add other fields if needed ...
        }
        with queue_lock:
            processing_queue.append(processing_id)
        
        # print(json.dumps(payload, indent=2))
        
        return JSONResponse({
            "status": "success",
            "message": "Image received and queued for processing",
            "processing_id": processing_id
        })
        
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/processing-status/{processing_id}")
async def get_processing_status(processing_id: str):
    if processing_id not in processed_images:
        raise HTTPException(status_code=404, detail="Processing ID not found")
    
    # In a real implementation, you would check the actual processing status
    # For demo purposes, we'll just return the stored information
    return processed_images[processing_id]

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
