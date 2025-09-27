// script.js

// Global variables
let processedLevels = []; 
let submitted = false; 

/**
 * Calculates the 100% FHLL Points for a given rank using exponential decay.
 * R=1 gives 500 points. R=N (total levels) gives approx 1 point.
 * @param {number} rank - The rank of the level (1-indexed).
 * @param {number} totalLevels - The total number of levels on the list.
 * @returns {number} The 100% completion FHLL Points.
 */
function calculateExponentialPoints(rank, totalLevels) {
    if (rank === 1) return 500;
    if (totalLevels <= 1) return 500; 

    const P_max = 500;
    const P_min = 1;
    
    // Calculate decay constant 'k' such that P(N) ≈ 1
    const k = -Math.log(P_min / P_max) / (totalLevels - 1);
    
    // Calculate points for the current rank R
    let points = P_max * Math.exp(-k * (rank - 1));
    
    // Round to a clean two decimal places for point accuracy
    return parseFloat(points.toFixed(2));
}

/**
 * Calculates FHLL Points for a player based on their completion percentage.
 * @param {number} P_100 - The 100% completion points for the level.
 * @param {number} percentage - The player's completion percentage (0-100).
 * @param {number} listPercentThreshold - The level's List% requirement (e.g., 75).
 * @returns {number} The FHLL Points earned.
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
 * Processes the raw LEVEL_DATA, calculates rank, FHLL Points, and merges records.
 */
function processLevelData() {
    if (typeof LEVEL_DATA === 'undefined' || !Array.isArray(LEVEL_DATA) || LEVEL_DATA.length === 0) {
        console.error("LEVEL_DATA is undefined, empty, or not an array. Levels cannot be loaded. Check index.html script order.");
        processedLevels = []; 
        return;
    }

    const totalLevels = LEVEL_DATA.length;
    
    processedLevels = LEVEL_DATA.map((level, index) => {
        const rank = index + 1;
        
        // 1. Calculate 100% FHLL Points
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

        // Find the World Record (highest run < 100% that meets minWR)
        const wrRecord = processedRecords
            .filter(r => r.percent < 100 && r.percent >= level.minWR)
            .sort((a, b) => b.percent - a.percent)[0];
        
        // Find the highest list run (highest run >= listPercent and < 100%)
        const listRunRecord = processedRecords
            .filter(r => r.percent < 100 && r.percent >= level.listPercent)
            .sort((a, b) => b.percent - a.percent)[0];

        // Determine actual currentWR (100% if verified, otherwise highest submitted run)
        const isVerified = (level.verifier && processedRecords.find(r => r.name === level.verifier && r.percent === 100));
        let actualCurrentWR = null;
        if (isVerified) {
            actualCurrentWR = 100;
        } else if (wrRecord) {
            actualCurrentWR = wrRecord.percent;
        } else {
            actualCurrentWR = level.currentWR; // Fallback to manually set WR
        }

        return {
            ...level,
            rank: rank,
            P_100: P_100, // Store 100% points for display
            records: processedRecords,
            currentWR: actualCurrentWR, 
            listRunWR: listRunRecord ? listRunRecord.percent : null, 
            minWR: level.minWR || 0 
        };
    });
    console.log(`Processed ${processedLevels.length} Levels.`); 
}


// ----------------------------------------------------------------------
// --- SUBMIT PAGE LOGIC (Called from index.html) ---
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
    const rawFootageLabel = document.querySelector('#raw-footage-row label'); // Select the label within the row
    
    if (!levelSelect || !rawFootageInput || !rawFootageLabel) return;
    
    const selectedOption = levelSelect.options[levelSelect.selectedIndex];
    const rank = selectedOption ? (parseInt(selectedOption.dataset.rank, 10) || 0) : 0;
    
    // Logic: Raw footage is MANDATORY for Top 15 (rank 1 through 15)
    if (rank > 0 && rank <= 15) {
        rawFootageInput.setAttribute('required', 'true');
        // Update the label for Top 15 levels
        rawFootageLabel.innerHTML = 'Raw Footage (Required for Top 15): <span class="required-asterisk">*</span>'; 
    } else {
        rawFootageInput.removeAttribute('required');
        // Revert to optional label for levels below rank 15
        rawFootageLabel.innerHTML = 'Raw Footage (Optional):'; 
    }
}

