(function () {
    const body = document.body;
    const backgroundVideo = document.getElementById("raceDataBackgroundVideo");
    const contextMeta = document.getElementById("contextMeta");
    const statusEl = document.getElementById("status");
    const rowsEl = document.getElementById("raceDataRows");
    const backToDataButton = document.getElementById("backToDataButton");
    const queryParams = new URLSearchParams(window.location.search);

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

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatDate(value) {
        if (!value) {
            return "-";
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return escapeHtml(value);
        }

        return date.toLocaleDateString();
    }

    function setStatus(message, isError) {
        statusEl.textContent = message;
        statusEl.classList.toggle("error", Boolean(isError));
    }

    function setContextMeta(championshipName, championshipId) {
        if (championshipName) {
            contextMeta.textContent = `Showing races for ${championshipName}.`;
            return;
        }

        contextMeta.textContent = `Showing races for championship #${championshipId}.`;
    }

    function renderRows(rows) {
        rowsEl.innerHTML = "";

        if (!Array.isArray(rows) || rows.length === 0) {
            rowsEl.innerHTML = '<tr><td class="muted-cell" colspan="6">No race rows found in SQL for this championship.</td></tr>';
            return;
        }

        rows.forEach(function (row) {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${escapeHtml(row.RaceID ?? "-")}</td>
                <td>${escapeHtml(row.RaceName ?? "-")}</td>
                <td>${escapeHtml(row.TrackName ?? "-")}</td>
                <td>${formatDate(row.RaceDate)}</td>
                <td>${escapeHtml(row.RaceTime ?? "-")}</td>
                <td>${escapeHtml(row.ChampionshipID ?? "-")}</td>
            `;
            rowsEl.appendChild(tr);
        });
    }

    function buildDataPageUrl() {
        const nextParams = new URLSearchParams();
        const championshipId = queryParams.get("championshipId");
        const championshipName = queryParams.get("championshipName");

        if (championshipId) {
            nextParams.set("championshipId", championshipId);
        }

        if (championshipName) {
            nextParams.set("championshipName", championshipName);
        }

        const query = nextParams.toString();
        return query ? `/data?${query}` : "/data";
    }

    function backToDataPage() {
        body.classList.add("page-exit");
        window.setTimeout(function () {
            window.location.href = buildDataPageUrl();
        }, 360);
    }

    async function resolveChampionshipContext() {
        const championshipIdRaw = queryParams.get("championshipId");
        const championshipId = Number(championshipIdRaw);
        const championshipName = queryParams.get("championshipName") || "";

        if (Number.isInteger(championshipId) && championshipId > 0) {
            return {
                championshipId: championshipId,
                championshipName: championshipName,
            };
        }

        const response = await fetch("/api/championships");
        if (!response.ok) {
            throw new Error(`Unable to resolve championship context (request failed: ${response.status}).`);
        }

        const championships = await response.json();
        if (!Array.isArray(championships) || championships.length === 0) {
            throw new Error("No championships were found in SQL.");
        }

        const firstChampionship = championships[0];
        return {
            championshipId: Number(firstChampionship.ChampionshipID),
            championshipName: championshipName || String(firstChampionship.ChampionshipName || ""),
        };
    }

    async function loadRaceData() {
        try {
            const context = await resolveChampionshipContext();
            const championshipId = context.championshipId;
            const championshipName = context.championshipName;

            if (!Number.isInteger(championshipId) || championshipId <= 0) {
                throw new Error("Championship context is invalid.");
            }

            setContextMeta(championshipName, championshipId);
            setStatus("Loading race rows from SQL database...", false);

            const response = await fetch(`/api/championships/${championshipId}/races`);
            if (!response.ok) {
                let details = "";

                try {
                    const payload = await response.json();
                    if (payload && payload.error) {
                        details = `: ${payload.error}`;
                    }
                } catch (parseError) {
                    details = "";
                }

                throw new Error(`Request failed (${response.status})${details}`);
            }

            const rows = await response.json();
            renderRows(rows);
            setStatus(`Loaded ${rows.length} race row${rows.length === 1 ? "" : "s"} from SQL.`, false);
        } catch (error) {
            renderRows([]);
            setStatus(`Unable to load SQL race table. ${error.message}`, true);
        }
    }

    if (backToDataButton) {
        backToDataButton.addEventListener("click", backToDataPage);
    }

    ensureVideoLoop(backgroundVideo);
    kickOffReveal();
    loadRaceData();
})();
