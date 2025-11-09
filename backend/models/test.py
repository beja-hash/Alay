from sam_2_model import SAMModel
import os



model = SAMModel()

model.segmentationObject(
    conf=0.25,
    task='segment',
    mode='predict',
    imgsz=1024,
    model='sam2_b.pt',
    points=[758, 413],
    labels=[1],
    source='backend/video_from_users/for_test.mov', 
)