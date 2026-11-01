
// Short-Link Studio - Main Application Logic

let links = JSON.parse(localStorage.getItem("shortLinks")) || [];

let analytics = JSON.parse(localStorage.getItem("analytics")) || {
    total: 0,
    human: 0,
    bot: 0
};

// Generate a unique short code
function generateCode() {
    return Math.random().toString(36).substring(2, 8);
}

// Save application data
function saveData() {
    localStorage.setItem("shortLinks", JSON.stringify(links));
    localStorage.setItem("analytics", JSON.stringify(analytics));
}

// Create a short link
function createShortLink() {
    const urlInput = document.getElementById("longUrl");
    const aliasInput = document.getElementById("customAlias");
    const result = document.getElementById("result");

    const url = urlInput.value.trim();
    const alias = aliasInput.value.trim();

    if (!url) {
        result.textContent = "Please enter a URL.";
        return;
    }

    let destination;

    try {
        destination = new URL(url);

        if (!["http:", "https:"].includes(destination.protocol)) {
            throw new Error("Invalid protocol");
        }
    } catch {
        result.textContent = "Please enter a valid HTTP or HTTPS URL.";
        return;
    }

    const code = alias || generateCode();

    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(code)) {
        result.textContent = "Alias must be 3–20 characters.";
        return;
    }

    if (links.some(link => link.code === code)) {
        result.textContent = "This alias already exists!";
        return;
    }

    links.push({
        code: code,
        url: destination.href,
        clicks: 0
    });

    saveData();
    displayLinks();

    result.textContent = "Short link created successfully: " +
        location.origin + location.pathname + "#" + code;

    urlInput.value = "";
    aliasInput.value = "";
}

// Display saved links
function displayLinks() {
    const list = document.getElementById("linkList");

    list.innerHTML = "";

    if (links.length === 0) {
        list.textContent = "No links created yet.";
        return;
    }

    links.forEach((link, index) => {
        const card = document.createElement("div");
        card.style.padding = "15px";
        card.style.marginBottom = "12px";
        card.style.background = "#eff6ff";
        card.style.borderRadius = "8px";

        const title = document.createElement("strong");
        title.textContent = "Short code: " + link.code;

        const destination = document.createElement("p");
        destination.textContent = link.url;
        destination.style.overflowWrap = "anywhere";

        const count = document.createElement("p");
        count.textContent = "Clicks: " + link.clicks;

        const openButton = document.createElement("button");
        openButton.textContent = "Open Link";
        openButton.style.marginTop = "10px";

        openButton.onclick = () => openShortLink(index);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.style.marginLeft = "10px";
        deleteButton.style.background = "#dc2626";

        deleteButton.onclick = () => {
            links.splice(index, 1);
            saveData();
            displayLinks();
        };

        card.append(title, destination, count, openButton, deleteButton);
        list.appendChild(card);
    });
}

// Open and track a short link
function openShortLink(index) {
    const link = links[index];

    if (!link) return;

    const destination = link.url;

    trackTraffic("human", index);

    window.open(destination, "_blank", "noopener,noreferrer");
}

// Classify simulated traffic
function classifyTraffic(interval, frequency, userAgent, referrer) {
    let risk = 0;

    if (interval < 1) risk += 2;
    if (frequency > 10) risk += 2;
    if (/bot|crawler|spider/i.test(userAgent)) risk += 2;
    if (!referrer) risk += 1;

    return risk >= 3 ? "bot" : "human";
}

// Record traffic
function trackTraffic(type, index = null) {
    analytics.total++;

    if (type === "bot") {
        analytics.bot++;
    } else {
        analytics.human++;
    }

    if (index !== null && links[index]) {
        links[index].clicks++;
    }

    saveData();
    updateAnalytics();
    displayLinks();
}

// Simulate incoming traffic
function simulateTraffic() {
    const interval = Math.random() * 5;
    const frequency = Math.floor(Math.random() * 20);
    const userAgent = Math.random() > 0.7
        ? "Googlebot"
        : navigator.userAgent;
    const referrer = Math.random() > 0.5
        ? "https://example.com"
        : "";

    const result = classifyTraffic(
        interval,
        frequency,
        userAgent,
        referrer
    );

    trackTraffic(result);

    alert("Simulated click classified as: " + result.toUpperCase());
}

// Update analytics dashboard
function updateAnalytics() {
    document.getElementById("totalClicks").textContent =
        analytics.total;

    document.getElementById("humanClicks").textContent =
        analytics.human;

    document.getElementById("botClicks").textContent =
        analytics.bot;
}

// Add traffic simulation button
function setupSimulator() {
    const section = document.querySelector(".analytics");

    const button = document.createElement("button");
    button.textContent = "Simulate Incoming Traffic";
    button.style.marginTop = "20px";
    button.onclick = simulateTraffic;

    section.appendChild(button);
}

// Initialize application
displayLinks();
updateAnalytics();
setupSimulator();
