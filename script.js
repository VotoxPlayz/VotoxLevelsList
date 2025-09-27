// script.js

// Global variables
let processedLevels = []; 
let leaderboardData = []; // Store calculated leaderboard data globally for efficiency

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
    
    const k = -Math.log(P_min / P_max) / (totalLevels - 1);
    
    let points = P_max * Math.exp(-k * (rank - 1));
    
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
    
    if (percentage < listPercentThreshold) return 0;

    const P_list = P_100 * 0.1;

    const P_linear = P_100 - P_list;
    
    const percentSpan = 100 - listPercentThreshold; 
    
    if (percentSpan <= 0) return (percentage >= 100 ? P_100 : 0);

    const pointsPerPercent = P_linear / percentSpan;
    
    const earnedLinearPoints = pointsPerPercent * (percentage - listPercentThreshold);
    
    return parseFloat((P_list + earnedLinearPoints).toFixed(2));
}

/**
 * Maps the raw difficulty value (10-point scale or custom string) to the required in-game estimation.
 * NOTE: The raw data needs a 'difficultyEst' field (1-10 or custom string) for this to work perfectly.
 * @param {string|number} difficulty - The raw difficulty value.
 * @returns {string} The in-game estimation string.
 */
function mapDifficulty(difficulty) {
    if (typeof difficulty === 'string') {
        const lower = difficulty.toLowerCase();
        // Handle custom strings first
        if (lower.includes('list demon')) return 'List Demon (Top 150)';
        if (lower.includes('extreme demon')) return 'Extreme Demon';
        if (lower.includes('insane demon')) return 'Insane Demon';
        if (lower.includes('hard demon')) return 'Hard Demon';
        if (lower.includes('medium demon')) return 'Medium Demon';
        if (lower.includes('easy demon')) return 'Easy Demon';
        // If it's a number string
        difficulty = parseInt(difficulty, 10);
    }
    
    if (typeof difficulty !== 'number') return 'N/A';
    
    if (difficulty >= 10) return 'Extreme Demon'; // Assuming 10+ is demon tier in a vacuum
    if (difficulty === 9) return 'Insane';
    if (difficulty === 8) return 'Harder';
    if (difficulty === 7) return 'Hard';
    if (difficulty === 6) return 'Normal';
    if (difficulty <= 5) return 'Easy';

    return 'N/A';
}


