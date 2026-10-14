"use strict";

/*
 * FarsiSyntax Lab — Bilingual Interface
 * Persian / English
 * Creator: Amir Mehdi Memari
 */

(() => {
    const translations = {
        fa: {
            navHome: "خانه",
            navAnalyze: "تحلیل متن",
            navResearch: "نتایج پژوهش",
            navFeatures: "امکانات",
            navAbout: "درباره پروژه",

            eyebrow: "✦ آزمایشگاه پردازش زبان فارسی",
            heroTitle: 'میراث زبان فارسی،<span class="gold-text">قدرت هوش مصنوعی</span>',
            heroDescription: "کشف ساختار زبان فارسی با استفاده از یادگیری عمیق، پردازش زبان طبیعی و مدل پیشرفته ParsBERT. هر واژه، دریچه‌ای به ساختار و زیبایی زبان ماست.",
            heroAnalyze: "✦ شروع تحلیل متن",
            heroResearch: "مشاهده پژوهش",
            heroModel: "Fine-tuned ParsBERT · 16 POS Categories",
            poetry: "به نام خداوند جان و خرد<span>کزین برتر اندیشه برنگذرد</span>",
            poet: "حکیم ابوالقاسم فردوسی",

            analyzerTitle: "تحلیل هوشمند <span>متن فارسی</span>",
            analyzerDescription: "جمله فارسی خود را وارد کنید تا نقش دستوری واژگان با مدل آموزش‌دیده ParsBERT شناسایی شود.",
            analyzerCardTitle: "آزمایشگاه تحلیل متن",
            inputLabel: "متن فارسی",
            inputPlaceholder: "برای تحلیل، یک جمله فارسی بنویسید...",
            clear: "پاک کردن متن",
            examples: "نمونه‌های پیشنهادی:",
            exampleFormal: "متن رسمی",
            exampleInformal: "متن محاوره‌ای",
            examplePoetry: "شعر فارسی",
            analyzeButton: "تحلیل دستوری متن",
            analyzing: "در حال تحلیل متن...",
            analyzerHelp: "مدل: ParsBERT · برچسب‌گذاری نقش دستوری",
            resultsTitle: "نتایج تحلیل دستوری",
            download: "دریافت JSON",
            disclaimer: "امتیازهای نمایش‌داده‌شده خروجی مدل هستند و لزوماً احتمال‌های کالیبره‌شده نیستند.",

            researchTitle: "نتایج <span>پژوهش</span>",
            researchDescription: "نتایج ارزیابی روی مجموعه‌داده‌های رسمی و محاوره‌ای فارسی با استفاده از تقسیم‌بندی‌های آزمون مستقل.",
            formalAccuracy: "دقت فارسی رسمی",
            informalAccuracy: "دقت فارسی محاوره‌ای",
            categories: "دسته دستوری",
            mainModel: "مدل اصلی",
            comparisonTitle: "مقایسه عملکرد مدل‌ها",
            comparisonDescription: "دقت روی داده‌های آزمون مستقل",
            tableModel: "مدل",
            tableFormal: "فارسی رسمی",
            tableInformal: "فارسی محاوره‌ای",
            researchNote: "توجه: تفاوت شیوه برچسب‌گذاری دو پیکره، به‌ویژه در دسته PART، بر تفسیر نتایج تأثیر دارد.",

            featuresTitle: "امکانات <span>آزمایشگاه</span>",
            feature1Title: "تحلیل نقش دستوری",
            feature1Description: "شناسایی نقش دستوری هر واژه با استفاده از مدل عمیق آموزش‌دیده روی زبان فارسی.",
            feature2Title: "فارسی رسمی و محاوره‌ای",
            feature2Description: "بررسی عملکرد مدل روی دو سبک متفاوت از زبان فارسی و نمایش تفاوت‌های پژوهشی.",
            feature3Title: "خروجی ساختاریافته",
            feature3Description: "نمایش برچسب‌های دستوری و امکان دریافت نتایج تحلیل در قالب JSON.",

            aboutTitle: "پیوند میراث فارسی با <span>هوش مصنوعی</span>",
            aboutParagraph1: "FarsiSyntax Lab یک پروژه پژوهشی و کاربردی در حوزه پردازش زبان طبیعی فارسی است. این پروژه مدل BiLSTM را با ParsBERT در مسئله برچسب‌گذاری نقش دستوری مقایسه می‌کند.",
            aboutParagraph2: "هدف پروژه، بررسی میزان تعمیم مدل‌ها از فارسی رسمی به زبان محاوره‌ای و ارائه ابزار قابل استفاده برای تحلیل متن فارسی است.",
            creatorLabel: "طراحی و توسعه",
            creatorRole: "Creator & Research Developer",
            heritageQuote: "زبان فارسی، میراثی زنده",

            footerHome: "خانه",
            footerAnalyze: "تحلیل متن",
            footerResearch: "پژوهش",
            footerCreated: "Created by",
            footerCopyright: "© 2026 FarsiSyntax Lab",
            footerHeritage: "Inspired by Persian linguistic heritage"
        },

        en: {
            navHome: "Home",
            navAnalyze: "Analyze",
            navResearch: "Research",
            navFeatures: "Features",
            navAbout: "About",

            eyebrow: "✦ PERSIAN LANGUAGE RESEARCH LAB",
            heroTitle: 'Persian Language Heritage,<span class="gold-text">Powered by Artificial Intelligence</span>',
            heroDescription: "Explore the structure of the Persian language through deep learning, natural language processing, and our fine-tuned ParsBERT model. Discover the linguistic role of every word.",
            heroAnalyze: "✦ Analyze Persian Text",
            heroResearch: "Explore Research",
            heroModel: "Fine-tuned ParsBERT · 16 POS Categories",
            poetry: "In the name of the Lord of soul and wisdom<span>Beyond whom no thought can pass</span>",
            poet: "Ferdowsi · Shahnameh",

            analyzerTitle: "Intelligent <span>Persian Text Analysis</span>",
            analyzerDescription: "Enter a Persian sentence to identify the grammatical role of each word using our fine-tuned ParsBERT model.",
            analyzerCardTitle: "Persian Text Analyzer",
            inputLabel: "Persian Text",
            inputPlaceholder: "Enter a Persian sentence to analyze...",
            clear: "Clear Text",
            examples: "Try an example:",
            exampleFormal: "Formal Persian",
            exampleInformal: "Colloquial Persian",
            examplePoetry: "Persian Poetry",
            analyzeButton: "Analyze Text",
            analyzing: "Analyzing text...",
            analyzerHelp: "Model: ParsBERT · Part-of-Speech Tagging",
            resultsTitle: "Part-of-Speech Analysis Results",
            download: "Download JSON",
            disclaimer: "Confidence scores are model softmax outputs and should not be interpreted as calibrated probabilities.",

            researchTitle: "Research <span>Results</span>",
            researchDescription: "Evaluation results on independent formal and informal Persian test datasets, using the official benchmark splits.",
            formalAccuracy: "Formal Persian Accuracy",
            informalAccuracy: "Informal Persian Accuracy",
            categories: "POS Categories",
            mainModel: "Primary Model",
            comparisonTitle: "Model Performance Comparison",
            comparisonDescription: "Accuracy on independent test datasets",
            tableModel: "Model",
            tableFormal: "Formal Persian",
            tableInformal: "Informal Persian",
            researchNote: "Note: Differences in annotation conventions between the two corpora, particularly the PART category, affect how these results should be interpreted.",

            featuresTitle: "Platform <span>Features</span>",
            feature1Title: "Part-of-Speech Tagging",
            feature1Description: "Identify the grammatical role of individual Persian words using a fine-tuned deep learning model.",
            feature2Title: "Formal & Informal Persian",
            feature2Description: "Explore cross-register model performance and research findings across two Persian language varieties.",
            feature3Title: "Structured Results",
            feature3Description: "Visualize grammatical labels and download model predictions as structured JSON data.",

            aboutTitle: "Connecting Persian Heritage with <span>Artificial Intelligence</span>",
            aboutParagraph1: "FarsiSyntax Lab is an applied research project in Persian natural language processing. It compares BiLSTM and ParsBERT models for Universal Dependencies part-of-speech tagging.",
            aboutParagraph2: "The project investigates how models trained on formal Persian generalize to informal language, while developing an accessible tool for Persian linguistic analysis.",
            creatorLabel: "Designed & Developed by",
            creatorRole: "Creator & Research Developer",
            heritageQuote: "Persian — A Living Linguistic Heritage",

            footerHome: "Home",
            footerAnalyze: "Analyze",
            footerResearch: "Research",
            footerCreated: "Created by",
            footerCopyright: "© 2026 FarsiSyntax Lab",
            footerHeritage: "Inspired by Persian linguistic heritage"
        }
    };

    const selectors = {
        navHome: '.nav-link[href="#home"]',
        navAnalyze: '.nav-link[href="#analyzer"]',
        navResearch: '.nav-link[href="#research"]',
        navFeatures: '.nav-link[href="#features"]',
        navAbout: '.nav-link[href="#about"]',

        eyebrow: ".eyebrow",
        heroTitle: ".hero h1",
        heroDescription: ".hero-description",
        heroAnalyze: '.hero-actions a[href="#analyzer"]',
        heroResearch: '.hero-actions a[href="#research"]',
        heroModel: ".hero-model-note",
        poetry: ".poetry-card blockquote",
        poet: ".poetry-author",

        analyzerTitle: "#analyzer .section-heading h2",
        analyzerDescription: "#analyzer .section-heading p",
        analyzerCardTitle: ".analyzer-title h3",
        inputLabel: ".input-label",
        clear: "#clear-button",
        examples: ".example-label",
        exampleFormal: '.example-chip[data-example]:nth-child(1)',
        exampleInformal: '.example-chip[data-example]:nth-child(2)',
        examplePoetry: '.example-chip[data-example]:nth-child(3)',
        analyzerHelp: ".analyzer-help",
        resultsTitle: "#results-heading",
        download: "#download-json",
        disclaimer: ".results-disclaimer",

        researchTitle: "#research .section-heading h2",
        researchDescription: "#research .section-heading p",
        formalAccuracy: ".stat-card:nth-child(1) h3",
        informalAccuracy: ".stat-card:nth-child(2) h3",
        categories: ".stat-card:nth-child(3) h3",
        mainModel: ".stat-card:nth-child(4) h3",
        comparisonTitle: ".comparison-heading h3",
        comparisonDescription: ".comparison-heading p",
        tableModel: ".comparison-table thead th:nth-child(1)",
        tableFormal: ".comparison-table thead th:nth-child(2)",
        tableInformal: ".comparison-table thead th:nth-child(3)",
        researchNote: ".research-note",

        featuresTitle: "#features .section-heading h2",
        feature1Title: ".feature-card:nth-child(1) h3",
        feature1Description: ".feature-card:nth-child(1) p",
        feature2Title: ".feature-card:nth-child(2) h3",
        feature2Description: ".feature-card:nth-child(2) p",
        feature3Title: ".feature-card:nth-child(3) h3",
        feature3Description: ".feature-card:nth-child(3) p",

        aboutTitle: ".about-copy h2",
        aboutParagraph1: ".about-copy > p:nth-of-type(1)",
        aboutParagraph2: ".about-copy > p:nth-of-type(2)",
        creatorLabel: ".creator-card > span",
        creatorRole: ".creator-card small",
        heritageQuote: ".about-decoration p",

        footerHome: '.footer-links a[href="#home"]',
        footerAnalyze: '.footer-links a[href="#analyzer"]',
        footerResearch: '.footer-links a[href="#research"]',
        footerCreated: ".footer-credit span",
        footerCopyright: ".footer-bottom span:nth-child(1)",
        footerHeritage: ".footer-bottom span:nth-child(2)"
    };

    const htmlKeys = new Set([
        "heroTitle",
        "poetry",
        "analyzerTitle",
        "researchTitle",
        "featuresTitle",
        "aboutTitle"
    ]);

    const messageTranslations = {
        "وضعیت سرویس: در انتظار اتصال": "Service: awaiting connection",
        "سرویس در انتظار راه‌اندازی": "Service not yet available",
        "سرویس در دسترس نیست": "Service unavailable",
        "سرویس ParsBERT متصل است": "ParsBERT service connected",
        "در حال تحلیل متن...": "Analyzing text...",
        "لطفاً یک جمله فارسی وارد کنید.": "Please enter a Persian sentence.",
        "لطفاً یک متن فارسی وارد کنید.": "Please enter Persian text.",
        "متن باید حداکثر ۱۰۰۰ نویسه داشته باشد.": "Text must not exceed 1,000 characters.",
        "حداکثر طول متن ۱۰۰۰ نویسه است.": "The maximum length is 1,000 characters.",
        "متن در حال پردازش توسط مدل هوش مصنوعی است...": "Your text is being processed by the AI model...",
        "تحلیل دستوری با موفقیت انجام شد.": "Text analysis completed successfully.",
        "سرویس تحلیل در دسترس نیست.": "The analysis service is unavailable.",
        "ارتباط با سرویس تحلیل برقرار نشد.": "Could not connect to the analysis service.",
        "زمان پاسخ‌گویی سرویس به پایان رسید.": "The analysis request timed out.",
        "پاسخ نامعتبر از سرویس تحلیل دریافت شد.": "The analysis service returned an invalid response.",
        "برچسب‌های دستوری پاسخ معتبر نیستند.": "The returned grammatical labels are invalid.",
        "امتیاز پیش‌بینی مدل معتبر نیست.": "The model returned an invalid confidence score.",
        "پاسخ سرویس فاقد برچسب‌های دستوری معتبر است.": "The service did not return valid POS tags.",
        "ساختار خروجی مدل با قالب مورد انتظار سازگار نیست.": "The model response has an unexpected format.",
        "مقدار اطمینان پیش‌بینی معتبر نیست.": "A prediction confidence score is invalid.",
        "متن باید یک رشته معتبر باشد.": "The input must be valid text.",
        "سرویس تحلیل هنوز متصل نشده است. در مرحله بعد API واقعی ParsBERT را راه‌اندازی می‌کنیم.": "The ParsBERT analysis service is not connected yet.",
        "سرویس هوش مصنوعی هنوز راه‌اندازی نشده است.": "The AI service has not been deployed yet.",
        "اتصال به سرویس تحلیل برقرار نشد.": "Could not connect to the analysis service.",
        "سرویس تحلیل در حال حاضر پاسخ‌گو نیست.": "The analysis service is currently unavailable.",
        "فرمت خروجی سرویس تحلیل معتبر نیست.": "The analysis service returned an invalid response.",
        "زمان پاسخ‌گویی مدل به پایان رسید.": "The model response timed out."
    };

    const STORAGE_KEY = "farsisyntax-language";
    let language = "fa";

    function getSavedLanguage() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch {
            return null;
        }
    }

    function saveLanguage(value) {
        try {
            localStorage.setItem(STORAGE_KEY, value);
        } catch {
            // Local storage may be unavailable under file://.
        }
    }

    function message(raw) {
        if (!raw || language === "fa") {
            return raw;
        }

        return messageTranslations[raw] || (
            /[\u0600-\u06FF]/.test(raw)
                ? "The analysis service returned an error. Please try again."
                : raw
        );
    }

    function applyLanguage() {
        const strings = translations[language];
        const isEnglish = language === "en";

        document.documentElement.lang = language;
        document.documentElement.dir = isEnglish ? "ltr" : "rtl";

        document.title = isEnglish
            ? "FarsiSyntax Lab | AI-Powered Persian Language Analysis"
            : "FarsiSyntax Lab | تحلیل هوشمند زبان فارسی";

        for (const [key, selector] of Object.entries(selectors)) {
            const element = document.querySelector(selector);
            if (!element || strings[key] === undefined) continue;

            if (key === "heroModel") {
                const dot = element.querySelector(".status-dot");
                element.replaceChildren();
                if (dot) element.appendChild(dot);
                element.appendChild(
                    document.createTextNode(strings[key])
                );
            } else if (htmlKeys.has(key)) {
                element.innerHTML = strings[key];
            } else {
                element.textContent = strings[key];
            }
        }

        const input = document.getElementById("persian-input");
        if (input) {
            input.placeholder = strings.inputPlaceholder;
            // The analyzed text itself is always Persian.
            input.dir = "rtl";
        }

        const analyzeButton = document.getElementById("analyze-button");
        if (analyzeButton) {
            if (analyzeButton.disabled) {
                analyzeButton.textContent = strings.analyzing;
            } else {
                analyzeButton.textContent = "✦ " + strings.analyzeButton;
            }
        }

        const status = document.getElementById("form-status");
        if (status?.dataset.rawMessage !== undefined) {
            status.textContent = message(status.dataset.rawMessage);
        }

        const indicator = document.getElementById("model-indicator");
        if (indicator) {
            const raw = indicator.dataset.rawMessage ||
                "وضعیت سرویس: در انتظار اتصال";

            const dot = indicator.querySelector(".status-dot");
            indicator.replaceChildren();

            if (dot) indicator.appendChild(dot);

            indicator.appendChild(
                document.createTextNode(message(raw))
            );
        }

        const summary = document.getElementById("analysis-summary");
        const resultPanel = document.getElementById("results-panel");
        const count = document.getElementById("token-list")?.children.length;

        if (summary && resultPanel && !resultPanel.hidden && count) {
            summary.textContent = isEnglish
                ? `${count} tokens · Fine-tuned ParsBERT`
                : `${count} واژه · مدل ParsBERT`;
        }

        document.querySelectorAll("[data-set-lang]").forEach(button => {
            const active = button.dataset.setLang === language;
            button.classList.toggle("active", active);
            button.setAttribute("aria-pressed", String(active));
        });

        const menu = document.getElementById("menu-toggle");
        if (menu) {
            menu.setAttribute(
                "aria-label",
                isEnglish ? "Open navigation menu" : "باز کردن فهرست"
            );
        }
    }

    function setLanguage(next) {
        if (!translations[next]) return;

        language = next;
        saveLanguage(language);
        applyLanguage();
    }

    window.FarsiSyntaxI18n = Object.freeze({
        getLanguage: () => language,
        setLanguage,
        applyLanguage,
        message
    });

    document.querySelectorAll("[data-set-lang]").forEach(button => {
        button.addEventListener("click", () => {
            setLanguage(button.dataset.setLang);
        });
    });

    setLanguage(getSavedLanguage() === "en" ? "en" : "fa");

    console.info("FarsiSyntax Lab bilingual interface ready:", language);
})();
