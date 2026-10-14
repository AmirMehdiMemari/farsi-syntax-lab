"use strict";

/*
 * FarsiSyntax Lab — Visual Animations
 * Created by Amir Mehdi Memari
 */

(() => {
    document.documentElement.classList.add("js");

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    // ----------------------------------------
    // Scroll reveal animations
    // ----------------------------------------

    const revealElements = document.querySelectorAll(
        "[data-reveal]"
    );

    if (reducedMotion || !("IntersectionObserver" in window)) {
        revealElements.forEach(element => {
            element.classList.add("visible");
        });
    } else {
        const revealObserver = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;

                    entry.target.classList.add("visible");
                    revealObserver.unobserve(entry.target);
                });
            },
            {
                threshold: 0.08,
                rootMargin: "0px 0px -25px 0px"
            }
        );

        revealElements.forEach(element => {
            revealObserver.observe(element);
        });
    }

    // ----------------------------------------
    // Animated research statistics
    // ----------------------------------------

    const statistics = document.querySelectorAll(
        ".stat-number[data-count]"
    );

    function animateStatistic(element) {
        const target = Number(element.dataset.count);
        if (!Number.isFinite(target)) return;

        const decimals = String(element.dataset.count)
            .includes(".") ? 2 : 0;

        const suffix = element.textContent.includes("%")
            ? "%" : "";

        if (reducedMotion) {
            element.textContent = target.toFixed(decimals) + suffix;
            return;
        }

        const duration = 1400;
        let startTime = null;

        function update(timestamp) {
            if (startTime === null) startTime = timestamp;

            const progress = Math.min(
                (timestamp - startTime) / duration,
                1
            );

            const eased = 1 - Math.pow(1 - progress, 3);
            const current = target * eased;

            element.textContent =
                current.toFixed(decimals) + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent =
                    target.toFixed(decimals) + suffix;
            }
        }

        requestAnimationFrame(update);
    }

    if ("IntersectionObserver" in window) {
        const statsObserver = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;

                    animateStatistic(entry.target);
                    statsObserver.unobserve(entry.target);
                });
            },
            { threshold: 0.35 }
        );

        statistics.forEach(element => {
            statsObserver.observe(element);
        });
    } else {
        statistics.forEach(animateStatistic);
    }

    // ----------------------------------------
    // Active navigation highlighting
    // ----------------------------------------

    const navLinks = document.querySelectorAll(
        ".nav-link[href^='#']"
    );

    const sections = [...navLinks]
        .map(link => document.querySelector(
            link.getAttribute("href")
        ))
        .filter(Boolean);

    if ("IntersectionObserver" in window) {
        const navigationObserver = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;

                    const id = entry.target.id;

                    navLinks.forEach(link => {
                        link.classList.toggle(
                            "active",
                            link.getAttribute("href") === "#" + id
                        );
                    });
                });
            },
            {
                rootMargin: "-20% 0px -60% 0px"
            }
        );

        sections.forEach(section => {
            navigationObserver.observe(section);
        });
    }

    // ----------------------------------------
    // Activate Ferdowsi artwork when available
    // ----------------------------------------

    const artwork = document.querySelector(
        ".ferdowsi-image"
    );

    if (artwork) {
        const showArtwork = () => {
            if (artwork.naturalWidth > 0) {
                artwork.closest(".hero-art")
                    ?.classList.add("has-image");
            }
        };

        artwork.addEventListener("load", showArtwork);
        showArtwork();
    }

    console.info(
        "FarsiSyntax Lab: animations initialized."
    );
})();
