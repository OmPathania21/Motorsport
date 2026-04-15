const API_BASE = window.location.origin.startsWith("http")
	? `${window.location.origin}/api`
	: "http://127.0.0.1:5001/api";

const state = {
	championships: [],
	selectedChampionshipId: null,
	championshipResults: [],
};

const elements = {
	loadingChampionships: document.getElementById("loadingChampionships"),
	championshipList: document.getElementById("championshipList"),
	selectedTitle: document.getElementById("selectedTitle"),
	selectedMeta: document.getElementById("selectedMeta"),
	errorBanner: document.getElementById("errorBanner"),
	teamsList: document.getElementById("teamsList"),
	driversList: document.getElementById("driversList"),
	racesList: document.getElementById("racesList"),
	allResultsBtn: document.getElementById("allResultsBtn"),
	resultsTableBody: document.querySelector("#resultsTable tbody"),
};

const backButton = document.getElementById("backButton");

if (backButton) {
	backButton.addEventListener("click", () => {
		const hasSameOriginReferrer = typeof document.referrer === "string"
			&& document.referrer.startsWith(window.location.origin);

		if (hasSameOriginReferrer && window.history.length > 1) {
			window.history.back();
			return;
		}

		window.location.href = "/intro-experience.html";
	});
}

async function fetchJson(path) {
	const response = await fetch(`${API_BASE}${path}`);

	if (!response.ok) {
		let details = "";
		try {
			const body = await response.json();
			if (body.error) {
				details = `: ${body.error}`;
			}
		} catch (error) {
			details = "";
		}
		throw new Error(`Request failed (${response.status})${details}`);
	}

	return response.json();
}

function showError(message) {
	elements.errorBanner.textContent = message;
	elements.errorBanner.classList.remove("hidden");
}

function clearError() {
	elements.errorBanner.textContent = "";
	elements.errorBanner.classList.add("hidden");
}

function setListMessage(listElement, message) {
	listElement.innerHTML = `<li class="muted">${escapeHtml(message)}</li>`;
}

function formatDate(value) {
	if (!value) {
		return "-";
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return value;
	}

	return date.toLocaleDateString();
}

