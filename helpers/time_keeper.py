# Authentication dependency
import re
from datetime import timedelta

RX = r"(\d+)([dhms])"


def parse_duration(text: str):
    map = {
        "d": 0,
        "h": 0,
        "m": 0,
        "s": 0,
    }

    for value, unit in re.findall(
        RX,
        text,
    ):
        map[unit] += int(value)

    return timedelta(
        days=map["d"],
        hours=map["h"],
        minutes=map["m"],
        seconds=map["s"],
    )
