"""
驾考刷题演示题库（与前端 jztk.js / normalizeJztkQuestion 字段一致）。
生产可改为读数据库或转发第三方；此处仅保证本地 FastAPI 与 Vite 代理可联调。
"""

from __future__ import annotations

from typing import Any

# 与 Juhe 单项字段对齐：id, question, answer, item1–4, explains, url
_BANK_SUBJECT_1: list[dict[str, Any]] = [
    {
        "id": "demo-k1-001",
        "question": "驾驶机动车在道路上违反道路交通安全法的行为，属于什么行为？",
        "answer": "2",
        "item1": "过失行为",
        "item2": "违法行为",
        "item3": "违章行为",
        "item4": "违规行为",
        "explains": "违反《道路交通安全法》即属违法行为。",
        "url": None,
    },
    {
        "id": "demo-k1-002",
        "question": "机动车驾驶人违法驾驶造成重大交通事故构成犯罪的，依法追究什么责任？",
        "answer": "1",
        "item1": "刑事责任",
        "item2": "民事责任",
        "item3": "经济责任",
        "item4": "行政责任",
        "explains": "构成犯罪应依法追究刑事责任。",
        "url": None,
    },
    {
        "id": "demo-k1-003",
        "question": "遇到前方车辆缓慢行驶时怎样行驶？",
        "answer": "3",
        "item1": "从两侧随意超越",
        "item2": "从右侧超越",
        "item3": "依次排队行驶",
        "item4": "从左侧超越",
        "explains": "应依次排队，不得穿插超越。",
        "url": None,
    },
]

_BANK_SUBJECT_4: list[dict[str, Any]] = [
    {
        "id": "demo-k4-001",
        "question": "雨天行车，为避免「水滑」现象，应如何操作？",
        "answer": "2",
        "item1": "急打方向避让",
        "item2": "降低车速，平稳通过",
        "item3": "紧急制动",
        "item4": "加速通过积水",
        "explains": "降低车速、保持方向稳定，避免急刹急转。",
        "url": None,
    },
    {
        "id": "demo-k4-002",
        "question": "高速公路发生故障停车后，应在来车方向多少米以外设置警告标志？",
        "answer": "4",
        "item1": "50 米",
        "item2": "100 米",
        "item3": "120 米",
        "item4": "150 米",
        "explains": "普通路 50–100 米；高速公路 150 米以外。",
        "url": None,
    },
    {
        "id": "demo-k4-003",
        "question": "驾驶机动车通过学校区域时应注意什么？",
        "answer": "1",
        "item1": "减速慢行，注意行人",
        "item2": "鸣喇叭催促",
        "item3": "可正常速度通过",
        "item4": "仅注意机动车即可",
        "explains": "学校区域应低速、礼让行人。",
        "url": None,
    },
]


def jztk_pool_for_subject(subject: int) -> list[dict[str, Any]]:
    """subject：1=科目一，4=科目四；其它值按科目一处理。"""
    if subject == 4:
        return list(_BANK_SUBJECT_4)
    return list(_BANK_SUBJECT_1)
