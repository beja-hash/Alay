import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.Routers import get_crdnt
from server.Routers import getVideoForSegmentation

app = FastAPI()
app.include_router(get_crdnt.router)
app.include_router(getVideoForSegmentation.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"]  
)


if __name__ == "__main__":
    uvicorn.run('main:app', reload=True)