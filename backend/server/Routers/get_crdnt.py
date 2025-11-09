from fastapi import APIRouter, UploadFile, File, Form
import json
from models.sam_frame import segmetnation_first_frame
import os

router = APIRouter(prefix="/get_first_frame", tags=["Get First Frame"])

@router.post("/coordinates")
async def get_coordinates(
    frame: UploadFile = File(...),
    coordinates: str = Form(...)
):
    

    
    try:
        coords = json.loads(coordinates)
    except json.JSONDecodeError:
        return {"error": "Некорректный формат координат"}
    

    contents = await frame.read()
    print(type(contents))  
    print(contents[:20]) 

    results = segmetnation_first_frame(contents, coords)
    
    if hasattr(results, 'tojson'):
        results_json = results.tojson()
    else:
        results_json = str(results)

    return {
        "status": "ok",
        "message": "Кадр и координаты получены",
        "coordinates_count": len(coords),
        'results': results_json
    }
