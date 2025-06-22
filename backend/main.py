from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uvicorn
import requests
import uuid
import os
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

app = FastAPI(title="Weather Data System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for weather data
weather_storage: Dict[str, Dict[str, Any]] = {}

DATA_FILE = "weather_data.json"

try:
    with open(DATA_FILE, "r") as f:
        weather_storage = json.load(f)
except:
    weather_storage = {}

def save_data():
    with open(DATA_FILE, "w") as f:
        json.dump(weather_storage, f, indent=2)

class WeatherRequest(BaseModel):
    date: str
    location: str
    notes: Optional[str] = ""

class WeatherResponse(BaseModel):
    id: str

@app.get("/weather_records")
def get_weather_records():
    return list(weather_storage.values())

@app.post("/weather", response_model=WeatherResponse)
async def create_weather_request(request: WeatherRequest):
    """
    Handle weather request submission:
    1. Receive form data (date, location, notes)
    2. Call WeatherStack API for the location
    3. Store combined data with unique ID in memory
    4. Return the ID to frontend
    """
    # Check if API key exists
    api_key = os.getenv("WEATHERSTACK_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="WeatherStack API key not configured")
    
    # Generate unique ID
    weather_id = uuid.uuid4().hex
    
    try:
        # Call WeatherStack API
        response = requests.get(
            "http://api.weatherstack.com/current",
            params={
                "access_key": api_key,
                "query": request.location
            },
            timeout=10
        )
        response.raise_for_status()
        weather_data = response.json()
        
        # Check for API errors
        if "error" in weather_data:
            error_info = weather_data["error"]
            raise HTTPException(
                status_code=400, 
                detail=f"WeatherStack API error: {error_info.get('info', 'Invalid request')}"
            )
        
        # Store the combined data
        weather_storage[weather_id] = {
            "id": weather_id,
            "date": request.date,
            "location": request.location,
            "notes": request.notes,
            "weather_data": weather_data
        }
        save_data()
        return WeatherResponse(id=weather_id)
        
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch weather data: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/weather/{weather_id}")
async def get_weather_data(weather_id: str):
    """
    Retrieve stored weather data by ID.
    This endpoint is already implemented for the assessment.
    """
    if weather_id not in weather_storage:
        raise HTTPException(status_code=404, detail="Weather data not found")
    
    return weather_storage[weather_id]


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)