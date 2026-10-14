"use strict";

/*
 * FarsiSyntax Lab
 * Secure Vercel API gateway
 * Creator: Amir Mehdi Memari
 *
 * Backend URL and credentials are server-only.
 *
 * Environment variables:
 * PARSBERT_API_URL
 * PARSBERT_API_TOKEN (optional)
 */

const MAX_CHARACTERS = 1000;
const UPSTREAM_TIMEOUT_MS = 25000;

const ALLOWED_TAGS = new Set([
    "ADJ", "ADP", "ADV", "AUX",
    "CCONJ", "DET", "INTJ", "NOUN",
    "NUM", "PART", "PRON", "PROPN",
    "PUNCT", "SCONJ", "VERB", "X"
]);

function sendJSON(res, status, payload) {
    return res.status(status).json(payload);
}

function backendIsConfigured() {
    const raw = process.env.PARSBERT_API_URL;

    if (!raw) return false;

    try {
        const url = new URL(raw);
        return url.protocol === "https:" ||
            (
                url.protocol === "http:" &&
                ["localhost", "127.0.0.1"].includes(
                    url.hostname
                )
            );
    } catch {
        return false;
    }
}

function validatePrediction(data) {
    if (
        !data ||
        !Array.isArray(data.tokens) ||
        data.tokens.length === 0 ||
        data.tokens.length > 1000
    ) {
        return false;
    }

    return data.tokens.every(token => (
        token &&
        typeof token.word === "string" &&
        token.word.length > 0 &&
        typeof token.pos === "string" &&
        ALLOWED_TAGS.has(token.pos) &&
        (
            token.confidence === undefined ||
            token.confidence === null ||
            (
                typeof token.confidence === "number" &&
                Number.isFinite(token.confidence) &&
                token.confidence >= 0 &&
                token.confidence <= 1
            )
        )
    ));
}

module.exports = async function handler(req, res) {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Allow", "GET, POST");

    // Gateway configuration check.
    // This does not guarantee that the backend is online.
    if (req.method === "GET") {
        const configured = backendIsConfigured();

        return sendJSON(
            res,
            configured ? 200 : 503,
            {
                service: "FarsiSyntax Lab API",
                status: configured
                    ? "configured"
                    : "not_configured"
            }
        );
    }

    if (req.method !== "POST") {
        return sendJSON(res, 405, {
            error: "این روش درخواست پشتیبانی نمی‌شود."
        });
    }

    const contentType = req.headers["content-type"] || "";

    if (!contentType.startsWith("application/json")) {
        return sendJSON(res, 415, {
            error: "درخواست باید در قالب JSON باشد."
        });
    }

    let body = req.body;

    if (typeof body === "string") {
        try {
            body = JSON.parse(body);
        } catch {
            return sendJSON(res, 400, {
                error: "ساختار JSON معتبر نیست."
            });
        }
    }

    if (
        !body ||
        typeof body.text !== "string" ||
        !body.text.trim()
    ) {
        return sendJSON(res, 400, {
            error: "لطفاً متن معتبری وارد کنید."
        });
    }

    const text = body.text.trim();

    if (text.length > MAX_CHARACTERS) {
        return sendJSON(res, 413, {
            error: "متن نباید بیش از ۱۰۰۰ نویسه باشد."
        });
    }

    if (!backendIsConfigured()) {
        return sendJSON(res, 503, {
            error:
                "سرویس هوش مصنوعی هنوز راه‌اندازی نشده است."
        });
    }

    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    };

    // Optional backend authentication.
    // Never expose this secret to browser JavaScript.
    const token = process.env.PARSBERT_API_TOKEN;

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const controller = new AbortController();

    const timeout = setTimeout(
        () => controller.abort(),
        UPSTREAM_TIMEOUT_MS
    );

    try {
        const response = await fetch(
            process.env.PARSBERT_API_URL,
            {
                method: "POST",
                headers,
                body: JSON.stringify({ text }),
                signal: controller.signal,
                redirect: "error"
            }
        );

        if (!response.ok) {
            console.error(
                "ParsBERT backend HTTP status:",
                response.status
            );

            if (response.status === 429) {
                return sendJSON(res, 429, {
                    error:
                        "درخواست‌های زیادی ارسال شده است. کمی بعد تلاش کنید."
                });
            }

            if (response.status === 422 ||
                response.status === 413) {
                return sendJSON(res, 422, {
                    error:
                        "متن توسط سرویس تحلیل پذیرفته نشد."
                });
            }

            return sendJSON(res, 502, {
                error:
                    "سرویس تحلیل در حال حاضر پاسخ‌گو نیست."
            });
        }

        const prediction = await response.json();

        if (!validatePrediction(prediction)) {
            console.error(
                "Invalid ParsBERT backend response schema."
            );

            return sendJSON(res, 502, {
                error:
                    "فرمت خروجی سرویس تحلیل معتبر نیست."
            });
        }

        // Return only expected model output fields.
        return sendJSON(res, 200, {
            model:
                typeof prediction.model === "string"
                    ? prediction.model
                    : "FarsiSyntax Lab ParsBERT",
            tokens: prediction.tokens.map(token => ({
                word: token.word,
                pos: token.pos,
                confidence: token.confidence ?? null
            }))
        });

    } catch (error) {
        if (error.name === "AbortError") {
            return sendJSON(res, 504, {
                error:
                    "زمان پاسخ‌گویی مدل به پایان رسید."
            });
        }

        console.error(
            "ParsBERT gateway error:",
            error.message
        );

        return sendJSON(res, 502, {
            error:
                "اتصال به سرویس تحلیل برقرار نشد."
        });

    } finally {
        clearTimeout(timeout);
    }
};