function escapeHtml(value) {
	return String(value ?? "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/\"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

function highlightActiveChampionship() {
	const buttons = elements.championshipList.querySelectorAll("button");
	buttons.forEach((button) => {
		const championshipId = Number(button.dataset.id);
		button.classList.toggle("active", championshipId === state.selectedChampionshipId);
	});
}

function clearRaceSelection() {
	const raceButtons = elements.racesList.querySelectorAll("button");
	raceButtons.forEach((button) => button.classList.remove("active"));
}

function renderChampionships(championships) {
	elements.championshipList.innerHTML = "";

	if (!championships.length) {
		setListMessage(elements.championshipList, "No championships found in database.");
		return;
	}

	championships.forEach((championship) => {
		const listItem = document.createElement("li");
		const button = document.createElement("button");
		button.type = "button";
		button.dataset.id = championship.ChampionshipID;
		button.className = "championship-btn";
		button.innerHTML = `
			<span class="title">${escapeHtml(championship.ChampionshipName)}</span>
			<span class="meta">Season ${escapeHtml(championship.Year)}</span>
		`;

		button.addEventListener("click", () => {
			loadChampionshipDetails(championship);
		});

		listItem.appendChild(button);
		elements.championshipList.appendChild(listItem);
	});

	highlightActiveChampionship();
}

function renderTeams(teams) {
	elements.teamsList.innerHTML = "";

	if (!teams.length) {
		setListMessage(elements.teamsList, "No teams found for this championship.");
		return;
	}

	teams.forEach((team) => {
		const listItem = document.createElement("li");
		listItem.innerHTML = `
			<span class="label">${escapeHtml(team.TeamName)}</span>
			<span class="meta">${escapeHtml(team.Manufacturer)} | Car ${escapeHtml(team.CarNumber)}</span>
		`;
		elements.teamsList.appendChild(listItem);
	});
}

function renderDrivers(drivers) {
	elements.driversList.innerHTML = "";

	if (!drivers.length) {
		setListMessage(elements.driversList, "No drivers found for this championship.");
		return;
	}

	drivers.forEach((driver) => {
		const listItem = document.createElement("li");
		listItem.innerHTML = `
			<span class="label">${escapeHtml(driver.DriverName)}</span>
			<span class="meta">${escapeHtml(driver.TeamName)} | ${escapeHtml(driver.Nationality)}</span>
		`;
		elements.driversList.appendChild(listItem);
	});
}

function renderRaces(races) {
	elements.racesList.innerHTML = "";

	if (!races.length) {
		setListMessage(elements.racesList, "No races found for this championship.");
		return;
	}

	races.forEach((race) => {
		const listItem = document.createElement("li");
		const button = document.createElement("button");
		button.type = "button";
		button.className = "race-btn";
		button.innerHTML = `
			<span class="label">${escapeHtml(race.RaceName)}</span>
			<span class="meta">${escapeHtml(race.TrackName)} | ${formatDate(race.RaceDate)} ${escapeHtml(race.RaceTime || "")}</span>
		`;

		button.addEventListener("click", async () => {
			clearRaceSelection();
			button.classList.add("active");
			await loadRaceResults(race);
		});

		listItem.appendChild(button);
		elements.racesList.appendChild(listItem);
	});
}

function renderResults(results) {
	elements.resultsTableBody.innerHTML = "";

	if (!results.length) {
		elements.resultsTableBody.innerHTML = "<tr><td colspan=\"6\" class=\"muted\">No race results found.</td></tr>";
		return;
	}

	results.forEach((result) => {
		const row = document.createElement("tr");
		row.innerHTML = `
			<td>${escapeHtml(result.RaceName || `#${result.RaceID}`)}</td>
			<td>${escapeHtml(result.TeamName || result.TeamID || "-")}</td>
			<td>${escapeHtml(result.FinalPosition || "-")}</td>
			<td>${escapeHtml(result.Status || "-")}</td>
			<td>${escapeHtml(result.LapsCompleted || "-")}</td>
			<td>${escapeHtml(result.PointsEarned || "0")}</td>
		`;
		elements.resultsTableBody.appendChild(row);
	});
}

async function loadRaceResults(race) {
	clearError();
	elements.resultsTableBody.innerHTML = "<tr><td colspan=\"6\" class=\"muted\">Loading race results...</td></tr>";

	try {
		const results = await fetchJson(`/races/${race.RaceID}/results`);
		renderResults(results);
		elements.selectedMeta.textContent = `Showing filtered results for ${race.RaceName}.`;
	} catch (error) {
		showError(`Unable to load ${race.RaceName} results. ${error.message}`);
		renderResults([]);
	}
}

function resetDetailPanels() {
	setListMessage(elements.teamsList, "Loading teams...");
	setListMessage(elements.driversList, "Loading drivers...");
	setListMessage(elements.racesList, "Loading races...");
	elements.resultsTableBody.innerHTML = "<tr><td colspan=\"6\" class=\"muted\">Loading race results...</td></tr>";
}

async function loadChampionshipDetails(championship) {
	clearError();
	state.selectedChampionshipId = Number(championship.ChampionshipID);
	highlightActiveChampionship();

	elements.selectedTitle.textContent = championship.ChampionshipName;
	elements.selectedMeta.textContent = `Season ${championship.Year}`;
	elements.allResultsBtn.classList.add("hidden");
	resetDetailPanels();

	try {
		const [teams, drivers, races, results] = await Promise.all([
			fetchJson(`/championships/${championship.ChampionshipID}/teams`),
			fetchJson(`/championships/${championship.ChampionshipID}/drivers`),
			fetchJson(`/championships/${championship.ChampionshipID}/races`),
			fetchJson(`/championships/${championship.ChampionshipID}/results`),
		]);

		state.championshipResults = results;
		renderTeams(teams);
		renderDrivers(drivers);
		renderRaces(races);
		renderResults(results);

		if (results.length) {
			elements.allResultsBtn.classList.remove("hidden");
		}
	} catch (error) {
		showError(`Unable to load championship data. ${error.message}`);
		renderTeams([]);
		renderDrivers([]);
		renderRaces([]);
		renderResults([]);
	}
}

async function loadChampionships() {
	elements.loadingChampionships.classList.remove("hidden");
	clearError();

	try {
		const championships = await fetchJson("/championships");
		state.championships = championships;
		renderChampionships(championships);

		if (championships.length) {
			await loadChampionshipDetails(championships[0]);
		}
	} catch (error) {
		showError(`Unable to load championships. ${error.message}`);
		setListMessage(elements.championshipList, "Could not load championships from backend.");
	} finally {
		elements.loadingChampionships.classList.add("hidden");
	}
}

elements.allResultsBtn.addEventListener("click", () => {
	clearRaceSelection();
	renderResults(state.championshipResults);

	if (state.selectedChampionshipId !== null) {
		const selected = state.championships.find(
			(championship) => Number(championship.ChampionshipID) === state.selectedChampionshipId,
		);
		if (selected) {
			elements.selectedMeta.textContent = `Season ${selected.Year}`;
		}
	}
});

loadChampionships();
