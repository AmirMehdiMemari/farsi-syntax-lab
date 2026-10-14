# ============================================
# FarsiSyntax Lab - Python Inference Service
# Creator: Amir Mehdi Memari
# ============================================

FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HF_HOME=/tmp/huggingface \
    HF_HUB_DISABLE_TELEMETRY=1

WORKDIR /app

# Runtime libraries needed by PyTorch
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libgomp1 && \
    rm -rf /var/lib/apt/lists/*

# Install CPU-only PyTorch to avoid CUDA dependencies
COPY requirements.txt .

RUN python -m pip install --no-cache-dir --upgrade pip && \
    python -m pip install --no-cache-dir \
        torch \
        --index-url https://download.pytorch.org/whl/cpu && \
    python -m pip install --no-cache-dir \
        -r requirements.txt

# Copy application source
COPY main.py inference.py ./

# Run as non-root user
RUN useradd --uid 10001 --create-home appuser && \
    mkdir -p /tmp/huggingface && \
    chown -R appuser:appuser /app /tmp/huggingface

USER appuser

EXPOSE 7860

# Hosting platform may provide PORT dynamically
CMD ["sh", "-c", "exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-7860}"]
