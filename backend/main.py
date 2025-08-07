from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import os

load_dotenv()

client = MongoClient(os.getenv("MONGO_URL"))
db = client["railmap"]

app = FastAPI()

# CORS ayarı
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/istasyonlar/")
def get_istasyonlar():
    istasyonlar = list(db["istasyonlar"].find({}, {"_id": 0}))
    return JSONResponse(content=istasyonlar)

@app.get("/hatlar/")
def get_hatlar():
    hatlar = list(db["hatlar"].find({}, {"_id": 0}))
    return JSONResponse(content=hatlar)

