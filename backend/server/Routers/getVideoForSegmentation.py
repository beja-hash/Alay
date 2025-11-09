from fastapi import APIRouter, UploadFile, File, Form
import json
from models.sam_2_model import SAMModel
import os
import shutil

router = APIRouter(prefix='/get_full_video', tags=['Get Full Video'])



@router.post('/get_full_video')
async def get_video(video: UploadFile = File(...), coordinates: str = Form(...)):
    
    save_path = "video_from_users/video.mp4"
    with open(save_path, 'wb') as buffer:
        shutil.copyfileobj(video.file, buffer)

    coordinates =  json.loads(coordinates) 

    model = SAMModel()
    results = model.segmentationObject(
        conf=0.25,
        task='segment',
        mode='predict',
        imgsz=1024,
        model='sam2_b.pt',
        points=coordinates,
        labels=[1],
        source=save_path, 
    )

    return results
    