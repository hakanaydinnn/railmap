import json
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv("MONGO_URL"))
db = client["railmap"]

hatlar_col = db["hatlar"]
istasyonlar_col = db["istasyonlar"]

# Eski verileri sil
hatlar_col.delete_many({})
istasyonlar_col.delete_many({})

# GeoJSON dosyalarını oku
with open("hatlar.geojson", encoding="utf-8") as f:
    hatlar_data = json.load(f)

with open("istasyon.geojson", encoding="utf-8") as f:
    istasyon_data = json.load(f)

# Doğru: features listesini tek tek ekle
hatlar_col.insert_many(hatlar_data["features"])
istasyonlar_col.insert_many(istasyon_data["features"])

print("Veriler düzgün şekilde MongoDB'ye yüklendi.")
print(f"Hatlar koleksiyonundaki belge sayısı: {hatlar_col.count_documents({})}")
print(f"İstasyonlar koleksiyonundaki belge sayısı: {istasyonlar_col.count_documents({})}")