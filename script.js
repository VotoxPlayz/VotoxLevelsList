// script.js

// Global variables
let processedLevels = []; 
let submitted = false; 

/**
 * Calculates the 100% VLL Points for a given rank using exponential decay.
 * R=1 gives 500 points. R=N (total levels) gives approx 1 point.
 * @param {number} rank - The rank of the level (1-indexed).
 * @param {number} totalLevels - The total number of levels on the list.
 * @returns {number} The 100% completion VLL Points.
 */
function calculateExponentialPoints(rank, totalLevels) {
    if (rank === 1) return 500;
    if (totalLevels <= 1) return 500; 

    const P_max = 500;
    const P_min = 1;
    
    // Calculate decay constant 'k' such that P(N) ≈ 1
    // P_min = P_max * exp(-k * (N - 1))
    // k = -ln(P_min / P_max) / (N - 1)
    const k = -Math.log(P_min / P_max) / (totalLevels - 1);
    
    // Calculate points for the current rank R
    let points = P_max * Math.exp(-k * (rank - 1));
    
    // Round to a clean two decimal places for point accuracy
    return parseFloat(points.toFixed(2));
}

/**
 * Calculates VLL Points for a player based on their completion percentage.
 * @param {number} P_100 - The 100% completion points for the level.
 * @param {number} percentage - The player's completion percentage (0-100).
 * @param {number} listPercentThreshold - The level's List% requirement (e.g., 75).
 * @returns {number} The VLL Points earned.
 */
function calculateVLLPoints(P_100, percentage, listPercentThreshold) {
    if (percentage === 100) return P_100;
    
    // Check if the run meets the List% threshold
    if (percentage < listPercentThreshold) return 0;

    // P_List% = 10% of P_100
    const P_list = P_100 * 0.1;

    // Total points available in the linear zone (from List% to 100%)
    const P_linear = P_100 - P_list;
    
    // Percentage span for the linear zone
    const percentSpan = 100 - listPercentThreshold; 
    
    // If percentSpan is 0 (i.e., List% is 100), then points are P_100 or 0
    if (percentSpan <= 0) return (percentage >= 100 ? P_100 : 0);

    // Points per percentage point in the linear zone
    const pointsPerPercent = P_linear / percentSpan;
    
    // Points earned in the linear zone
    const earnedLinearPoints = pointsPerPercent * (percentage - listPercentThreshold);
    
    return parseFloat((P_list + earnedLinearPoints).toFixed(2));
}


/**
 * Processes the raw LEVEL_DATA, calculates rank, VLL Points, and merges records.
 */
function processLevelData() {
    if (typeof LEVEL_DATA !== 'undefined' && Array.isArray(LEVEL_DATA) && LEVEL_DATA.length > 0) {
        const totalLevels = LEVEL_DATA.length;
        
        processedLevels = LEVEL_DATA.map((level, index) => {
            const rank = index + 1;
            
            // 1. Calculate 100% VLL Points
            const P_100 = calculateExponentialPoints(rank, totalLevels);
            
            // 2. Merge Victors (now called Records) from VICTOR_COMPLETIONS
            const records = (typeof VICTOR_COMPLETIONS !== 'undefined' && Array.isArray(VICTOR_COMPLETIONS))
                ? VICTOR_COMPLETIONS.filter(record => record.levelName === level.name)
                : [];
            
            // Calculate points for each record
            const processedRecords = records.map(record => ({
                ...record,
                points: calculateVLLPoints(P_100, record.percent, level.listPercent)
            }));

            // Find the World Record (highest run < 100%)
            const wrRecord = processedRecords
                .filter(r => r.percent < 100 && r.percent >= level.minWR)
                .sort((a, b) => b.percent - a.percent)[0];
            
            // Find the highest list run (highest run >= listPercent and < 100%)
            const listRunRecord = processedRecords
                .filter(r => r.percent < 100 && r.percent >= level.listPercent)
                .sort((a, b) => b.percent - a.percent)[0];

            return {
                ...level,
                rank: rank,
                P_100: P_100, // Store 100% points for display
                records: processedRecords,
                currentWR: wrRecord ? wrRecord.percent : level.currentWR, // Use the highest submitted WR, or data.js value
                listRunWR: listRunRecord ? listRunRecord.percent : null, // The highest run that actually earned list points
                minWR: level.minWR || 0 // Default to 0 if missing
            };
        });
    } else {
        console.error("LEVEL_DATA is undefined, empty, or not an array. Please check data.js.");
        processedLevels = []; // Ensure it is set to an empty array to prevent further errors
    }
}

