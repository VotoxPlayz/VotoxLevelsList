// data.js

/**
 * VLL Levels Data
 * This list is ranked by difficulty, with Rank 1 being the hardest.
 */
const LEVEL_DATA = [
    {
        name: "Flamewall",
        creator: "Votox", // Creator: Votox
        publisher: "Finh7", // Publisher: Finh7
        verifier: "Cuatrocientos",
        id: "126242564",
        video: "https://www.youtube.com/watch?v=x4Io4zkWVRw",
        description: "The ultimate endurance test, in the works since 2022. | Verified by Cuatrocientos in 221.703 attempts.",
        listPercent: 75, // The List% threshold for this level (e.g., 75, 80, 90)
        minWR: 5, // Minimum World Record percentage required for tracking
        currentWR: null // To be updated manually with the highest run < 100%
    },
    {
        name: "Thinking Space II",
        creator: "Votox",
        publisher: "Finh7",
        verifier: "Zoink",
        id: "119544028",
        video: "https://www.youtube.com/watch?v=CELNmHwln_c", 
        description: "A mindscape of pure insanity, most fall to its brutal nature. Gameplay by CoCy team, deco hosted by DrCuber, Verified by Zoink. Dedicated to Hideki <3",
        listPercent: 80,
        minWR: 10,
        currentWR: 98 // Example of a non-100% WR
    },
    {
        name: "Tidal Wave buffed",
        creator: "Votox",
        publisher: "Finh7",
        verifier: "wPopoff",
        id: "116732736",
        video: "https://www.youtube.com/watch?v=1-ihSeRCpds", 
        description: "April fools but real!",
        listPercent: 70,
        minWR: 5,
        currentWR: null
    },
    {
        name: "Tidal Wave",
        creator: "Votox",
        publisher: "Finh7",
        verifier: "Zoink",
        id: "86407629",
        video: "https://www.youtube.com/watch?v=9fsZ014qB3s", 
        description: "Drown them",
        listPercent: 75,
        minWR: 5,
        currentWR: 99
    },
    {
        name: "Silent clubstep",
        creator: "Votox",
        publisher: "Finh7",
        verifier: "Paqoe",
        id: "4125776",
        video: "https://www.youtube.com/watch?v=GR4OMkS3SN8",
        description: "7 years and you still play me?!",
        listPercent: 85,
        minWR: 20,
        currentWR: null
    },
    {
        name: "Avernus",
        creator: "Votox",
        publisher: "Finh7",
        verifier: "Zoink",
        id: "89496627",
        video: "https://www.youtube.com/watch?v=16Zh8jssanc",
        description: "By Bo & Kyhros - https://discord.gg/YcNkfHMJGv",
        listPercent: 70,
        minWR: 5,
        currentWR: null
    },
    // Add more levels here with the new structure.
    // NOTE: The more levels you add, the closer the lowest rank will get to 1 point.
];

/**
 * Record Submissions (Victors) Data
 * NOTE: 'percent' is the new required field.
 * NOTE: The 'tag' field is for display (e.g., 'Verifier', 'First Victor', 'WR', 'Normal').
 */
const VICTOR_COMPLETIONS = [
    // Format: { levelName: "Level Name", name: "Player", video: "Link", date: "YYYY-MM-DD", percent: 100, tag: "Verifier" }
    
    // Example Record (Tidal Wave)
    { levelName: "Tidal Wave", name: "Zoink", video: "https://www.youtube.com/watch?v=9fsZ014qB3s", date: "2024-02-18", percent: 100, tag: "Verifier" },
    { levelName: "Tidal Wave", name: "Player B", video: "https://example.com/b", date: "2024-03-01", percent: 100, tag: "First Victor" },
    { levelName: "Tidal Wave", name: "Player C", video: "https://example.com/c", date: "2024-03-10", percent: 100, tag: "Second Victor" },
    
    // Example WR (Thinking Space II)
    { levelName: "Thinking Space II", name: "Zoink", video: "https://www.youtube.com/watch?v=CELNmHwln_c", date: "2025-09-19", percent: 100, tag: "Verifier" },
    { levelName: "Thinking Space II", name: "High Run Player", video: "https://example.com/wr", date: "2025-09-20", percent: 98, tag: "World Record" },
    
    // Example List% run (Flamewall)
    { levelName: "Flamewall", name: "List Run Player", video: "https://example.com/list", date: "2025-10-01", percent: 78, tag: "List Run" },
];
