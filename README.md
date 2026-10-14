# FarsiSyntax Lab

**Persian Linguistics × Artificial Intelligence**

A research-driven Persian NLP platform for
Part-of-Speech (POS) tagging using deep learning.

**Creator:** Amir Mehdi Memari

## Project Overview

FarsiSyntax Lab investigates how neural language
models generalize from formal Persian to informal
and conversational Persian.

The research compares:

- A BiLSTM POS tagger trained from scratch
- A fine-tuned ParsBERT token-classification model

Both models were trained using formal Persian data.
Informal Persian data was reserved for evaluation.

## Official Test Results

| Model | Formal Accuracy | Informal Accuracy |
|---|---:|---:|
| BiLSTM | 95.55% | 78.29% |
| ParsBERT | 97.27% | 87.36% |

### Macro F1

| Model | Formal | Informal |
|---|---:|---:|
| BiLSTM | Pending verification | Pending verification |
| ParsBERT | 0.8982 | 0.7334 |

The formal and informal corpora differ in annotation
conventions. Therefore, the evaluation measures
cross-treebank generalization rather than isolating
a pure language-register effect.

## Datasets

- Universal Dependencies Persian-PerDT
- iPerUDT: Informal Persian Universal Dependencies

Dataset repositories:

https://github.com/UniversalDependencies/UD_Persian-PerDT

https://github.com/royakabiri/iPerUDT

Dataset files are not included in this repository.

## Models

### BiLSTM

- PyTorch
- Word embeddings
- Bidirectional LSTM
- 16 Universal POS categories

### ParsBERT

- Base: HooshvareLab/bert-fa-zwnj-base
- Task: Token classification
- Best fine-tuning checkpoint: step 4000
- Maximum sequence length: 256
- Label alignment: first subword of each word

Trained model weights are distributed separately
from the Git source code.

## Web Application

The frontend uses:

- HTML5
- CSS3
- Vanilla JavaScript
- Persian RTL interface
- Animated Ferdowsi-inspired visual design

Frontend hosting target: Vercel.

## REST API

The inference backend uses FastAPI and PyTorch.

Endpoints:

- GET /health
- POST /predict
- GET /docs

Example request:

    {
      "text": "من امروز به دانشگاه می‌روم."
    }

The prediction endpoint requires bearer-token
authentication.

API environment variables:

- PARSBERT_MODEL_SOURCE
- PARSBERT_API_TOKEN
- HF_TOKEN (only when using a private Hugging Face model)

The website's Vercel gateway uses:

- PARSBERT_API_URL
- PARSBERT_API_TOKEN

Never commit real credentials to Git.

## Project Structure

    app/
      index.html
      assets/
        css/
        js/
        images/
      api/
      vercel.json

    backend/
      main.py
      inference.py
      requirements.txt
      Dockerfile

    notebooks/
    reports/
    src/

## Research Limitations

- POS tagging is not dependency parsing.
- Input segmentation may differ from gold UD segmentation.
- Formal and informal datasets use different
  annotation conventions.
- Softmax scores are not calibrated probabilities.
- Cross-domain performance may vary.
- The deployed model must be independently tested.

## Deployment Status

The source code is under development.

The frontend, API gateway, and backend must be
tested together before public release.

## Attribution

ParsBERT:

https://huggingface.co/HooshvareLab/bert-fa-zwnj-base

Dataset and model licensing must be reviewed
before publishing trained weights.

## Creator

**Amir Mehdi Memari**

FarsiSyntax Lab — Persian NLP Research & Development

GitHub: https://github.com/AmirMehdiMemari
