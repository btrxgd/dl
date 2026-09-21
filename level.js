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
            throw new Error(`levels.json returned HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!data.levels || !Array.isArray(data.levels)) {
            throw new Error('levels.json does not contain a valid "levels" array');
        }

        const level = data.levels.find(item => String(item.id) === String(id));

        if (!level) {
            showError("Level not found.");
            return;
        }

        document.title = `${level.name} - ${data.name || "Demonlist"}`;

        const records = level.records || [];
        const videoId = getYouTubeVideoId(level.verification);

        container.innerHTML = `
            <section class="level-hero">

                <div class="level-video">
                    ${
                        videoId
                            ? `
                                <div class="video-wrapper">
                                    <iframe
                                        src="https://www.youtube.com/embed/${escapeAttribute(videoId)}"
                                        title="${escapeAttribute(level.name)} verification"
                                        frameborder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowfullscreen>
                                    </iframe>
                                </div>
                            `
                            : `
                                <div class="no-video">
                                    No verification video available.
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
                            ${escapeHTML(level.difficulty || "Extreme Demon")}
                        </span>

                        <span>
                            Verified by ${escapeHTML(level.verifier || "Unknown")}
                        </span>
                    </div>
                </div>

            </section>

            <section class="section">
                <h2>Verification</h2>

                <p class="section-description">
                    Official verification video for this level.
                </p>

                ${
                    level.verification
                        ? `
                            <a
                                class="button"
                                href="${escapeAttribute(level.verification)}"
                                target="_blank"
                                rel="noopener noreferrer">
                                Open on YouTube
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
                                ${records.map((record, index) => {
                                    const recordVideo =
                                        getYouTubeVideoId(record.video);

                                    return `
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
                                                recordVideo
                                                    ? `
                                                        <button
                                                            class="record-video"
                                                            onclick="toggleRecordVideo(this, '${escapeAttribute(recordVideo)}')">
                                                            ▶ Video
                                                        </button>
                                                    `
                                                    : ""
                                            }
                                        </div>
                                    `;
                                }).join("")}
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


function getYouTubeVideoId(url) {
    if (!url) {
        return null;
    }

    try {
        const parsed = new URL(url);

        if (parsed.hostname === "youtu.be") {
            return parsed.pathname.slice(1).split("/")[0];
        }

        if (
            parsed.hostname === "youtube.com" ||
            parsed.hostname === "www.youtube.com"
        ) {
            const videoId = parsed.searchParams.get("v");

            if (videoId) {
                return videoId;
            }

            if (parsed.pathname.startsWith("/live/")) {
                return parsed.pathname.split("/")[2];
            }

            if (parsed.pathname.startsWith("/shorts/")) {
                return parsed.pathname.split("/")[2];
            }
        }

        return null;
    } catch {
        return null;
    }
}


function toggleRecordVideo(button, videoId) {
    const record = button.closest(".record");

    const existing = record.querySelector(".record-player-frame");

    if (existing) {
        existing.remove();
        button.textContent = "▶ Video";
        return;
    }

    const iframe = document.createElement("iframe");

    iframe.className = "record-player-frame";
    iframe.src = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}`;
    iframe.title = "Record video";
    iframe.frameBorder = "0";
    iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;

    record.appendChild(iframe);

    button.textContent = "✕ Close";
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
        .replace(/>/g, "&gt;")
        .replace(/'/g, "&#039;");
}


loadLevel();
