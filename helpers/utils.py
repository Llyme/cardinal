# Authentication dependency
import asyncio
import glob
import os
import tempfile
from typing import Optional

from helpers.constants import ALLOWED_SECRET_FILES, SECRET_DIRECTORY


async def check_kubectl_available() -> bool:
    """Check if kubectl is available and configured."""
    try:
        process = await asyncio.create_subprocess_shell(
            "kubectl version --client",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            shell=True,
        )

        await asyncio.wait_for(
            process.communicate(),
            timeout=5,
        )

        return process.returncode == 0

    except Exception:
        return False


async def execute_script(
    script_content: str,
    timeout: int = 300,
) -> tuple[bool, str, Optional[str]]:
    """Execute a bash script and return success status, output, and error."""
    try:
        # Create a temporary script file
        with tempfile.NamedTemporaryFile(
            mode="w",
            suffix=".sh",
            delete=False,
        ) as f:
            f.write(script_content)
            script_path = f.name

        # Make the script executable
        os.chmod(script_path, 0o755)

        # Execute the script with timeout
        process = await asyncio.create_subprocess_shell(
            f"bash {script_path}",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            shell=True,
        )

        try:
            stdout, stderr = await asyncio.wait_for(
                process.communicate(), timeout=timeout
            )
        except asyncio.TimeoutError:
            process.kill()

            await process.wait()

            return (
                False,
                "",
                f"Script execution timed out after {timeout} seconds",
            )

        # Clean up the temporary file
        os.unlink(script_path)

        # Return results
        success = process.returncode == 0
        output = stdout.decode("utf-8") if stdout else ""
        error = stderr.decode("utf-8") if stderr else None

        return success, output, error

    except Exception as e:
        return (
            False,
            "",
            str(e),
        )


async def shell(cmd: str):
    process = await asyncio.create_subprocess_shell(
        cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
        shell=True,
    )

    stdout, stderr = await asyncio.wait_for(
        process.communicate(),
        timeout=10,
    )

    return process, stdout, stderr


def clean_secret_directory():
    if not os.path.exists(SECRET_DIRECTORY):
        return

    if not os.path.isdir(SECRET_DIRECTORY):
        return

    for file_path in glob.glob(f"{SECRET_DIRECTORY}/*"):
        file_name = os.path.basename(file_path)

        if file_name in ALLOWED_SECRET_FILES:
            continue

        if not os.path.isfile(file_path):
            continue

        os.remove(file_path)
