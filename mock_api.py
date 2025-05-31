"""
Mock Processing API for Medical Image Processing

This FastAPI application simulates a medical image processing service.
It provides the following key features:

1. Image Processing: Accepts medical images via the /process-image endpoint
2. Health Check: Provides a /health endpoint to verify server availability

The health check endpoint can be used to verify that the processing server
is up and running before attempting to send images for processing.
"""

import random
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
from PIL import Image, ImageDraw, ImageFont
import io

app = FastAPI()

# In-memory storage for processed images (replace with your actual storage solution)
processed_images = {}

processing_queue = []
queue_lock = threading.Lock()


def add_text_to_image(image_data: str) -> str:
    """Add 'Spracovaný' text to the image and return base64 string."""
    try:
        # Decode base64 to image
        image_bytes = base64.b64decode(image_data)
        img = Image.open(io.BytesIO(image_bytes))

        # Create draw object
        draw = ImageDraw.Draw(img)

        # Calculate text position (bottom-right corner with padding)
        text = "Spracovaný"
        text_color = "red"  # Use red color for visibility
        text_size = 60

        # Try to use a system font, fallback to default if not found
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", text_size)
        except:
            font = ImageFont.load_default()

        # Get text size
        text_bbox = draw.textbbox((0, 0), text, font=font)
        text_width = text_bbox[2] - text_bbox[0]
        text_height = text_bbox[3] - text_bbox[1]

        # Calculate position (bottom-right with 20px padding)
        x = img.width - text_width - 20
        y = img.height - text_height - 20

        # Add text with outline for better visibility
        outline_color = "white"
        outline_width = 2
        for adj in range(-outline_width, outline_width + 1):
            for adj2 in range(-outline_width, outline_width + 1):
                draw.text((x + adj, y + adj2), text, font=font, fill=outline_color)
        draw.text((x, y), text, font=font, fill=text_color)

        # Convert back to base64
        buffered = io.BytesIO()
        img.save(buffered, format=img.format if img.format else "PNG")
        return base64.b64encode(buffered.getvalue()).decode('utf-8')
    except Exception as e:
        print(f"Error processing image: {e}")
        return image_data  # Return original image if processing fails


def processing_worker():
    while True:
        with queue_lock:
            if processing_queue:
                processing_id = processing_queue.pop(0)
            else:
                processing_id = None
        if processing_id:
            time.sleep(5)  # Simulate processing time
            if processing_id in processed_images:
                # Add text to the image
                processed_images[processing_id]["data"] = add_text_to_image(processed_images[processing_id]["data"])
                processed_images[processing_id]["status"] = "processed"
                processed_timestamp = datetime.now()
                processed_images[processing_id]["processed_at"] = processed_timestamp.isoformat()
                processed_images[processing_id]["answer"] = random.choice(
                    ["zdravý", "retinopatia", "glaukóm", "leukokória", "amblyopia", "strabizmus"])
                rec_endpoint = processed_images[processing_id].get("recieving_endpoint")
                if rec_endpoint:
                    try:
                        resp = req.post(
                            rec_endpoint,
                            json={
                                "status": "processed",
                                "answer": processed_images[processing_id]["answer"],
                                "processed_at": processed_timestamp.isoformat(),  # Include timestamp in response
                                "created_at": processed_images[processing_id]["created_at"],  # Include creation timestamp
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
            "extension": ext,
            "created_at": datetime.now().isoformat()
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


@app.get("/health")
async def health_check():
    """
    Health check endpoint for the mock API.
    Returns a 200 status code when the server is running properly.
    """
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "mock-processing-api",
        "version": "1.0.0"
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
