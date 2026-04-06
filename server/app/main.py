import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import CORS_ORIGINS
from app.database import init_db
from app.routers import auth, jztk, word_memorize

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    yield


app = FastAPI(title="interesting-util API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
# 前端开发：VITE_JZTK_API_URL=/api → /api/jztk/...（Vite 原样转发到本服务）
app.include_router(jztk.router, prefix="/api")
app.include_router(word_memorize.router, prefix="/api")
# 生产 Nginx 按 docs/JZTK_NGINX.md rewrite 去掉 /api 后，后端路径为 /jztk/...
app.include_router(jztk.router, prefix="")


@app.get("/api/health")
def health():
    return {"ok": True}
