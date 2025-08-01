import asyncio
import re
from typing import Iterable, Optional

from fastapi import HTTPException
from pydantic import BaseModel, Field, computed_field

from helpers.time_keeper import parse_duration

RX_NS_PODS = r"^(\S+)\s+(\d)\/(\d)\s+(\S+)\s+(\d+)(?:\s+\((\S+)\s+ago\))?\s+(\S+)$"


class Pod(BaseModel):
    namespace: str
    name: str
    ready_count: int
    ready_total: int
    status: str
    restart_count: int
    restart_age: Optional[float] = Field(
        description="Age in seconds.",
    )
    age: float = Field(
        description="Age in seconds.",
    )

    @computed_field
    @property
    def immediate_age(self) -> float:
        if self.restart_age is not None:
            return self.restart_age

        return self.age

    @classmethod
    def from_cli(cls, namespace: str, lines: Iterable[str]):
        for line in lines:
            match = re.match(RX_NS_PODS, line)

            if match is None:
                continue

            (
                name,
                ready_count,
                ready_total,
                status,
                restart_count,
                restart_age,
                age,
            ) = match.groups()

            yield cls(
                namespace=namespace,
                name=name,
                ready_count=int(ready_count),
                ready_total=int(ready_total),
                status=status,
                restart_count=int(restart_count),
                restart_age=parse_duration(restart_age).total_seconds()
                if restart_age
                else None,
                age=parse_duration(age).total_seconds(),
            )

    @classmethod
    async def from_namespace(cls, namespace: str):
        try:
            process = await asyncio.create_subprocess_shell(
                f"kubectl get pods -n {namespace}",
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

    @classmethod
    async def from_deployment(cls, namespace: str, deployment: str):
        try:
            process = await asyncio.create_subprocess_shell(
                f"kubectl get pods -n {namespace} -l app={deployment}",
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
