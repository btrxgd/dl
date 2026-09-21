async function loadDemonlist() {
    const list = document.getElementById("level-list");

    try {
        const response = await fetch("./levels.json", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(
                `levels.json returned HTTP ${response.status}`
            );
        }

        const data = await response.json();

        if (!data.levels || !Array.isArray(data.levels)) {
            throw new Error(
                "levels.json does not contain a valid \"levels\" array"
            );
        }

        document.title = data.name || "Demonlist";

        document.getElementById("list-name").textContent =
            data.name || "Demonlist";

        document.getElementById("list-description").textContent =
            data.description || "";

        const levels = [...data.levels];

        levels.sort((a, b) => a.position - b.position);

        list.innerHTML = "";

        for (const level of levels) {
            const card = document.createElement("a");

            card.className = "level-card";
            card.href = `level.html?id=${encodeURIComponent(level.id)}`;

            card.innerHTML = `
                <div class="level-position">
                    #${level.position}
                </div>

                <div class="level-info">
                    <h2>${escapeHTML(level.name)}</h2>
                    <p>by ${escapeHTML(level.creator)}</p>
                </div>

                <div class="level-difficulty">
                    ${escapeHTML(level.difficulty || "Extreme Demon")}
                </div>
            `;

            list.appendChild(card);
        }

        if (levels.length === 0) {
            list.innerHTML = `
                <div class="empty">
                    There are currently no levels on the list.
                </div>
            `;
        }

    } catch (error) {
        console.error(error);

        list.innerHTML = `
            <div class="error">
                <strong>Failed to load the demonlist.</strong>
                <br><br>
                ${escapeHTML(error.message)}
            </div>
        `;
    }
}

function escapeHTML(value) {
    const element = document.createElement("div");
    element.textContent = value ?? "";
    return element.innerHTML;
}

loadDemonlist();
