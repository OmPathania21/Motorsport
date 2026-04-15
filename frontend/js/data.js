(function () {
    const body = document.body;
    const backgroundVideo = document.getElementById("dataBackgroundVideo");
    const raceTableVideo = document.getElementById("raceTableVideo");
    const teamTableVideo = document.getElementById("teamTableVideo");
    const driverTableVideo = document.getElementById("driverTableVideo");
    const raceSection = document.getElementById("raceSection");
    const teamSection = document.getElementById("teamSection");
    const driverSection = document.getElementById("driverSection");
    const resultSection = document.getElementById("resultSection");
    const backButton = document.getElementById("backButton");
    const toggleSectionsButton = document.getElementById("toggleSectionsButton");
    const sectionVideos = [raceTableVideo, teamTableVideo, driverTableVideo].filter(Boolean);

    function ensureVideoLoop(videoElement) {
        if (!videoElement) {
            return;
        }

        function tryPlay() {
            if (document.hidden) {
                return;
            }

            videoElement.play().catch(function () {
                return null;
            });
        }

        videoElement.loop = true;
        videoElement.addEventListener("loadeddata", tryPlay);
        videoElement.addEventListener("canplay", tryPlay);
        window.addEventListener("focus", tryPlay);
    }

    function setVideoPlayback(videoElement, shouldPlay) {
        if (!videoElement) {
            return;
        }

        if (shouldPlay) {
            videoElement.play().catch(function () {
                return null;
            });
            return;
        }

        if (!videoElement.paused) {
            videoElement.pause();
        }
    }

    function syncVideoPlaybackState() {
        const canPlay = !document.hidden;
        const sectionsVisible = !body.classList.contains("sections-hidden") && !body.classList.contains("page-exit");

        setVideoPlayback(backgroundVideo, canPlay);

        sectionVideos.forEach(function (videoElement) {
            setVideoPlayback(videoElement, canPlay && sectionsVisible);
        });
    }

    function kickOffReveal() {
        window.requestAnimationFrame(function () {
            window.requestAnimationFrame(function () {
                body.classList.add("page-reveal");
            });
        });
    }

    function revealSections() {
        window.requestAnimationFrame(function () {
            body.classList.add("sections-reveal");
        });
    }

    function buildRaceDataUrl() {
        const currentParams = new URLSearchParams(window.location.search);
        const nextParams = new URLSearchParams();
        const championshipId = currentParams.get("championshipId");
        const championshipName = currentParams.get("championshipName");

        if (championshipId) {
            nextParams.set("championshipId", championshipId);
        }

        if (championshipName) {
            nextParams.set("championshipName", championshipName);
        }

        const query = nextParams.toString();
        return query ? `/race-data?${query}` : "/race-data";
    }

    function openRaceDataPage() {
        const targetUrl = buildRaceDataUrl();
        body.classList.add("page-exit");
        syncVideoPlaybackState();

        window.setTimeout(function () {
            window.location.href = targetUrl;
        }, 420);
    }

    function buildTeamDataUrl() {
        const currentParams = new URLSearchParams(window.location.search);
        const nextParams = new URLSearchParams();
        const championshipId = currentParams.get("championshipId");
        const championshipName = currentParams.get("championshipName");

        if (championshipId) {
            nextParams.set("championshipId", championshipId);
        }

        if (championshipName) {
            nextParams.set("championshipName", championshipName);
        }

        const query = nextParams.toString();
        return query ? `/team-data?${query}` : "/team-data";
    }

    function openTeamDataPage() {
        const targetUrl = buildTeamDataUrl();
        body.classList.add("page-exit");
        syncVideoPlaybackState();

        window.setTimeout(function () {
            window.location.href = targetUrl;
        }, 420);
    }

    function buildDriverDataUrl() {
        const currentParams = new URLSearchParams(window.location.search);
        const nextParams = new URLSearchParams();
        const championshipId = currentParams.get("championshipId");
        const championshipName = currentParams.get("championshipName");

        if (championshipId) {
            nextParams.set("championshipId", championshipId);
        }

        if (championshipName) {
            nextParams.set("championshipName", championshipName);
        }

        const query = nextParams.toString();
        return query ? `/driver-data?${query}` : "/driver-data";
    }

    function openDriverDataPage() {
        const targetUrl = buildDriverDataUrl();
        body.classList.add("page-exit");
        syncVideoPlaybackState();

        window.setTimeout(function () {
            window.location.href = targetUrl;
        }, 420);
    }

    function buildResultDataUrl() {
        const currentParams = new URLSearchParams(window.location.search);
        const nextParams = new URLSearchParams();
        const championshipId = currentParams.get("championshipId");
        const championshipName = currentParams.get("championshipName");

        if (championshipId) {
            nextParams.set("championshipId", championshipId);
        }

        if (championshipName) {
            nextParams.set("championshipName", championshipName);
        }

        const query = nextParams.toString();
        return query ? `/result-data?${query}` : "/result-data";
    }

    function openResultDataPage() {
        const targetUrl = buildResultDataUrl();
        body.classList.add("page-exit");
        syncVideoPlaybackState();

        window.setTimeout(function () {
            window.location.href = targetUrl;
        }, 420);
    }

    function backToChampionshipPage() {
        body.classList.add("page-exit");
        syncVideoPlaybackState();

        window.setTimeout(function () {
            window.location.href = `/championship?_ts=${Date.now()}`;
        }, 360);
    }

    function syncToggleState() {
        if (!toggleSectionsButton) {
            return;
        }

        const isHidden = body.classList.contains("sections-hidden");
        toggleSectionsButton.setAttribute("aria-pressed", String(isHidden));
    }

    if (toggleSectionsButton) {
        toggleSectionsButton.addEventListener("click", function () {
            body.classList.toggle("sections-hidden");
            syncToggleState();
            syncVideoPlaybackState();
        });
    }

    if (backButton) {
        backButton.addEventListener("click", backToChampionshipPage);
    }

    document.addEventListener("visibilitychange", syncVideoPlaybackState);
    window.addEventListener("focus", syncVideoPlaybackState);

    if (raceSection) {
        raceSection.addEventListener("click", openRaceDataPage);
        raceSection.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openRaceDataPage();
            }
        });
    }

    if (teamSection) {
        teamSection.addEventListener("click", openTeamDataPage);
        teamSection.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openTeamDataPage();
            }
        });
    }

    if (driverSection) {
        driverSection.addEventListener("click", openDriverDataPage);
        driverSection.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openDriverDataPage();
            }
        });
    }

    if (resultSection) {
        resultSection.addEventListener("click", openResultDataPage);
        resultSection.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openResultDataPage();
            }
        });
    }

    ensureVideoLoop(backgroundVideo);
    ensureVideoLoop(raceTableVideo);
    ensureVideoLoop(teamTableVideo);
    ensureVideoLoop(driverTableVideo);
    syncVideoPlaybackState();
    kickOffReveal();
    revealSections();
    syncToggleState();
})();
