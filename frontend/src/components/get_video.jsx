import { useState, useEffect } from "react";

export default function UploadVideo() {
  const [video, setVideo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [frame, setFrame] = useState(null); // первый кадр
  const [loading, setLoading] = useState(false);
  const [coordinates, setCoordinates] = useState([]);
  const [newFrame, setNewFrame] = useState(null);
  const [loadingVideo, setLoadingVideo] = useState(false)
  const [newVideo, setNewVideo] = useState(null)
  
  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("video/")) {
      setVideo(file);
      setPreview(URL.createObjectURL(file));
    } else {
      alert("Иди нахуй");
    }
  };

  // Извлекаем первый кадр
  useEffect(() => {
    if (!preview) return;
    const videoEl = document.createElement("video");
    videoEl.src = preview;
    videoEl.currentTime = 0.1;

    videoEl.addEventListener("loadeddata", () => {
      const canvas = document.createElement("canvas");
      canvas.width = videoEl.videoWidth;
      canvas.height = videoEl.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
      const imageUrl = canvas.toDataURL("image/png");
      setFrame(imageUrl);
    });
  }, [preview]);



const sendFrameToBackend = async (frame, coordinates) => {
  try {
    if (!frame) return console.error("Нет кадра для отправки");

    // Убираем префикс Base64
    const base64Data = frame.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });

    // Формируем форму
    const formData = new FormData();
    formData.append('frame', blob, 'frame.jpg'); // имя совпадает с backend
    formData.append('coordinates', JSON.stringify(coordinates));

    // Отправляем POST
    const response = await fetch('http://127.0.0.1:8000/get_first_frame/coordinates', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error('Ошибка при отправке данных');

    const data = await response.json();
    const results = data.results;
    setNewFrame('data:image/jpeg;base64,' + results); // обновляем состояние с новым кадром
    console.log('Ответ сервера:', data);
  } catch (error) {
    console.error('Ошибка при отправке кадра:', error);
  }
};

  const handleUpload = async () => {
    if (!video) return alert("Сначала выбери видео!");
    const formData = new FormData();
    formData.append("file", video);
    setLoading(true);
    alert("Видео успешно загружено!");
    setLoading(false);
  };

  //вычисление реальных координат клика
const handleImageClick = (e) => {
  const rect = e.target.getBoundingClientRect();

  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const displayWidth = rect.width;
  const displayHeight = rect.height;
  const naturalWidth = e.target.naturalWidth;
  const naturalHeight = e.target.naturalHeight;

  const realX = Math.round((x / displayWidth) * naturalWidth);
  const realY = Math.round((y / displayHeight) * naturalHeight);

  const newCoords = [realX, realY];
  setCoordinates(newCoords);

  console.log("Координаты клика:", newCoords);
  sendFrameToBackend(frame, newCoords);
};

const handleClickPostVideo = async () =>{
  console.log('Пошло')
  if(!video) return alert('Ошибка при выборе видео')
  setLoadingVideo(true)

  const formData = new FormData()
  formData.append('video', video)
  formData.append('coordinates', JSON.stringify(coordinates));
  console.log(coordinates)
  try{
    const response = await fetch('http://127.0.0.1:8000/get_full_video/get_full_video', {
      method: "POST",
      body: formData,
    })

    if(!response.ok) return alert('Ошибка при загрузке видео')

    const data = await response.blob()
    setNewVideo(data)
    console.log('Ответ от сервера:', data)
    alert('Видео успешно отправлено')
  } catch(error){
    console.error("Ошибка при отправке видео:", error)
  } finally{
    setLoadingVideo(false)
  }

}

const DelNewFrame = () =>{
  setNewFrame(null)
  setCoordinates([])

}


  return (
    <div>
      <div style={{display: 'flex'}}>
        <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          padding: "20px",
          border: "1px solid #ccc",
          borderRadius: "10px",
          width: "60%",
          height: '600px',
          marginLeft: '2%',
          overflow: "hidden",
        }}
      >
        <h2>Загрузить видео</h2>

        <input type="file" accept="video/*" onChange={handleChange} />

        {preview && (
          <video
            src={preview}
            controls
            style={{
              width: "100%",           // 🔹 видео занимает всю ширину контейнера
              height: "80%",          // 🔹 ограничено по высоте блока
              objectFit: "contain",    // 🔹 вписывается целиком, не обрезаясь
              borderRadius: "8px",
              marginTop: "10px",
              backgroundColor: "#000", // 🔹 если видео не заполнило всё — фон чёрный
            }}
          />
        )}

        
        <div className="flex flex-col items-center mt-8">
        {newVideo ? (
          <video
            src={URL.createObjectURL(newVideo)}
            controls
            style={{ width: "100%", borderRadius: "8px", marginTop: "10px" }}
          />
        ) : (
          <div></div>
        )}
      </div>

        
      </div>

      
      <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            padding: "20px",
            border: "1px solid #ccc",
            borderRadius: "10px",
            width: "34%",
            height: "600px",
            marginLeft: "2%",
            marginRight: "2%",
            overflow: "hidden", // не даст ничего выйти за рамки
          }}
        >
          <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
            
              {newFrame ? (
                <div style={{ width: "100%", height: "100%" }}>
                  <img
                    src={newFrame}
                    alt="Generated"
                    style={{
                      height: "auto",         // сохраняет пропорции
                      width: '100%',
                      maxHeight: "100%",      // не вылезет за 400px
                      borderRadius: "8px",
                      marginTop: "10px",
                      objectFit: "contain",   // влезает целиком без обрезки
                    }}
                  />
                  
                </div>
              ) : (
                <div style={{ width: "100%", height: "100%" }}>
                  {frame && (
                    <img
                      src={frame}
                      alt="Первый кадр"
                      style={{
                        width: "100%",
                        height: "auto",
                        maxHeight: "100%",
                        borderRadius: "8px",
                        cursor: "crosshair",
                        marginTop: "10px",
                        objectFit: "contain",
                      }}
                      onClick={handleImageClick}
                    />
                  )}
                </div>
              )}
              </div>
              {newFrame ? (
                <div style={{display:'flex'}}>
                  <button onClick={handleClickPostVideo}>Заблюрить объект на видео</button>
                  <button onClick={DelNewFrame}>Повторить</button>
                </div>
              ) : (
                <div></div>
              )}
            
            
          
      </div>

    </div>
    
      <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            padding: "20px",
            border: "1px solid #ccc",
            borderRadius: "10px",
            width: "94%",
            height: '68 0px',
            marginLeft: '2%',
            marginRight: '2%',
            marginTop: '2%',
            overflow: "hidden",
            backgroundColor: "#000" 
        }}
>
          <div className="flex flex-col items-center mt-8">
          {newVideo ? (
            <video
              src={URL.createObjectURL(newVideo)}
              controls
              style={{
                width: "100%",           // 🔹 видео занимает всю ширину контейнера
                height: "80%",          // 🔹 ограничено по высоте блока
                objectFit: "contain",    // 🔹 вписывается целиком, не обрезаясь
                borderRadius: "8px",
            }}
            />
          ) : (
            <div></div>
          )}
        </div>
      </div>


    </div>
    
  );
}