// ----------------------------------------------------------------------
// --- SUBMIT PAGE LOGIC ---
// ----------------------------------------------------------------------

function setupSubmitPage() {
    const levelSelect = document.getElementById('submit-level-select'); 
    const rawFootageInput = document.getElementById('raw-footage'); 
    
    if (!levelSelect) return;

    // 1. Clear existing options
    // Start from 1 to preserve the default "Select a Level" option (index 0)
    for (let i = levelSelect.options.length - 1; i > 0; i--) {
        levelSelect.remove(i);
    }

    // 2. Populate the dropdown
    processedLevels.forEach(level => {
        const option = document.createElement('option');
        // NOTE: The 'value' sent to Google Forms MUST match the option text in the Google Form! 
        option.value = level.name; 
        option.textContent = `#${level.rank} - ${level.name}`;
        option.dataset.rank = level.rank;
        levelSelect.appendChild(option);
    });
    
    // 3. Setup Raw Footage logic 
    if (rawFootageInput) {
        levelSelect.removeEventListener('change', handleLevelChange);
        levelSelect.addEventListener('change', handleLevelChange);
        handleLevelChange(); // Initial run
    }
}

// Handler function for level select change (Raw Footage Logic)
function handleLevelChange() {
    const levelSelect = document.getElementById('submit-level-select');
    const rawFootageInput = document.getElementById('raw-footage'); 
    const rawFootageLabel = document.querySelector('label[for="raw-footage"]'); 
    
    if (!levelSelect || !rawFootageInput || !rawFootageLabel) return;
    
    const selectedOption = levelSelect.options[levelSelect.selectedIndex];
    const rank = selectedOption ? (parseInt(selectedOption.dataset.rank, 10) || 0) : 0;
    
    // Logic: Raw footage is mandatory for Top 15 
    if (rank > 0 && rank <= 15) {
        rawFootageInput.setAttribute('required', 'true');
        rawFootageLabel.innerHTML = 'Raw Footage <span style="color:red;">(Required for Top 15):</span>';
    } else {
        rawFootageInput.removeAttribute('required');
        rawFootageLabel.innerHTML = 'Raw Footage (Optional):';
    }
}

// ----------------------------------------------------------------------
// --- LIST PAGE LOGIC ---
// ----------------------------------------------------------------------

function renderLevelList() {
    const sidebar = document.getElementById('level-list-sidebar');
    const detailsContainer = document.getElementById('level-details-container');
    const recordsSidebar = document.getElementById('level-victors-list');

    if (!sidebar || !detailsContainer || !recordsSidebar) return;

    sidebar.innerHTML = '<h3>VLL Levels</h3>';
    detailsContainer.innerHTML = '';
    recordsSidebar.innerHTML = '';
    
    if (processedLevels.length === 0) {
        sidebar.innerHTML += '<p style="padding: 10px;">Levels failed to load. Check console or data.js.</p>';
        return;
    }

    processedLevels.forEach(level => {
        const levelItem = document.createElement('div');
        levelItem.classList.add('level-list-item');
        levelItem.id = `level-item-${level.rank}`; 
        levelItem.innerHTML = `<span class="level-rank">#${level.rank} - </span><span class="level-name">${level.name}</span><span class="level-creator">by ${level.creator}</span>`;
        
        levelItem.addEventListener('click', () => {
            document.querySelectorAll('.level-list-item').forEach(item => item.classList.remove('active'));
            levelItem.classList.add('active');
            renderLevelDetails(level);
        });
        sidebar.appendChild(levelItem);
    });

    if (processedLevels.length > 0) {
        // Automatically click the first level to show its details
        const firstItem = document.getElementById('level-item-1');
        if(firstItem) firstItem.click();
    }
}

