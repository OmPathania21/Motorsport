(function () {
    const body = document.body;
    const backgroundVideo = document.getElementById("dataBackgroundVideo");
    const raceTableVideo = document.getElementById("raceTableVideo");
    const teamTableVideo = document.getElementById("teamTableVideo");
    const driverTableVideo = document.getElementById("driverTableVideo");
    const raceSection = document.getElementById("raceSection");
    const teamSection = document.getElementById("teamSection");
    const toggleSectionsButton = document.getElementById("toggleSectionsButton");

    function ensureVideoLoop(videoElement) {
        if (!videoElement) {
            return;
        }

        function tryPlay() {
            videoElement.play().catch(function () {
                return null;
            });
        }

        videoElement.addEventListener("canplay", tryPlay);
        videoElement.addEventListener("pause", tryPlay);
        videoElement.addEventListener("ended", function () {
            videoElement.currentTime = 0;
            tryPlay();
        });

        document.addEventListener("visibilitychange", function () {
            if (!document.hidden) {
                tryPlay();
            }
        });

        window.addEventListener("focus", tryPlay);
        tryPlay();
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

        window.setTimeout(function () {
            window.location.href = targetUrl;
        }, 420);
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
        });
    }

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

    ensureVideoLoop(backgroundVideo);
    ensureVideoLoop(raceTableVideo);
    ensureVideoLoop(teamTableVideo);
    ensureVideoLoop(driverTableVideo);
    kickOffReveal();
    revealSections();
    syncToggleState();
})();
