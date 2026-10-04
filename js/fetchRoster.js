document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('roster-grid-container');
    const modal = document.getElementById('releases-modal');
    const modalClose = document.getElementById('close-modal');
    const modalArtistName = document.getElementById('modal-artist-name');
    const modalReleasesList = document.getElementById('modal-releases-list');

    // Fetch BOTH roster.json and releases.json simultaneously
    Promise.all([
        fetch('/roster.json').then(res => res.json()),
        fetch('/releases.json').then(res => res.json())
    ])
    .then(([roster, releases]) => {
        grid.innerHTML = ''; // Clear loading text
        
        roster.forEach(member => {
            // 1. Determine Roles
            const rolesArray = member.roles && member.roles.length > 0 ? member.roles : ["Main Artist"];
            let badgesHTML = '';
            
            rolesArray.forEach(role => {
                let icon = 'ph:microphone-stage-bold'; // Default icon
                let badgeClass = 'badge-artist';
                
                const r = role.toLowerCase();
                if (r.includes('management')) { icon = 'ph:briefcase-bold'; badgeClass = 'badge-management'; }
                else if (r.includes('engineering')) { icon = 'ph:sliders-horizontal-bold'; badgeClass = 'badge-engineering'; }
                else if (r.includes('media')) { icon = 'ph:camera-bold'; badgeClass = 'badge-media'; }

                badgesHTML += `<span class="role-badge ${badgeClass}"><span class="iconify" data-icon="${icon}"></span> ${role}</span>`;
            });

            // 2. Check for Profile Page
            const hasProfile = member.page && member.page.trim() !== "";

            // 3. Check for Releases
            const memberReleases = releases.filter(r => r.Artist.toLowerCase().includes(member.name.toLowerCase()));
            const hasReleases = memberReleases.length > 0;

            // 4. Build the Action Buttons Conditionally
            let actionsHTML = '';
            if (hasProfile || hasReleases) {
                actionsHTML = '<div class="artist-actions">';
                if (hasProfile) actionsHTML += `<a href="${member.page}" class="btn btn-profile">Profile</a>`;
                if (hasReleases) actionsHTML += `<button class="btn btn-releases" data-artist="${member.name}">Releases</button>`;
                actionsHTML += '</div>';
            }

            // 5. Build the Bio Conditionally (Hides it completely if blank)
            const bioHTML = member.bio && member.bio.trim() !== "" 
                ? `<p class="artist-bio">${member.bio}</p>` 
                : "";

            // 6. Build the Card
            const card = document.createElement('div');
            card.className = 'artist-card';
            
            // For styling purposes: if there is no bio, we can add a little margin-bottom to the roles 
            // so it doesn't touch the buttons.
            const badgeMargin = bioHTML === "" ? 'style="margin-bottom: 20px;"' : '';

            card.innerHTML = `
                <img src="${member.pfp}" alt="${member.name}" class="artist-pfp" loading="lazy" onerror="this.src='/assets/favicon.png'">
                <h3 class="artist-name">${member.name}</h3>
                <div class="role-badges-container" ${badgeMargin}>${badgesHTML}</div>
                ${bioHTML}
                ${actionsHTML}
            `;
            grid.appendChild(card);
        });

        // Attach click events to any generated "Releases" buttons
        document.querySelectorAll('.btn-releases').forEach(button => {
            button.addEventListener('click', (e) => {
                const artistName = e.target.getAttribute('data-artist');
                openModal(artistName, releases);
            });
        });
    })
    .catch(err => {
        console.error('Error loading data:', err);
        grid.innerHTML = '<p style="text-align: center; color: red;">Failed to load roster.</p>';
    });

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown Date';
        const [year, month, day] = dateString.split('-');
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    function openModal(artistName, releasesData) {
        modalArtistName.textContent = `${artistName} — Recent Releases`;
        modalReleasesList.innerHTML = '';

        const artistReleases = releasesData.filter(r => r.Artist.toLowerCase().includes(artistName.toLowerCase()));
        artistReleases.sort((a, b) => new Date(b["Release Date"]) - new Date(a["Release Date"]));
        const recentReleases = artistReleases.slice(0, 5);

        recentReleases.forEach(release => {
            modalReleasesList.innerHTML += `
                <div class="release-item">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <strong>${release.Title}</strong>
                        <span style="font-size: 0.75em; color: #888; text-transform: uppercase;">${release.Format}</span>
                    </div>
                    <span style="font-size: 0.9em; color: #aaa;">${formatDate(release["Release Date"])}</span>
                </div>
            `;
        });
        
        if (artistReleases.length > 5) {
            modalReleasesList.innerHTML += `
                <div class="release-item" style="text-align: center; background: transparent; padding-top: 5px;">
                    <span style="color: #888; font-size: 0.85em;">+ ${artistReleases.length - 5} more on their profile</span>
                </div>
            `;
        }

        modal.classList.add('active');
    }

    modalClose.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });
});