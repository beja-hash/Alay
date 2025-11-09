from ultralytics.models.sam import Predictor as SAMPredictor 
import cv2
import numpy as np
import tempfile
import base64



def segmetnation_first_frame(frame, coordinates):


    np_arr = np.frombuffer(frame, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as temp_img_file:
        temp_path = temp_img_file.name
        cv2.imwrite(temp_path, img)

    overrides = dict(conf=0.25, task='segment', mode='predict', imgsz=1024, model='mobile_sam.pt')
    predictor = SAMPredictor(overrides=overrides)


    

    predictor.set_image(cv2.imread(temp_path))


    results = predictor(points=coordinates, labels=[1])


    for i, result in enumerate(results):
        frame = result.orig_img.copy()

        if result.masks is not None:
            for mask in result.masks.data:
                mask = mask.cpu().numpy().astype(np.uint8)
                mask_3ch = np.repeat(mask[:, :, np.newaxis], 3, axis=2)

                blurred = cv2.GaussianBlur(frame, (181, 181), 0)

                frame = np.where(mask_3ch == 1, blurred, frame)

                _, buffer = cv2.imencode('.jpg', frame)
                frame_base64 = base64.b64encode(buffer).decode('utf-8')



                return frame_base64
    
    