function renderLevelDetails(level) {
    const container = document.getElementById('level-details-container');
    const recordsSidebar = document.getElementById('level-victors-list');

    if (!container || !recordsSidebar) return;
    
    // Normalize YouTube URL for embedding
    let embedUrl = level.video.includes('watch?v=')
        ? level.video.replace("watch?v=", "embed/")
        : (level.video.includes("youtu.be/") ? level.video.replace("youtu.be/", "youtube.com/embed/") : level.video);
    
    // Calculate List Points for the List% threshold
    const P_list = (level.P_100 * 0.1).toFixed(2);
    
    const verifierName = level.verifier === level.creator ? level.verifier : (level.verifier || "N/A");

    // VLL Points Display string (List% and 100%)
    const listPointsDisplay = `
        <span class="list-points-display">${P_list} (List%)</span>
        — 
        <span class="list-points-display">${level.P_100.toFixed(2)} (100%) points
    `;
    
    container.innerHTML = `
        <h3 class="level-title">#${level.rank} - ${level.name} <span class="level-verifier">// Verified by ${verifierName}</span></h3>
        <p class="level-creator-info">Created by ${level.creator} // Published by ${level.publisher}</p>
        <p class="level-description">${level.description}</p>
        
        <div class="video-placeholder">
            <iframe 
                width="100%" 
                height="315" 
                src="${embedUrl}" 
                title="YouTube video player for ${level.name}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        </div>
        
        <div class="level-info-row">
            <p><strong>Level ID:</strong> ${level.id}</p>
            <p><strong>VLL Points:</strong> ${listPointsDisplay}</p>
            <p><strong>List Percent:</strong> ${level.listPercent}%</p>
            <p><strong>WR:</strong> ${level.currentWR !== null ? level.currentWR + '%' : 'N/A'} (Min: ${level.minWR}%)</p>
            <p><strong>Highest List Run:</strong> ${level.listRunWR !== null ? level.listRunWR + '%' : 'N/A'}</p>
            <p><strong>List% Points:</strong> ${P_list} pts</p>
        </div>
    `;

    // Render Records List
    recordsSidebar.innerHTML = `<h3>Records (${level.records.length})</h3>`;
    if (level.records && level.records.length > 0) {
        recordsSidebar.innerHTML += `
            <div class="victor-header">
                <span>Name & Tag</span>
                <span class="right-text">Points / %</span>
            </div>
        `;
        // Sort by Points (desc), then Percentage (desc), then Date (asc)
        level.records.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.percent !== a.percent) return b.percent - a.percent;
            return new Date(a.date) - new Date(b.date);
        });
        
        level.records.forEach(record => {
            const tagClass = {
                'Verifier': 'tag-verifier',
                'World Record': 'tag-diamond',
                'First Victor': 'tag-gold',
                'Second Victor': 'tag-silver',
                'Third Victor': 'tag-bronze',
                'List Run': 'tag-normal',
            }[record.tag] || 'tag-normal';

            const pointsDisplay = record.points > 0 
                ? `${record.points.toFixed(2)} pts` 
                : `<span style="color: #aaa;">${record.percent}%</span>`; // No points, just display %

            recordsSidebar.innerHTML += `
                <div class="victor-item">
                    <span class="victor-name">
                        ${record.name}
                        <span class="victor-tag ${tagClass}">${record.tag || 'Normal'}</span>
                    </span>
                    <span class="right-text">
                        ${pointsDisplay}
                        <a href="${record.video}" target="_blank" class="victor-video-link">🔗</a>
                    </span>
                </div>
            `;
        });
    } else {
        recordsSidebar.innerHTML += '<p style="margin-top: 10px;">No records submitted yet.</p>';
    }
}

