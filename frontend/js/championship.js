(function () {
    const body = document.body;
    const statusEl = document.getElementById("status");
    const gridEl = document.getElementById("championshipGrid");
    const backButton = document.getElementById("backButton");

    function kickOffPageReveal() {
        window.requestAnimationFrame(function () {
            window.requestAnimationFrame(function () {
                body.classList.add("page-reveal");
            });
        });
    }

    function setStatus(message, isError) {
        statusEl.textContent = message;
        statusEl.classList.toggle("error", Boolean(isError));
    }

    function backToPreviousPage() {
        body.classList.add("page-exit");

        window.setTimeout(function () {
            const hasSameOriginReferrer = typeof document.referrer === "string"
                && document.referrer.startsWith(window.location.origin);

            if (hasSameOriginReferrer && window.history.length > 1) {
                window.history.back();
                return;
            }

            window.location.href = "/intro-experience.html";
        }, 360);
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function slugFromName(value) {
        return String(value ?? "")
            .normalize("NFKD")
            .replace(/[^\w\s-]/g, "")
            .trim()
            .replace(/\s+/g, "_");
    }

    function getImageCandidates(championshipName) {
        const slug = slugFromName(championshipName);
        const candidates = [];

        if (slug) {
            candidates.push(`/Media/${slug}.png`);
            candidates.push(`/Media/${slug}.jpg`);
            candidates.push(`/Media/${slug}.jpeg`);
        }

        candidates.push("/Media/Le_mans_championship.jpeg");
        candidates.push("/Media/intro_picture.png");

        return Array.from(new Set(candidates));
    }

    function attachImageFallback(imgEl, candidates) {
        if (!imgEl || !Array.isArray(candidates) || candidates.length === 0) {
            return;
        }

        let index = 0;

        imgEl.addEventListener("error", function () {
            index += 1;
            if (index < candidates.length) {
                imgEl.src = candidates[index];
            } else {
                imgEl.classList.add("is-missing");
            }
        });

        imgEl.src = candidates[0];
    }

    function createDataItem(label, value) {
        const row = document.createElement("div");
        row.className = "data-item";

        const key = document.createElement("span");
        key.className = "key";
        key.textContent = label;

        const val = document.createElement("span");
        val.className = "value";
        val.textContent = String(value ?? "-");

        row.appendChild(key);
        row.appendChild(val);
        return row;
    }

    function openDataPage(row) {
        const params = new URLSearchParams({
            championshipId: String(row.ChampionshipID ?? ""),
            championshipName: String(row.ChampionshipName ?? ""),
        });
        window.location.href = `/data?${params.toString()}`;
    }

    function createChampionshipCard(row) {
        const card = document.createElement("article");
        card.className = "championship-card";
        card.setAttribute("role", "listitem");
        card.tabIndex = 0;
        card.setAttribute("aria-label", `${row.ChampionshipName || "Championship"} details`);

        const media = document.createElement("div");
        media.className = "championship-media";

        const image = document.createElement("img");
        image.className = "championship-image";
        image.alt = `${row.ChampionshipName || "Championship"} image`;
        image.loading = "lazy";
        attachImageFallback(image, getImageCandidates(row.ChampionshipName));

        const mediaTag = document.createElement("span");
        mediaTag.className = "media-tag";
        mediaTag.textContent = "Le_mans_championship";

        media.appendChild(image);
        media.appendChild(mediaTag);

        const dataPanel = document.createElement("section");
        dataPanel.className = "championship-data";

        const title = document.createElement("h2");
        title.className = "championship-title";
        title.innerHTML = escapeHtml(row.ChampionshipName);

        const year = document.createElement("p");
        year.className = "championship-year";
        year.textContent = `Season ${row.Year ?? "-"}`;

        const dataGrid = document.createElement("div");
        dataGrid.className = "data-grid";
        dataGrid.appendChild(createDataItem("ChampionshipID", row.ChampionshipID));
        dataGrid.appendChild(createDataItem("ChampionshipName", row.ChampionshipName));
        dataGrid.appendChild(createDataItem("Year", row.Year));

        dataPanel.appendChild(title);
        dataPanel.appendChild(year);
        dataPanel.appendChild(dataGrid);

        card.appendChild(media);
        card.appendChild(dataPanel);

        card.addEventListener("click", function () {
            openDataPage(row);
        });

        card.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openDataPage(row);
            }
        });

        return card;
    }

    function renderChampionships(rows) {
        gridEl.innerHTML = "";
        body.classList.remove("cards-reveal");

        if (!Array.isArray(rows) || rows.length === 0) {
            gridEl.innerHTML = '<div class="empty-state">No championships found in the database table.</div>';
            setStatus("No records available.");
            return;
        }

        rows.forEach(function (row, index) {
            const card = createChampionshipCard(row);
            card.style.setProperty("--card-delay", `${560 + index * 180}ms`);
            gridEl.appendChild(card);
        });

        window.requestAnimationFrame(function () {
            body.classList.add("cards-reveal");
        });

        setStatus(`Loaded ${rows.length} championship${rows.length > 1 ? "s" : ""}.`);
    }

    async function loadChampionships() {
        setStatus("Loading championships...");

        try {
            const response = await fetch("/api/championships");
            if (!response.ok) {
                throw new Error(`Request failed (${response.status})`);
            }

            const data = await response.json();
            renderChampionships(data);
        } catch (error) {
            setStatus(`Unable to load championships. ${error.message}`, true);
            gridEl.innerHTML = '<div class="empty-state">Please verify backend and MySQL connectivity.</div>';
        }
    }

    if (backButton) {
        backButton.addEventListener("click", backToPreviousPage);
    }

    kickOffPageReveal();
    loadChampionships();
})();