// ----------------------------------------------------------------------
// --- LIST PAGE LOGIC (Called from index.html) ---
// ----------------------------------------------------------------------

function renderLevelList() {
    const sidebar = document.getElementById('level-list-sidebar');
    const detailsContainer = document.getElementById('level-details-container');
    const recordsSidebar = document.getElementById('level-victors-list');

    if (!sidebar || !detailsContainer || !recordsSidebar) {
         console.error("Missing critical element IDs for the list page.");
         return;
    }

    sidebar.innerHTML = '<h3>FHLL Levels</h3>';
    detailsContainer.innerHTML = '';
    recordsSidebar.innerHTML = '';
    
    // Re-check processed levels just in case this is called dynamically
    if (processedLevels.length === 0) {
        processLevelData(); // Attempt to process data again
    }
    
    if (processedLevels.length === 0) {
        sidebar.innerHTML += '<p style="padding: 10px;">Levels failed to load. Check console for data errors and script order.</p>';
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
    
    // Verifier logic (display "Verifier by" or just "Creator")
    const verifierName = level.verifier === level.creator ? level.verifier : (level.verifier || "N/A");

    // FHLL Points Display string (List% and 100%)
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
            <p><strong>FHLL Points:</strong> ${listPointsDisplay}</p>
            <p><strong>List Percent:</strong> ${level.listPercent}%</p>
            <p><strong>WR:</strong> ${level.currentWR !== null ? level.currentWR + '%' : 'N/A'} (Min: ${level.minWR}%)</p>
            <p><strong>Highest List Run:</strong> ${level.listRunWR !== null ? level.listRunWR + '%' : 'N/A'}</p>
            <p><strong>List% Points:</strong> ${P_list} pts</p>
        </div>
    `;

    // Render Records List
    recordsSidebar.innerHTML = `<h3>Victors (${level.records.length})</h3>`;
    if (level.records && level.records.length > 0) {
        recordsSidebar.innerHTML += `
            <div class="victor-header">
                <span>Name & Tag</span>
                <span class="right-text">Points / %</span>
            </div>
        `;
        // Sort: 1. Points (desc), 2. Percentage (desc), 3. Date (asc)
        level.records.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.percent !== a.percent) return b.percent - a.percent;
            return new Date(a.date) - new Date(b.date);
        });
        
        level.records.forEach(record => {
            // Determine tags
            const tags = (record.tag || 'Victor').split(',').map(tag => tag.trim());
            
            // Map tags to CSS classes
            const tagHtml = tags.map(tag => {
                const tagClass = {
                    'Verifier': 'tag-verifier',
                    'World Record': 'tag-diamond',
                    'First Victor': 'tag-gold',
                    'Second Victor': 'tag-silver',
                    'Third Victor': 'tag-bronze',
                    'List Run': 'tag-normal',
                    'Victor': 'tag-normal', 
                }[tag] || 'tag-normal';
                return `<span class="victor-tag ${tagClass}">${tag}</span>`;
            }).join('');

            const pointsDisplay = record.points > 0 
                ? `${record.points.toFixed(2)} pts` 
                : `<span style="color: #aaa;">${record.percent}%</span>`; // No points, just display %

            recordsSidebar.innerHTML += `
                <div class="victor-item">
                    <span class="victor-name">
                        ${record.name}
                        <div class="victor-tag-container">${tagHtml}</div>
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
// --- LEADERBOARD LOGIC (Called from index.html) ---
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
            
            playerStats[username].records += 1; 
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
        row.insertCell().textContent = player.points.toFixed(2); // Display FHLL Points with decimals
        row.insertCell().textContent = player.hardestLevel;
        row.insertCell().textContent = player.levelsBeaten;
    });
}


// --- Initialization and Page Routing ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Process the data first (Calculates points/ranking/WRs)
    processLevelData();

    // 2. Handle initial page load based on URL hash (Handled by changePage in index.html)
    // The changePage function is called at the end of index.html's script block,
    // which ensures the render functions are called after the data is processed.
});
