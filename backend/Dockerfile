# ============================================
# FarsiSyntax Lab - Production FastAPI Backend
# Creator: Amir Mehdi Memari
# ============================================

FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONUTF8=1 \
    HF_HOME=/tmp/huggingface \
    HF_HUB_OFFLINE=1 \
    TRANSFORMERS_OFFLINE=1 \
    HF_HUB_DISABLE_TELEMETRY=1 \
    TOKENIZERS_PARALLELISM=false \
    OMP_NUM_THREADS=2 \
    PARSBERT_MODEL_SOURCE=/app/model-cache/parsbert-pos

WORKDIR /app

# Required system library for CPU PyTorch.
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        libgomp1 && \
    rm -rf /var/lib/apt/lists/*

# Install CPU-only PyTorch first.
COPY requirements.txt ./

RUN python -m pip install --no-cache-dir \
        "torch>=2.2,<3" \
        --index-url https://download.pytorch.org/whl/cpu && \
    python -m pip install --no-cache-dir \
        -r requirements.txt

# Copy only backend application source.
# Large model files are downloaded at runtime.
COPY main.py inference.py model_bootstrap.py ./

# Create writable runtime directories.
# The application does not run as root.
RUN useradd --uid 10001 --create-home appuser && \
    mkdir -p /app/model-cache /tmp/huggingface && \
    chown -R appuser:appuser \
        /app /tmp/huggingface

USER appuser

EXPOSE 7860

# Required runtime environment secrets:
# GITHUB_RELEASE_TOKEN
# PARSBERT_API_TOKEN
#
# Do not store their values in Dockerfile or Git.
#
# Download and verify the model BEFORE serving.
# Only one worker to avoid duplicate model memory.

CMD ["sh", "-c", "set -eu; python model_bootstrap.py; exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-7860} --workers 1"]