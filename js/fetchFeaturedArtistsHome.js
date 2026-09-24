/* Dynamically builds the homepage Featured Artists gallery. */
(() => {
    const ARTISTS_URL = "/artists.json";
    const RELEASES_URL = "/releases.json";
    const GRID_ID = "featured-artists-grid";

    const ARTIST_URLS = {
        "v0calyst": "/artists/V0CALYST",
        "pezzz!": "/artists/PEZZZ",
        "claire eterna": "/artists/claire-eterna",
        "sollaceee!": "/artists/sollaceee",
        "ramona heart": "/artists/ramona-heart",
        "jacob cooper": "/artists/jacob-cooper"
    };

    const normalize = (value = "") =>
        String(value)
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ");

    const artistUrl = (name) => {
        const key = normalize(name);

        if (ARTIST_URLS[key]) {
            return ARTIST_URLS[key];
        }

        return "/artists/" + key
            .replace(/!/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    };

    const escapeText = (value = "") => String(value);

    const parseDate = (value) => {
        if (!value) return null;

        const date = new Date(String(value) + "T00:00:00");

        return Number.isNaN(date.getTime()) ? null : date;
    };

    const getArtistNames = (artistString) =>
        String(artistString || "")
            .split(",")
            .map(name => normalize(name))
            .filter(Boolean);

    const isFuture = (date) => {
        if (!date) return false;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return date > today;
    };

    const formatDate = (date) => {
        if (!date) return "";

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        }).toUpperCase();
    };

    const getLatestReleaseForArtist = (artistName, releases) => {
        const key = normalize(artistName);

        const matching = releases
            .filter(release =>
                getArtistNames(release.Artist).includes(key)
            )
            .map(release => ({
                release,
                date: parseDate(release["Release Date"])
            }))
            .filter(item => item.date)
            .sort((a, b) => b.date - a.date);

        return matching[0] || null;
    };

    const sortArtists = (artists) => {
        return [...artists].sort((a, b) => {
            const aRelease = a.latestRelease;
            const bRelease = b.latestRelease;

            if (!aRelease && !bRelease) {
                return normalize(a.name).localeCompare(normalize(b.name));
            }

            if (!aRelease) return 1;
            if (!bRelease) return -1;

            const aFuture = isFuture(aRelease.date);
            const bFuture = isFuture(bRelease.date);

            // Upcoming releases always lead the gallery.
            if (aFuture && !bFuture) return -1;
            if (!aFuture && bFuture) return 1;

            // Upcoming: earliest upcoming release first.
            if (aFuture && bFuture) {
                return aRelease.date - bRelease.date;
            }

            // Released: newest release first.
            return bRelease.date - aRelease.date;
        });
    };

    const createArtistCard = (artist) => {
        const link = document.createElement("a");

        link.className = "home-artist-card";
        link.href = artistUrl(artist.name);

        const image = document.createElement("img");
        image.src = artist.pfp;
        image.alt = artist.name;
        image.loading = "lazy";

        const info = document.createElement("div");
        info.className = "home-artist-card-info";

        const name = document.createElement("div");
        name.className = "home-artist-card-name";
        name.textContent = artist.name;

        const label = document.createElement("div");
        label.className = "home-artist-card-label";

        if (artist.latestRelease?.date) {
            const upcoming = isFuture(artist.latestRelease.date);

            label.textContent = upcoming
                ? "up next // " + formatDate(artist.latestRelease.date)
                : "latest // " + formatDate(artist.latestRelease.date);
        } else {
            label.textContent = "artist // RAINOUT";
        }

        info.appendChild(name);
        info.appendChild(label);

        link.appendChild(image);
        link.appendChild(info);

        return link;
    };

    const render = async () => {
        const grid = document.getElementById(GRID_ID);

        if (!grid) return;

        try {
            const [artistsResponse, releasesResponse] = await Promise.all([
                fetch(ARTISTS_URL, { cache: "no-store" }),
                fetch(RELEASES_URL, { cache: "no-store" })
            ]);

            if (!artistsResponse.ok) {
                throw new Error("Unable to load artists.json");
            }

            if (!releasesResponse.ok) {
                throw new Error("Unable to load releases.json");
            }

            const artists = await artistsResponse.json();
            const releases = await releasesResponse.json();

            if (!Array.isArray(artists)) {
                throw new Error("artists.json must contain an array");
            }

            if (!Array.isArray(releases)) {
                throw new Error("releases.json must contain an array");
            }

            const enriched = artists.map(artist => ({
                ...artist,
                latestRelease: getLatestReleaseForArtist(
                    artist.name,
                    releases
                )
            }));

            const sorted = sortArtists(enriched);

            // Clear the loading state before adding cards.
            grid.replaceChildren();

            // The homepage currently displays the four most relevant artists.
            sorted
                .slice(0, 4)
                .forEach(artist => {
                    grid.appendChild(createArtistCard(artist));
                });

            if (!sorted.length) {
                grid.innerHTML = '<p class="home-data-empty">No featured artists found.</p>';
            }

        } catch (error) {
            console.error("Error loading featured artists:", error);

            grid.innerHTML = `
                <p class="home-data-error">
                    Featured artists are currently unavailable.
                </p>
            `;
        }
    };

    document.addEventListener("DOMContentLoaded", render);
})();