import asyncio
import re
from typing import Iterable

from fastapi import HTTPException
from pydantic import BaseModel, Field

from helpers.time_keeper import parse_duration

RX_NS_DEPLOYMENTS = r"^(\S+)\s+(\d+)\/(\d+)\s+(\d+)\s+(\d+)\s+(\S+)$"


class Deployment(BaseModel):
    namespace: str
    name: str
    ready_count: int
    ready_total: int
    up_to_date: int
    available: int
    age: float = Field(
        description="Age in seconds.",
    )

    @classmethod
    def from_cli(cls, namespace: str, lines: Iterable[str]):
        for line in lines:
            match = re.match(RX_NS_DEPLOYMENTS, line)

            if match is None:
                continue

            (
                name,
                ready_count,
                ready_total,
                up_to_date,
                available,
                age,
            ) = match.groups()

            yield cls(
                namespace=namespace,
                name=name,
                ready_count=int(ready_count),
                ready_total=int(ready_total),
                up_to_date=int(up_to_date),
                available=int(available),
                age=parse_duration(age).total_seconds(),
            )

    @classmethod
    async def from_namespace(cls, namespace: str):
        try:
            process = await asyncio.create_subprocess_shell(
                f"kubectl get deployments -n {namespace}",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                shell=True,
            )

            stdout, stderr = await asyncio.wait_for(
                process.communicate(),
                timeout=10,
            )

            stdout = stdout.decode("utf-8")

            if process.returncode != 0:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to get pods: {stderr.decode('utf-8')}",
                )

            return cls.from_cli(
                namespace,
                stdout.splitlines()[1:],
            )

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=str(e),
            )
