async function loadLevel() {
    const container = document.getElementById("level-page");

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        showError("No level was specified.");
        return;
    }

    try {
        const response = await fetch("./levels.json", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("Could not load levels.json");
        }

        const data = await response.json();

        const level = data.levels.find(item => item.id === id);

        if (!level) {
            showError("Level not found.");
            return;
        }

        document.title = `${level.name} - ${data.name || "Demonlist"}`;

        const records = level.records || [];
        const thumbnail = getYouTubeThumbnail(level.verification);

        container.innerHTML = `
            <a href="index.html" class="back-link">
                ← Back to Demonlist
            </a>

            <section class="level-hero">

                <div class="level-thumbnail">
                    ${
                        thumbnail
                            ? `
                                <a
                                    href="${escapeAttribute(level.verification)}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <img
                                        src="${thumbnail}"
                                        alt="${escapeAttribute(level.name)} thumbnail"
                                    >

                                    <div class="play-button">
                                        ▶
                                    </div>
                                </a>
                            `
                            : `
                                <div class="no-thumbnail">
                                    No thumbnail available
                                </div>
                            `
                    }
                </div>

                <div class="level-info">

                    <div class="level-position">
                        #${level.position}
                    </div>

                    <h1>${escapeHTML(level.name)}</h1>

                    <p class="creator">
                        by ${escapeHTML(level.creator)}
                    </p>

                    <div class="level-details">

                        <span>
                            ${escapeHTML(
                                level.difficulty || "Extreme Demon"
                            )}
                        </span>

                        <span>
                            Verified by
                            ${escapeHTML(level.verifier || "Unknown")}
                        </span>

                    </div>

                </div>

            </section>

            <section class="section">

                <h2>Verification</h2>

                <p class="section-description">
                    Watch the official verification video for this level.
                </p>

                ${
                    level.verification
                        ? `
                            <a
                                class="button"
                                href="${escapeAttribute(level.verification)}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                ▶ Watch on YouTube
                            </a>
                        `
                        : `
                            <p class="muted">
                                No verification video available.
                            </p>
                        `
                }

            </section>

            <section class="section">

                <h2>Records</h2>

                ${
                    records.length
                        ? `
                            <div class="records">

                                ${records.map((record, index) => `
                                    <div class="record">

                                        <div class="record-rank">
                                            #${index + 1}
                                        </div>

                                        <div class="record-player">
                                            ${escapeHTML(record.player)}
                                        </div>

                                        <div class="record-percent">
                                            ${record.percent}%
                                        </div>

                                        ${
                                            record.video
                                                ? `
                                                    <a
                                                        class="record-video"
                                                        href="${escapeAttribute(record.video)}"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        ▶ Video
                                                    </a>
                                                `
                                                : ""
                                        }

                                    </div>
                                `).join("")}

                            </div>
                        `
                        : `
                            <p class="muted">
                                No records submitted yet.
                            </p>
                        `
                }

            </section>
        `;

    } catch (error) {
        console.error(error);
        showError(error.message);
    }
}


function getYouTubeThumbnail(url) {
    if (!url) {
        return null;
    }

    try {
        const parsed = new URL(url);

        let videoId = null;

        if (parsed.hostname === "youtu.be") {
            videoId = parsed.pathname.slice(1);
        }

        if (
            parsed.hostname === "www.youtube.com" ||
            parsed.hostname === "youtube.com"
        ) {
            videoId = parsed.searchParams.get("v");
        }

        if (!videoId) {
            return null;
        }

        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    } catch {
        return null;
    }
}


function showError(message) {
    document.getElementById("level-page").innerHTML = `
        <div class="error">
            ${escapeHTML(message)}
        </div>
    `;
}


function escapeHTML(value) {
    const element = document.createElement("div");
    element.textContent = value ?? "";
    return element.innerHTML;
}


function escapeAttribute(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}


loadLevel();
