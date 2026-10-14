"use strict";

/*
 * FarsiSyntax Lab — Main Application
 * Created by Amir Mehdi Memari
 *
 * Only genuine API predictions are displayed.
 */

(() => {

    // ----------------------------------------
    // DOM elements
    // ----------------------------------------

    const form = document.getElementById("analysis-form");
    const input = document.getElementById("persian-input");
    const characterCount = document.getElementById(
        "character-count"
    );
    const clearButton = document.getElementById(
        "clear-button"
    );
    const analyzeButton = document.getElementById(
        "analyze-button"
    );
    const status = document.getElementById("form-status");
    const modelIndicator = document.getElementById(
        "model-indicator"
    );
    const resultsPanel = document.getElementById(
        "results-panel"
    );
    const tokenList = document.getElementById("token-list");
    const tokenTemplate = document.getElementById(
        "pos-token-template"
    );
    const analysisSummary = document.getElementById(
        "analysis-summary"
    );
    const downloadButton = document.getElementById(
        "download-json"
    );

    let latestResult = null;
    let isAnalyzing = false;

    const allowedTags = new Set([
        "ADJ", "ADP", "ADV", "AUX",
        "CCONJ", "DET", "INTJ", "NOUN",
        "NUM", "PART", "PRON", "PROPN",
        "PUNCT", "SCONJ", "VERB", "X"
    ]);

    // ----------------------------------------
    // Responsive mobile navigation
    // ----------------------------------------

    const menuToggle = document.getElementById(
        "menu-toggle"
    );

    const navLinks = document.getElementById("nav-links");

    function closeMenu() {
        navLinks.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
    }

    menuToggle?.addEventListener("click", () => {
        const opened = navLinks.classList.toggle("is-open");

        menuToggle.setAttribute(
            "aria-expanded",
            String(opened)
        );
    });

    navLinks?.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") closeMenu();
    });

    document.addEventListener("click", event => {
        if (
            !menuToggle?.contains(event.target) &&
            !navLinks?.contains(event.target)
        ) {
            closeMenu();
        }
    });

    // ----------------------------------------
    // Character counter
    // ----------------------------------------

    function updateCharacterCount() {
        const count = input.value.length;

        characterCount.textContent =
            `${count} / ${input.maxLength}`;
    }

    function resetResults() {
        latestResult = null;
        resultsPanel.hidden = true;
        tokenList.replaceChildren();
        analysisSummary.textContent = "";
    }

    input.addEventListener("input", () => {
        updateCharacterCount();
        resetResults();
        setStatus("");
    });

    // ----------------------------------------
    // Example Persian sentences
    // ----------------------------------------

    document.querySelectorAll(
        ".example-chip[data-example]"
    ).forEach(button => {

        button.addEventListener("click", () => {
            input.value = button.dataset.example || "";

            updateCharacterCount();
            resetResults();
            setStatus("");

            input.focus();
        });
    });

    // ----------------------------------------
    // Clear text
    // ----------------------------------------

    clearButton.addEventListener("click", () => {
        input.value = "";

        updateCharacterCount();
        resetResults();
        setStatus("");

        input.focus();
    });

    // ----------------------------------------
    // Status messages
    // ----------------------------------------

    function setStatus(message, type = "") {
        status.dataset.rawMessage = message;
        status.textContent =
            window.FarsiSyntaxI18n?.message(message) ?? message;

        status.classList.remove(
            "is-error",
            "is-success"
        );

        if (type) {
            status.classList.add(`is-${type}`);
        }
    }

    function setModelStatus(message, isOnline = false) {
        const dot = modelIndicator.querySelector(
            ".status-dot"
        );

        modelIndicator.dataset.rawMessage = message;
        modelIndicator.replaceChildren();

        if (dot) modelIndicator.appendChild(dot);

        modelIndicator.appendChild(
            document.createTextNode(window.FarsiSyntaxI18n?.message(message) ?? message)
        );

        modelIndicator.classList.toggle(
            "is-online",
            isOnline
        );
    }

    // ----------------------------------------
    // Loading indicator
    // ----------------------------------------

    const originalButtonContent = analyzeButton.innerHTML;

    function setLoading(loading) {
        isAnalyzing = loading;

        analyzeButton.disabled = loading;

        analyzeButton.setAttribute(
            "aria-busy",
            String(loading)
        );

        input.readOnly = loading;

        if (loading) {
            analyzeButton.textContent = window.FarsiSyntaxI18n?.message("در حال تحلیل متن...") ?? "در حال تحلیل متن...";
        } else {
            // Restores our original static button markup.
            analyzeButton.innerHTML = originalButtonContent;
            window.FarsiSyntaxI18n?.applyLanguage();
        }
    }

    // ----------------------------------------
    // Validate API response
    // ----------------------------------------

    function validatePrediction(result) {
        if (
            !result ||
            !Array.isArray(result.tokens) ||
            result.tokens.length === 0
        ) {
            throw new Error(
                "پاسخ سرویس فاقد برچسب‌های دستوری معتبر است."
            );
        }

        for (const token of result.tokens) {
            if (
                typeof token.word !== "string" ||
                token.word.length === 0 ||
                !allowedTags.has(token.pos)
            ) {
                throw new Error(
                    "ساختار خروجی مدل با قالب مورد انتظار سازگار نیست."
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
                    "مقدار اطمینان پیش‌بینی معتبر نیست."
                );
            }
        }

        return result;
    }

    // ----------------------------------------
    // Render real predictions
    // ----------------------------------------

    function renderResults(result) {
        const fragment = document.createDocumentFragment();

        result.tokens.forEach(token => {
            const element = tokenTemplate.content
                .firstElementChild.cloneNode(true);

            element.dataset.pos = token.pos;

            element.querySelector(
                ".token-word"
            ).textContent = token.word;

            element.querySelector(
                ".token-tag"
            ).textContent = token.pos;

            const confidenceElement =
                element.querySelector(".token-confidence");

            if (
                typeof token.confidence === "number"
            ) {
                confidenceElement.textContent =
                    `${(token.confidence * 100).toFixed(1)}%`;
            } else {
                confidenceElement.textContent = "—";
            }

            fragment.appendChild(element);
        });

        tokenList.replaceChildren(fragment);

        const modelName =
            typeof result.model === "string"
                ? result.model
                : "ParsBERT";

        analysisSummary.textContent =
            `${result.tokens.length} واژه · مدل ${modelName}`;

        latestResult = result;
        resultsPanel.hidden = false;
        window.FarsiSyntaxI18n?.applyLanguage();

        resultsPanel.scrollIntoView({
            behavior: window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches ? "auto" : "smooth",
            block: "start"
        });
    }

    // ----------------------------------------
    // Submit text to real API
    // ----------------------------------------

    form.addEventListener("submit", async event => {
        event.preventDefault();

        if (isAnalyzing) return;

        const text = input.value.trim();

        if (!text) {
            setStatus(
                "لطفاً یک جمله فارسی وارد کنید.",
                "error"
            );
            input.focus();
            return;
        }

        if (text.length > 1000) {
            setStatus(
                "متن باید حداکثر ۱۰۰۰ نویسه داشته باشد.",
                "error"
            );
            return;
        }

        // API module will be implemented next.
        if (
            !window.FarsiSyntaxAPI ||
            typeof window.FarsiSyntaxAPI.analyze !==
                "function"
        ) {
            setStatus(
                "سرویس تحلیل هنوز متصل نشده است. " +
                "در مرحله بعد API واقعی ParsBERT را راه‌اندازی می‌کنیم.",
                "error"
            );

            setModelStatus(
                "سرویس در انتظار راه‌اندازی"
            );

            return;
        }

        resetResults();
        setLoading(true);

        setStatus(
            "متن در حال پردازش توسط مدل هوش مصنوعی است..."
        );

        try {
            const response =
                await window.FarsiSyntaxAPI.analyze(text);

            const result = validatePrediction(response);

            renderResults(result);

            setStatus(
                "تحلیل دستوری با موفقیت انجام شد.",
                "success"
            );

            setModelStatus(
                "سرویس ParsBERT متصل است",
                true
            );

        } catch (error) {
            console.error(
                "FarsiSyntax Lab API error:",
                error
            );

            setStatus(
                error instanceof Error
                    ? error.message
                    : "خطا در برقراری ارتباط با سرویس.",
                "error"
            );

            setModelStatus(
                "سرویس در دسترس نیست"
            );

        } finally {
            setLoading(false);
        }
    });

    // ----------------------------------------
    // Download real analysis JSON
    // ----------------------------------------

    downloadButton.addEventListener("click", () => {
        if (!latestResult) return;

        const json = JSON.stringify(
            latestResult,
            null,
            2
        );

        const blob = new Blob(
            [json],
            { type: "application/json;charset=utf-8" }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download = "farsi-syntax-analysis.json";

        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);
    });

    // ----------------------------------------
    // Initialize application
    // ----------------------------------------

    updateCharacterCount();
    resetResults();

    setModelStatus(
        "وضعیت سرویس: در انتظار اتصال"
    );

    console.info(
        "FarsiSyntax Lab initialized.",
        "Creator: Amir Mehdi Memari"
    );

})();
