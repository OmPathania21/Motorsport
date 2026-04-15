(function () {
    const INTRO_SCROLL_DELAY_MS = 5000;
    const PAGE_TRANSITION_MS = 1400;

    const body = document.body;
    const introStage = document.getElementById("introStage");
    const introVideo = document.getElementById("introVideo");
    const scrollVideo = document.getElementById("scrollVideo");
    const scrollCue = document.getElementById("scrollCue");
    const scrollScene = document.getElementById("scrollScene");
    const sceneFrame = document.getElementById("sceneFrame");
    const sceneImage = document.getElementById("sceneImage");
    const imageCard = document.getElementById("imageCard");
    const startImage = document.getElementById("startImage");
    const startCard = document.getElementById("startCard");
    const kidsImage = document.getElementById("kidsImage");
    const kidsCard = document.getElementById("kidsCard");
    const letsRollButton = document.getElementById("letsRollButton");

    let introDone = false;
    let rafPending = false;
    let introDelayTimer = null;
    let navigatingAway = false;
    let cachedSceneTop = 0;
    let cachedSceneScrollable = 1;

    function isElementInViewport(el) {
        if (!el) {
            return false;
        }

        const rect = el.getBoundingClientRect();
        return rect.bottom > 0 && rect.top < window.innerHeight;
    }

    function safePlay(videoEl) {
        if (!videoEl) {
            return;
        }

        videoEl.play().catch(function () {
            return null;
        });
    }

    function syncViewportVideoPlayback() {
        if (document.hidden) {
            return;
        }

        const introVisible = isElementInViewport(introStage);
        const scrollVisible = isElementInViewport(scrollScene);

        if (introVideo) {
            if (introVisible) {
                safePlay(introVideo);
            } else if (!introVideo.paused) {
                introVideo.pause();
            }
        }

        if (scrollVideo) {
            if (introDone && scrollVisible) {
                safePlay(scrollVideo);
            } else if (!scrollVideo.paused) {
                scrollVideo.pause();
            }
        }
    }

    function recalculateSceneMetrics() {
        cachedSceneTop = scrollScene ? scrollScene.offsetTop : 0;
        const total = scrollScene ? (scrollScene.offsetHeight - window.innerHeight) : 1;
        cachedSceneScrollable = Math.max(total, 1);
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function stageProgress(value, start, end) {
        if (value <= start) {
            return 0;
        }

        if (value >= end) {
            return 1;
        }

        return (value - start) / (end - start);
    }

    function updateSceneProgress() {
        rafPending = false;

        if (!introDone) {
            return;
        }

        const current = window.scrollY - cachedSceneTop;
        const rawProgress = current / cachedSceneScrollable;
        const p = clamp(rawProgress, 0, 1);

        const videoStage = easeOutCubic(stageProgress(p, 0.0, 0.52));
        const startIn = easeOutCubic(stageProgress(p, 0.5, 0.82));
        const startOut = 1 - stageProgress(p, 0.93, 1.0);
        const startStage = clamp(startIn * startOut, 0, 1);
        const introStage = clamp(videoStage * (1 - startStage), 0, 1);

        sceneFrame.style.setProperty("--p", p.toFixed(4));
        sceneFrame.style.setProperty("--videoStage", videoStage.toFixed(4));
        sceneFrame.style.setProperty("--introStage", introStage.toFixed(4));
        sceneFrame.style.setProperty("--startStage", startStage.toFixed(4));
    }

    function requestSceneProgressUpdate() {
        if (rafPending) {
            return;
        }

        rafPending = true;
        window.requestAnimationFrame(updateSceneProgress);
    }

    function unlockAfterIntro() {
        if (introDone) {
            return;
        }

        introDone = true;
        body.classList.remove("intro-lock");
        body.classList.add("intro-done");
        scrollScene.removeAttribute("aria-hidden");
        scrollCue.classList.remove("hidden");

        recalculateSceneMetrics();

        if (scrollVideo) {
            scrollVideo.currentTime = 0;
            scrollVideo.play().catch(function () {
                return null;
            });
        }

        requestSceneProgressUpdate();
    }

    function startIntroPlayback() {
        if (!introVideo) {
            unlockAfterIntro();
            return;
        }

        introVideo.loop = true;

        introVideo.play()
            .then(function () {
                body.classList.add("intro-playing");

                if (introDelayTimer) {
                    window.clearTimeout(introDelayTimer);
                }

                // After 5 seconds, show the cue and allow users to continue scrolling.
                introDelayTimer = window.setTimeout(function () {
                    unlockAfterIntro();
                }, INTRO_SCROLL_DELAY_MS);
            })
            .catch(function () {
                unlockAfterIntro();
            });
    }

    function attachImageState(cardEl, imgEl) {
        if (!cardEl || !imgEl) {
            return;
        }

        if (imgEl.complete && imgEl.naturalWidth > 0) {
            cardEl.classList.add("has-image");
        }

        imgEl.addEventListener("load", function () {
            cardEl.classList.add("has-image");
        });

        imgEl.addEventListener("error", function () {
            cardEl.classList.remove("has-image");
        });
    }

    attachImageState(imageCard, sceneImage);
    attachImageState(startCard, startImage);
    attachImageState(kidsCard, kidsImage);

    function transitionTo(targetUrl) {
        if (navigatingAway) {
            return;
        }

        navigatingAway = true;
        body.classList.add("transition-out");

        if (letsRollButton) {
            letsRollButton.disabled = true;
        }

        window.setTimeout(function () {
            window.location.href = targetUrl;
        }, PAGE_TRANSITION_MS);
    }

    if (letsRollButton) {
        letsRollButton.addEventListener("click", function () {
            transitionTo("/championship");
        });
    }

    if (introVideo) {
        introVideo.addEventListener("ended", function () {
            unlockAfterIntro();
        });

        introVideo.addEventListener("error", function () {
            unlockAfterIntro();
        });
    }

    document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
            if (introVideo && !introVideo.paused) {
                introVideo.pause();
            }

            if (scrollVideo && !scrollVideo.paused) {
                scrollVideo.pause();
            }
            return;
        }

        syncViewportVideoPlayback();
    });

    window.addEventListener("scroll", function () {
        requestSceneProgressUpdate();
        syncViewportVideoPlayback();
    }, { passive: true });
    window.addEventListener("resize", function () {
        recalculateSceneMetrics();
        requestSceneProgressUpdate();
        syncViewportVideoPlayback();
    });

    recalculateSceneMetrics();
    syncViewportVideoPlayback();

    window.setTimeout(function () {
        startIntroPlayback();
    }, 1000);
})();