/**
 * Processes the raw LEVEL_DATA, calculates rank, VLL Points, and merges records.
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
        
        // 1. Calculate 100% VLL Points
        const P_100 = calculateExponentialPoints(rank, totalLevels);
        
        // 2. Merge Victors (Records) from VICTOR_COMPLETIONS
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
            P_100: P_100, 
            records: processedRecords,
            currentWR: actualCurrentWR, 
            minWR: level.minWR || 0,
            difficultyEst: mapDifficulty(level.difficultyEst || 'N/A') // Use the mapping function
        };
    });
    console.log(`Processed ${processedLevels.length} Levels.`); 
    
    // Also calculate leaderboard data upon initial processing
    leaderboardData = calculateLeaderboardData();
}


// ----------------------------------------------------------------------
// --- SUBMIT PAGE LOGIC ---
// ----------------------------------------------------------------------

function setupSubmitPage() {
    const levelSelect = document.getElementById('submit-level-select'); 
    const rawFootageInput = document.getElementById('raw-footage'); 
    
    if (!levelSelect) return;

    for (let i = levelSelect.options.length - 1; i > 0; i--) {
        levelSelect.remove(i);
    }

    processedLevels.forEach(level => {
        const option = document.createElement('option');
        option.value = level.name; 
        option.textContent = `#${level.rank} - ${level.name}`;
        option.dataset.rank = level.rank;
        levelSelect.appendChild(option);
    });
    
    if (rawFootageInput) {
        levelSelect.removeEventListener('change', handleLevelChange);
        levelSelect.addEventListener('change', handleLevelChange);
        handleLevelChange(); 
    }
}

function handleLevelChange() {
    const levelSelect = document.getElementById('submit-level-select');
    const rawFootageInput = document.getElementById('raw-footage'); 
    const rawFootageLabel = document.querySelector('#raw-footage-row label'); 
    
    if (!levelSelect || !rawFootageInput || !rawFootageLabel) return;
    
    const selectedOption = levelSelect.options[levelSelect.selectedIndex];
    const rank = selectedOption ? (parseInt(selectedOption.dataset.rank, 10) || 0) : 0;
    
    if (rank > 0 && rank <= 15) {
        rawFootageInput.setAttribute('required', 'true');
        rawFootageLabel.innerHTML = 'Raw Footage (Required for Top 15): <span class="required-asterisk">*</span>'; 
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
        processLevelData(); 
    }
    
    if (processedLevels.length === 0) {
        sidebar.innerHTML += '<p style="padding: 10px;">Levels failed to load.</p>';
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
        const firstItem = document.getElementById('level-item-1');
        if(firstItem) firstItem.click();
    }
}

function renderLevelDetails(level) {
    const container = document.getElementById('level-details-container');
    const recordsSidebar = document.getElementById('level-victors-list');

    if (!container || !recordsSidebar) return;
    
    let embedUrl = level.video.includes('watch?v=')
        ? level.video.replace("watch?v=", "embed/")
        : (level.video.includes("youtu.be/") ? level.video.replace("youtu.be/", "youtube.com/embed/") : level.video);
    
    const P_list = (level.P_100 * 0.1).toFixed(2);
    
    const verifierName = level.verifier === level.creator ? level.verifier : (level.verifier || "N/A");

    // UPDATED: VLL Points Display string
    const pointsDisplay = `
        <span class="list-points-display">${P_list} (List%)</span>
        — 
        <span class="list-points-display">${level.P_100.toFixed(2)} (100%) points</span>
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
            <p><strong>VLL Points:</strong> ${pointsDisplay}</p>
            <p><strong>In Game Difficulty Estimation:</strong> ${level.difficultyEst}</p> <p><strong>WR (Minimum Required WR):</strong> ${level.currentWR !== null ? level.currentWR + '%' : 'N/A'} (Min: ${level.minWR}%)</p> <p><strong>EDEL Enjoyment:</strong> ${level.EDEL_enjoyment || 'N/A'}</p>
        </div>
    `;

    // Render Records List
    recordsSidebar.innerHTML = `<h3>Records (${level.records.length})</h3>`; // RENAMED TO RECORDS
    if (level.records && level.records.length > 0) {
        recordsSidebar.innerHTML += `
            <div class="victor-header">
                <span>Name & Tag</span>
                <span class="right-text">Percentage / Link</span>
            </div>
        `;
        // Sort: 1. Points (desc), 2. Percentage (desc), 3. Date (asc)
        level.records.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.percent !== a.percent) return b.percent - a.percent;
            return new Date(a.date) - new Date(b.date);
        });
        
        level.records.forEach(record => {
            const tags = (record.tag || 'Victor').split(',').map(tag => tag.trim());
            
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

            // UPDATED: Display percentage only for records
            const percentDisplay = `${record.percent}%`;

            recordsSidebar.innerHTML += `
                <div class="victor-item">
                    <span class="victor-name">
                        ${record.name}
                        <div class="victor-tag-container">${tagHtml}</div>
                    </span>
                    <span class="right-text">
                        ${percentDisplay}
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

    // Ensure data is processed
    if (processedLevels.length === 0) {
        processLevelData();
    }

    processedLevels.forEach(level => {
        level.records.forEach(record => {
            const username = record.name;
            const points = record.points; 
            
            if (!playerStats[username]) {
                playerStats[username] = { points: 0, levelsBeaten: 0, records: 0, hardestLevel: 'N/A', hardestRank: Infinity, levelScores: {} };
            }
            
            // Only count points from the highest record per level
            if (points > (playerStats[username].levelScores[level.name] || 0)) {
                 playerStats[username].points += (points - (playerStats[username].levelScores[level.name] || 0));
                 playerStats[username].levelScores[level.name] = points; 
            }

            // Only count 100% completions for "Levels Beaten" and "Hardest Level"
            if (record.percent === 100) {
                if (playerStats[username][`beaten-${level.name}`] !== true) {
                    playerStats[username].levelsBeaten += 1;
                    playerStats[username][`beaten-${level.name}`] = true;
                }
                
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
        row.insertCell().textContent = player.points.toFixed(2); 
        row.insertCell().textContent = player.hardestLevel;
        row.insertCell().textContent = player.levelsBeaten; // Levels Completed
    });
}

// ----------------------------------------------------------------------
// --- STATS VIEWER LOGIC (NEW) ---
// ----------------------------------------------------------------------

function renderPlayerStats() {
    const inputElement = document.getElementById('stats-username-input');
    const outputElement = document.getElementById('player-stats-output');
    
    if (!inputElement || !outputElement) return;
    
    const username = inputElement.value.trim();
    if (username === '') {
        outputElement.innerHTML = `<p style="text-align: center; color: var(--error-color); margin-top: 20px;">Please enter a username to search.</p>`;
        return;
    }

    const player = leaderboardData.find(p => p.username.toLowerCase() === username.toLowerCase());

    if (!player) {
        outputElement.innerHTML = `<p style="text-align: center; color: #aaa; margin-top: 20px;">User **${username}** was not found in the VLL database.</p>`;
        return;
    }
    
    // Get all 100% completions for the player
    const completedLevels = processedLevels
        .filter(level => player.levelScores[level.name] === level.P_100)
        .sort((a, b) => a.rank - b.rank); // Sort by rank (hardest first)

    // Find the player's best run on each level
    const bestRuns = processedLevels
        .map(level => {
            const highestRun = level.records
                .filter(r => r.name.toLowerCase() === username.toLowerCase())
                .sort((a, b) => b.percent - a.percent)[0];
            
            return highestRun ? {
                rank: level.rank,
                name: level.name,
                percent: highestRun.percent,
                points: highestRun.points.toFixed(2),
                isCompleted: highestRun.percent === 100
            } : null;
        })
        .filter(run => run !== null)
        .sort((a, b) => a.rank - b.rank);

    outputElement.innerHTML = `
        <div class="player-header">
            <div class="player-avatar">
                ${player.username.charAt(0).toUpperCase()}
            </div>
            <div class="player-info">
                <h3>${player.username}</h3>
                <p>Global Rank: #${player.rank}</p>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-box">
                <div class="value">${player.levelsBeaten}</div>
                <div class="label">Levels Completed</div>
            </div>
            <div class="stat-box">
                <div class="value">${player.points.toFixed(2)}</div>
                <div class="label">Total VLL Points</div>
            </div>
            <div class="stat-box">
                <div class="value">#${player.hardestRank}</div>
                <div class="label">Hardest Completion</div>
            </div>
        </div>
        
        <div class="rankings-section">
            <h4>Highest Runs (${bestRuns.length})</h4>
            <div class="rankings-grid" id="player-runs-grid">
                </div>
        </div>
    `;

    const runsGrid = document.getElementById('player-runs-grid');
    if (runsGrid) {
        bestRuns.forEach(run => {
            runsGrid.innerHTML += `
                <div class="rank-item" style="border-left: 3px solid ${run.isCompleted ? '#9370DB' : '#555'};">
                    <span class="rank-label">#${run.rank} ${run.name}</span>
                    <span class="rank-value">${run.percent}% ${run.isCompleted ? '(100%)' : ''}</span>
                </div>
            `;
        });
        if (bestRuns.length === 0) {
             runsGrid.innerHTML = '<p style="color: #aaa; text-align: center; grid-column: 1 / -1; padding: 10px;">No runs found for this player.</p>';
        }
    }
}


// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Process the data first (Calculates points/ranking/WRs)
    processLevelData();

    // The rest of the rendering/routing is handled by the script block in index.html
});
