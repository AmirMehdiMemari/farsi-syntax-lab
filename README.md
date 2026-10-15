# FarsiSyntax Lab

**Persian Part-of-Speech Tagging with Deep Learning**

**Research and implementation:** Amir Mehdi Memari

FarsiSyntax Lab is an experimental natural language processing
project investigating how neural POS taggers trained on formal
Persian generalize to informal Persian.

The project compares a BiLSTM baseline with a fine-tuned
ParsBERT token-classification model. It includes evaluation
artifacts, research notebooks maintained locally, and
an optional FastAPI inference backend.

## Research Question

How well do models trained on formal Persian transfer to
informal and conversational Persian without additional
informal-domain fine-tuning?

## Models

### BiLSTM Baseline

A recurrent neural sequence-tagging baseline trained on
formal Persian annotations.

### Fine-Tuned ParsBERT

- Base model: HooshvareLab/bert-fa-zwnj-base
- Task: token classification / Universal POS tagging
- Output classes: 16 Universal POS categories
- Selected checkpoint: 4000
- Model format: safetensors
- Supports word-level prediction using subword alignment

The inference implementation preserves Persian zero-width
non-joiners in tokenization.

## Evaluation Results

| Model | PerDT Accuracy | PerDT Macro F1 | iPerUDT Accuracy | iPerUDT Macro F1 |
|---|---:|---:|---:|---:|
| BiLSTM | 95.55% | 0.8831 | 78.29% | 0.6544 |
| ParsBERT | **97.27%** | **0.8982** | **87.36%** | **0.7334** |

The results refer to the recorded evaluation of the
respective trained models.

### Interpretation

ParsBERT outperformed the BiLSTM baseline in these tests
on both formal and informal Persian.

However, PerDT and iPerUDT differ in their annotation
conventions. The cross-treebank evaluation therefore
cannot isolate the effect of language register alone.

Model confidence values are softmax scores and should
not be interpreted as calibrated correctness probabilities.

## Datasets

### Persian PerDT

Universal Dependencies Persian-PerDT was used for
formal Persian training and evaluation.

https://github.com/UniversalDependencies/UD_Persian-PerDT

### iPerUDT

Informal Persian Universal Dependencies was used for
cross-treebank, informal-domain evaluation.

https://github.com/royakabiri/iPerUDT

Dataset files are not committed to this repository.
Consult the respective dataset sources for their licenses
and usage conditions.

## Project Components

| Path | Purpose |
|---|---|
| `backend/inference.py` | Fine-tuned ParsBERT POS inference |
| `backend/main.py` | Optional authenticated FastAPI backend |
| `backend/requirements.txt` | Python inference dependencies |
| `backend/model_bootstrap.py` | Verified private model package loader |
| `backend/Dockerfile` | Optional backend container configuration |
| `models/` | Local checkpoints, release archives and diagnostics; Git-ignored |
| `notebooks/public/` | Clean BiLSTM and ParsBERT research notebooks |
| `reports/` | Research evaluation and dataset reports |

The two cleaned research notebooks are in `notebooks/public/`.
Original executed notebooks remain local and are Git-ignored.
The published notebooks retain experiment code but omit saved outputs.
Some Colab-specific paths require adjustment before rerunning.
The `reports/` directory contains recorded research artifacts.

## Model Availability

The fine-tuned checkpoint is not stored in ordinary
Git history because its weights are approximately
449 MiB.

A verified archive is stored in the private GitHub
Release tagged `parsbert-pos-v1`.

Access to that private release requires repository
authorization. The model files can also be loaded
directly from a local `models/parsbert-pos/` directory.

The SHA-256 of the model weights is:

`c4baf420f72f7a5191a334b5ed179a825e7b0d9ee9bcc30c09450ec9329494c0`

## Running Local Inference

The existing development environment uses:

- Python 3.11
- PyTorch (CPU)
- Transformers 4.57.6
- FastAPI

From the repository root, in Windows PowerShell:

```powershell
conda activate farsi-syntax

$env:PARSBERT_MODEL_SOURCE = (
    Resolve-Path ".\models\parsbert-pos"
).Path

$env:PARSBERT_API_TOKEN = [guid]::NewGuid().ToString("N")

python -m uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8000
```

Open `http://127.0.0.1:8000/docs` to inspect the
API documentation. The `/predict` endpoint requires
the Bearer token configured in the same terminal.

The API accepts Persian text and returns word-level
POS tags and model scores.

## Verified Implementation Status

- Fine-tuned ParsBERT checkpoint recovered and verified
- All 16 model labels validated
- Local inference tested successfully
- FastAPI health and authentication tests passed
- Persian UTF-8 request and response integrity verified
- Private model release download and checksum verified

## Scope and Limitations

This repository focuses on experimental Persian NLP,
model evaluation, and reproducible inference.

The work is not intended to claim that informal-domain
performance measures a language-register effect alone.
Dataset annotation differences and possible domain
shift should be considered when interpreting results.

The optional FastAPI implementation can be run locally.
No continuously hosted inference service is required.

## Research Direction

Future work may include error analysis by POS category,
comparisons of tokenization behavior across registers,
additional domain-shift experiments, and improved
evaluation reproducibility.

---

**FarsiSyntax Lab — Persian Language Modeling Research**