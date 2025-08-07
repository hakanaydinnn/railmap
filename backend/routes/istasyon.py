from fastapi import APIRouter
from database import db
from bson.json_util import dumps
from fastapi.responses import Response

router = APIRouter()

@router.get("/")
def get_istasyonlar():
    istasyonlar = list(db["istasyonlar"].find({}))
    return Response(content=dumps(istasyonlar), media_type="application/json")