// ----------------------------------------------------------------------
// --- LEADERBOARD LOGIC ---
// ----------------------------------------------------------------------

function calculateLeaderboardData() {
    const playerStats = {};

    processedLevels.forEach(level => {
        level.records.forEach(record => {
            const username = record.name;
            const points = record.points; 
            
            if (!playerStats[username]) {
                playerStats[username] = { points: 0, levelsBeaten: 0, records: 0, hardestLevel: 'N/A', hardestRank: Infinity, levelScores: {} };
            }
            
            // Only count points from the highest record per level
            if (points > (playerStats[username].levelScores[level.name] || 0)) {
                 // Subtract the old score, add the new higher score
                 playerStats[username].points += (points - (playerStats[username].levelScores[level.name] || 0));
                 playerStats[username].levelScores[level.name] = points; // Store the highest score for this level
            }

            // Only count 100% completions for "Levels Beaten" and "Hardest Level"
            if (record.percent === 100) {
                // Check if they've already beaten it (only count once)
                if (playerStats[username][`beaten-${level.name}`] !== true) {
                    playerStats[username].levelsBeaten += 1;
                    playerStats[username][`beaten-${level.name}`] = true;
                }
                
                // Track hardest beaten level (lowest rank number is hardest)
                if (level.rank < playerStats[username].hardestRank) {
                    playerStats[username].hardestLevel = level.name;
                    playerStats[username].hardestRank = level.rank;
                }
            }
            
            playerStats[username].records += 1; // Total number of records submitted
        });
    });

    let leaderboard = Object.keys(playerStats).map(username => ({
        username: username,
        points: playerStats[username].points,
        levelsBeaten: playerStats[username].levelsBeaten,
        records: playerStats[username].records,
        hardestLevel: playerStats[username].hardestLevel,
        hardestRank: playerStats[username].hardestRank
    }));

    // Sort: 1. Points (desc), 2. Levels Beaten (desc), 3. Hardest Rank (asc)
    leaderboard.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points; 
        if (b.levelsBeaten !== a.levelsBeaten) return b.levelsBeaten - a.levelsBeaten; 
        return a.hardestRank - b.hardestRank; 
    });

    leaderboard = leaderboard.map((player, index) => ({
        ...player,
        rank: index + 1
    }));
    
    return leaderboard;
}

function renderLeaderboard(page = 1) {
    const leaderboardBody = document.getElementById('leaderboard-body');
    const leaderboardData = calculateLeaderboardData();
    
    if (!leaderboardBody) return;
    
    const startIndex = (page - 1) * 10;
    const endIndex = startIndex + 10;
    const paginatedData = leaderboardData.slice(startIndex, endIndex);

    leaderboardBody.innerHTML = '';
    
    if (paginatedData.length === 0) {
        leaderboardBody.innerHTML = '<tr><td colspan="5">Leaderboard is currently empty.</td></tr>';
        return;
    }

    paginatedData.forEach(player => {
        const row = leaderboardBody.insertRow();
        row.insertCell().textContent = player.rank;
        row.insertCell().textContent = player.username;
        row.insertCell().textContent = player.points.toFixed(2); // Display VLL Points with decimals
        row.insertCell().textContent = player.hardestLevel;
        row.insertCell().textContent = player.levelsBeaten;
    });
}


// --- Initialization and Page Routing ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Process the data first (Calculates points/ranking/WRs)
    processLevelData();

    // 2. Handle initial page load based on URL hash
    const hash = window.location.hash.substring(1) || 'home';
    
    // We rely on the changePage function defined in index.html, which calls the render functions.
    if (typeof changePage === 'function') {
        changePage(hash);
    } else {
        console.error("The changePage function is missing from index.html.");
    }
});
