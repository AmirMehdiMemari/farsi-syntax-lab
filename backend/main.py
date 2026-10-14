"""
FarsiSyntax Lab — REST API

Creator: Amir Mehdi Memari
Model: Fine-tuned ParsBERT
Task: Persian Part-of-Speech Tagging

Endpoints:
    GET  /health
    POST /predict
    GET  /docs
"""

import os
import secrets
import logging

from typing import Literal

from fastapi import (
    FastAPI,
    Header,
    HTTPException,
    Depends
)

from pydantic import (
    BaseModel,
    Field,
    ConfigDict,
    field_validator
)

from inference import (
    analyze_text,
    get_predictor
)


# ============================================
# APPLICATION CONFIGURATION
# ============================================

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s: %(message)s"
)

logger = logging.getLogger("farsisyntax")

APP_NAME = "FarsiSyntax Lab API"
CREATOR = "Amir Mehdi Memari"
VERSION = "1.0.0"

MAX_CHARACTERS = 1000


# ============================================
# INITIALIZE FASTAPI
# ============================================

app = FastAPI(
    title=APP_NAME,
    description=(
        "Persian linguistic analysis using a "
        "fine-tuned ParsBERT model. "
        "Created by Amir Mehdi Memari."
    ),
    version=VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)


# ============================================
# REQUEST AND RESPONSE SCHEMAS
# ============================================

POSLabel = Literal[
    "ADJ",
    "ADP",
    "ADV",
    "AUX",
    "CCONJ",
    "DET",
    "INTJ",
    "NOUN",
    "NUM",
    "PART",
    "PRON",
    "PROPN",
    "PUNCT",
    "SCONJ",
    "VERB",
    "X"
]


class PredictionRequest(BaseModel):

    model_config = ConfigDict(extra="forbid")

    text: str = Field(
        ...,
        min_length=1,
        max_length=MAX_CHARACTERS,
        description="Persian text to analyze"
    )

    @field_validator("text")
    @classmethod
    def validate_text(cls, value):

        cleaned = value.strip()

        if not cleaned:
            raise ValueError(
                "Input text cannot be empty."
            )

        return cleaned


class TokenPrediction(BaseModel):

    word: str = Field(min_length=1)

    pos: POSLabel

    confidence: float = Field(
        ge=0.0,
        le=1.0,
        description=(
            "Model softmax score; "
            "not a calibrated probability."
        )
    )


class PredictionResponse(BaseModel):

    model: str

    creator: str

    tokens: list[TokenPrediction]


class HealthResponse(BaseModel):

    status: str

    service: str

    version: str

    model_loaded: bool


# ============================================
# API AUTHENTICATION
# ============================================

def verify_api_token(
    authorization: str | None = Header(
        default=None
    )
):
    """
    The gateway and backend share a secret
    stored in PARSBERT_API_TOKEN.

    The API fails closed if it is not configured.
    """

    expected_token = os.getenv(
        "PARSBERT_API_TOKEN", ""
    )

    if not expected_token:
        logger.error(
            "PARSBERT_API_TOKEN is not configured."
        )

        raise HTTPException(
            status_code=503,
            detail="API authentication is not configured."
        )

    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authentication required.",
            headers={
                "WWW-Authenticate": "Bearer"
            }
        )

    scheme, separator, supplied_token = (
        authorization.partition(" ")
    )

    if (
        not separator
        or scheme.lower() != "bearer"
        or not supplied_token
        or not secrets.compare_digest(
            supplied_token,
            expected_token
        )
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid API credentials.",
            headers={
                "WWW-Authenticate": "Bearer"
            }
        )

    return True


# ============================================
# HEALTH ENDPOINT
# ============================================

@app.get(
    "/health",
    response_model=HealthResponse,
    tags=["System"]
)
def health():

    # Checking health does not download or
    # initialize the large ParsBERT model.

    loaded = (
        get_predictor.cache_info().currsize > 0
    )

    return HealthResponse(
        status="ok",
        service=APP_NAME,
        version=VERSION,
        model_loaded=loaded
    )


# ============================================
# PREDICTION ENDPOINT
# ============================================

@app.post(
    "/predict",
    response_model=PredictionResponse,
    tags=["Persian NLP"],
    dependencies=[
        Depends(verify_api_token)
    ]
)
def predict(request: PredictionRequest):

    """
    Analyze Persian text with the trained
    ParsBERT token-classification model.

    Returns word-level Universal POS tags
    and their corresponding softmax scores.
    """

    try:

        # Loads the model lazily on first use.
        # The trained model remains cached.

        result = analyze_text(
            request.text
        )

        return PredictionResponse(
            **result
        )

    except ValueError as error:

        raise HTTPException(
            status_code=422,
            detail=str(error)
        ) from error

    except RuntimeError:

        logger.exception(
            "ParsBERT model runtime failure."
        )

        raise HTTPException(
            status_code=503,
            detail=(
                "The Persian NLP model "
                "is currently unavailable."
            )
        )

    except Exception:

        logger.exception(
            "Unexpected prediction failure."
        )

        raise HTTPException(
            status_code=500,
            detail="Internal inference error."
        )


# ============================================
# APPLICATION INFORMATION
# ============================================

@app.get(
    "/",
    tags=["System"]
)
def root():

    return {
        "application": APP_NAME,
        "version": VERSION,
        "creator": CREATOR,
        "model": "Fine-tuned ParsBERT",
        "task": "Persian POS Tagging",
        "pos_categories": 16,
        "documentation": "/docs"
    }
