"use strict";

/*
 * FarsiSyntax Lab
 * Browser-side API client
 * Creator: Amir Mehdi Memari
 *
 * No API credentials are stored in the browser.
 */

(() => {
    const API_ENDPOINT = "/api/analyze";
    const MAX_CHARACTERS = 1000;
    const TIMEOUT_MS = 30000;

    const POS_TAGS = new Set([
        "ADJ", "ADP", "ADV", "AUX",
        "CCONJ", "DET", "INTJ", "NOUN",
        "NUM", "PART", "PRON", "PROPN",
        "PUNCT", "SCONJ", "VERB", "X"
    ]);

    function validateInput(text) {
        if (typeof text !== "string") {
            throw new Error("متن باید یک رشته معتبر باشد.");
        }

        const cleaned = text.trim();

        if (!cleaned) {
            throw new Error("لطفاً یک متن فارسی وارد کنید.");
        }

        if (cleaned.length > MAX_CHARACTERS) {
            throw new Error(
                "حداکثر طول متن ۱۰۰۰ نویسه است."
            );
        }

        return cleaned;
    }

    function validateResponse(data) {
        if (
            !data ||
            typeof data !== "object" ||
            !Array.isArray(data.tokens) ||
            data.tokens.length === 0
        ) {
            throw new Error(
                "پاسخ نامعتبر از سرویس تحلیل دریافت شد."
            );
        }

        for (const token of data.tokens) {
            if (
                !token ||
                typeof token.word !== "string" ||
                !token.word ||
                !POS_TAGS.has(token.pos)
            ) {
                throw new Error(
                    "برچسب‌های دستوری پاسخ معتبر نیستند."
                );
            }

            if (
                token.confidence !== undefined &&
                token.confidence !== null &&
                (
                    typeof token.confidence !== "number" ||
                    !Number.isFinite(token.confidence) ||
                    token.confidence < 0 ||
                    token.confidence > 1
                )
            ) {
                throw new Error(
                    "امتیاز پیش‌بینی مدل معتبر نیست."
                );
            }
        }

        return data;
    }

    async function analyze(text) {
        const cleaned = validateInput(text);

        const controller = new AbortController();
        const timeout = setTimeout(
            () => controller.abort(),
            TIMEOUT_MS
        );

        try {
            const response = await fetch(API_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    text: cleaned
                }),
                signal: controller.signal,
                cache: "no-store",
                credentials: "same-origin"
            });

            const data = await response.json().catch(
                () => null
            );

            if (!response.ok) {
                const message =
                    typeof data?.error === "string"
                        ? data.error
                        : "سرویس تحلیل در دسترس نیست.";

                throw new Error(message);
            }

            return validateResponse(data);

        } catch (error) {
            if (error.name === "AbortError") {
                throw new Error(
                    "زمان پاسخ‌گویی سرویس به پایان رسید."
                );
            }

            if (error instanceof TypeError) {
                throw new Error(
                    "ارتباط با سرویس تحلیل برقرار نشد."
                );
            }

            throw error;

        } finally {
            clearTimeout(timeout);
        }
    }

    async function checkGateway() {
        try {
            const response = await fetch(API_ENDPOINT, {
                method: "GET",
                cache: "no-store"
            });

            return {
                configured: response.ok
            };

        } catch {
            return {
                configured: false
            };
        }
    }

    window.FarsiSyntaxAPI = Object.freeze({
        analyze,
        checkGateway
    });

    console.info("FarsiSyntax Lab API client ready.");
})();
