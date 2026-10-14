"""
FarsiSyntax Lab
Persian Part-of-Speech Inference Engine

Creator: Amir Mehdi Memari

Model: Fine-tuned ParsBERT
Task: Universal POS tagging (16 categories)
"""

import os
from functools import lru_cache

import regex
import torch

from transformers import (
    AutoTokenizer,
    AutoModelForTokenClassification
)


# ============================================
# CONFIGURATION
# ============================================

MODEL_NAME = "FarsiSyntax Lab ParsBERT"
CREATOR = "Amir Mehdi Memari"

MAX_LENGTH = 256
MAX_CHARACTERS = 1000

POS_TAGS = {
    "ADJ", "ADP", "ADV", "AUX",
    "CCONJ", "DET", "INTJ", "NOUN",
    "NUM", "PART", "PRON", "PROPN",
    "PUNCT", "SCONJ", "VERB", "X"
}

# Unicode-aware Persian word segmentation.
# Preserves zero-width non-joiners inside words.
WORD_PATTERN = regex.compile(
    r"[\p{L}\p{M}\p{N}]+"
    r"(?:[\u200c\u200d][\p{L}\p{M}\p{N}]+)*"
    r"|[^\s]"
)


# ============================================
# PARSBERT INFERENCE CLASS
# ============================================

class PersianPOSInference:

    def __init__(self):

        print("[FarsiSyntax] Initializing ParsBERT...")

        # Must point to our TRAINED model.
        # Can be a local directory or Hugging Face repo.
        self.model_source = os.getenv(
            "PARSBERT_MODEL_SOURCE", ""
        ).strip()

        if not self.model_source:
            raise RuntimeError(
                "PARSBERT_MODEL_SOURCE is not configured. "
                "Use the fine-tuned model repository "
                "or exported local model directory."
            )

        token = os.getenv("HF_TOKEN") or None

        self.device = torch.device(
            "cuda" if torch.cuda.is_available()
            else "cpu"
        )

        print("[FarsiSyntax] Model:", self.model_source)
        print("[FarsiSyntax] Device:", self.device)

        # Load tokenizer
        self.tokenizer = AutoTokenizer.from_pretrained(
            self.model_source,
            use_fast=True,
            token=token
        )

        if not self.tokenizer.is_fast:
            raise RuntimeError(
                "A fast tokenizer is required "
                "for word-to-subword alignment."
            )

        # Load our trained POS classifier
        self.model = (
            AutoModelForTokenClassification
            .from_pretrained(
                self.model_source,
                token=token
            )
        )

        self.model.to(self.device)
        self.model.eval()

        self.id2label = {
            int(index): label
            for index, label
            in self.model.config.id2label.items()
        }

        if (
            self.model.config.num_labels != 16
            or set(self.id2label.values()) != POS_TAGS
        ):
            raise RuntimeError(
                "Incorrect model labels. "
                "Expected our fine-tuned 16-class "
                "Persian POS model."
            )

        print("[FarsiSyntax] ParsBERT ready.")
        print("[FarsiSyntax] Labels:", 16)


    # ========================================
    # WORD SEGMENTATION
    # ========================================

    def tokenize_words(self, text):

        words = WORD_PATTERN.findall(text)

        if not words:
            raise ValueError(
                "No valid words found."
            )

        return words


    # ========================================
    # SAFE SEQUENCE CHUNKING
    # ========================================

    def split_into_chunks(self, words):
        """
        Split long input into complete-word chunks.

        No annotated word is intentionally truncated.
        Each chunk fits the 256-subword limit.
        """

        chunks = []
        start = 0

        while start < len(words):

            low = start + 1
            high = len(words)
            best = start

            # Find the longest word span that fits.
            while low <= high:

                middle = (low + high) // 2

                candidate = words[start:middle]

                encoded = self.tokenizer(
                    candidate,
                    is_split_into_words=True,
                    add_special_tokens=True,
                    truncation=False
                )

                length = len(
                    encoded["input_ids"]
                )

                if length <= MAX_LENGTH:
                    best = middle
                    low = middle + 1
                else:
                    high = middle - 1

            if best == start:
                raise ValueError(
                    "An input word exceeds the "
                    "model's maximum sequence length."
                )

            chunks.append(words[start:best])
            start = best

        return chunks


    # ========================================
    # PREDICT ONE WORD CHUNK
    # ========================================

    @torch.inference_mode()
    def predict_chunk(self, words):

        encoded = self.tokenizer(
            words,
            is_split_into_words=True,
            return_tensors="pt",
            truncation=False,
            add_special_tokens=True
        )

        word_ids = encoded.word_ids(
            batch_index=0
        )

        assert (
            encoded["input_ids"].shape[1]
            <= MAX_LENGTH
        )

        inputs = {
            key: value.to(self.device)
            for key, value in encoded.items()
        }

        outputs = self.model(**inputs)

        probabilities = torch.softmax(
            outputs.logits[0].float(),
            dim=-1
        )

        results = []
        previous_word_id = None

        for token_index, word_id in enumerate(word_ids):

            # Ignore [CLS], [SEP] and other specials
            if word_id is None:
                previous_word_id = None
                continue

            # Only the first subword has a POS label
            # in our original fine-tuning procedure.
            if word_id == previous_word_id:
                continue

            previous_word_id = word_id

            scores = probabilities[token_index]

            confidence, predicted_id = torch.max(
                scores,
                dim=-1
            )

            tag = self.id2label[
                int(predicted_id.item())
            ]

            results.append({
                "word": words[word_id],
                "pos": tag,
                "confidence": round(
                    float(confidence.item()),
                    6
                )
            })

        if len(results) != len(words):
            raise RuntimeError(
                "Word alignment failed during inference."
            )

        return results


    # ========================================
    # PUBLIC PREDICTION METHOD
    # ========================================

    def predict(self, text):

        if not isinstance(text, str):
            raise ValueError(
                "Input must be a string."
            )

        text = text.strip()

        if not text:
            raise ValueError(
                "Input text cannot be empty."
            )

        if len(text) > MAX_CHARACTERS:
            raise ValueError(
                "Input exceeds 1000 characters."
            )

        words = self.tokenize_words(text)

        chunks = self.split_into_chunks(words)

        predictions = []

        for chunk in chunks:
            predictions.extend(
                self.predict_chunk(chunk)
            )

        assert len(predictions) == len(words)

        return {
            "model": MODEL_NAME,
            "creator": CREATOR,
            "tokens": predictions
        }


# ============================================
# SINGLE MODEL INSTANCE
# ============================================

@lru_cache(maxsize=1)
def get_predictor():

    return PersianPOSInference()


def analyze_text(text):

    predictor = get_predictor()

    return predictor.predict(text)
