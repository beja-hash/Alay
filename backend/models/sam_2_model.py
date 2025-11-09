from ultralytics.models.sam import SAM2VideoPredictor
from fastapi.responses import StreamingResponse
import cv2
import numpy as np
import io
import os


class SAMModel:
    @staticmethod
    def segmentationObject(conf, task, mode, imgsz, model, points, labels, source):
        """
        Выполняет сегментацию видео через SAM2 и возвращает обработанное видео как StreamingResponse.
        """

        # --- Настройки SAM2 ---
        overrides = dict(conf=conf, task=task, mode=mode, imgsz=imgsz, model=model)
        predictor = SAM2VideoPredictor(overrides=overrides)
        results = predictor(source=source, points=points, labels=labels, stream=True)

        # --- Читаем инфо о видео ---
        cap = cv2.VideoCapture(source)
        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        cap.release()

        # --- Временный путь для записи ---
        temp_path = "video_results/temp_output.mp4"
        os.makedirs("video_results", exist_ok=True)

        # --- Настраиваем запись видео ---
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(temp_path, fourcc, fps, (width, height))

        # --- Обрабатываем кадры ---
        for i, result in enumerate(results):
            frame = result.orig_img.copy()

            if result.masks is not None:
                for mask in result.masks.data:
                    mask = mask.cpu().numpy().astype(np.uint8)
                    mask_3ch = np.repeat(mask[:, :, np.newaxis], 3, axis=2)
                    blurred = cv2.GaussianBlur(frame, (181, 181), 0)
                    frame = np.where(mask_3ch == 1, blurred, frame)

            out.write(frame)
            print(f"Обработан кадр {i + 1}")

        out.release()
        print(f"✅ Видео обработано: {temp_path}")

        # --- Читаем как байты и возвращаем ---
        video_bytes = io.BytesIO()
        with open(temp_path, "rb") as f:
            video_bytes.write(f.read())
        video_bytes.seek(0)

        # Можно удалить временный файл, если не нужен
        os.remove(temp_path)

        return StreamingResponse(video_bytes, media_type="video/mp4")
