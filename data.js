// data.js

/**
 * VLL Levels Data
 * This list is ranked by difficulty, with Rank 1 being the hardest.
 */
const LEVEL_DATA = [
    {
        name: "Dawakipolid",
        creator: "Votox", // RESTORING ORIGINAL VLL CREATOR
        publisher: "Finh7", // Publisher: Finh7
        verifier: "N/A",
        id: "86941613",
        video: "https://www.youtube.com/watch?v=n9LM84_AboM", 
        description: "This level was purposely made to be impossible. I probably made it when I was 9/10 years old. It was heavily inspired by old slaughterhouse and new slaughterhouse.",
        listPercent: 46, // The List% threshold for this level (e.g., 75, 80, 90)
        minWR: 1, // Minimum World Record percentage required for tracking
        currentWR: null 
    },
    {
        name: "Hardest Timings Ever",
        creator: "Votox", // RESTORING ORIGINAL VLL CREATOR
        publisher: "Finh7",
        verifier: "N/A",
        id: "126607991",
        video: "https://www.youtube.com/watch?v=hyfNfKr6MUE",
        description: "I made this level with the idea that these were the hardest possible timings. The UFO and Wave sections at the drop are notorious for being easier than the other timings. The ship part in the predrop is arguably the hardest part.",
        listPercent: 42,
        minWR: 7,
        currentWR: null // Example of a non-100% WR
    },
    {
        name: "Flaemwahl",
        creator: "Votox", // RESTORING ORIGINAL VLL CREATOR
        publisher: "Finh7",
        verifier: "N/A",
        id: "126608250",
        video: "https://www.youtube.com/watch?v=QeAerAhsm-g",  
        description: "This level is obviously inspired by Flamewall. The main gimmick is that the level gets easier as you go on, which explains the disgustingly low list percent. The last click is also completely blind.",
        listPercent: 20,
        minWR: 2,
        currentWR: null
    },
    {
        name: "Tidal Wave",
        creator: "Votox", // RESTORING ORIGINAL VLL CREATOR
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
        creator: "Votox", // RESTORING ORIGINAL VLL CREATOR
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
        creator: "Votox", // RESTORING ORIGINAL VLL CREATOR
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
    { levelName: "Tidal Wave", name: "Player D", video: "https://example.com/d", date: "2024-03-15", percent: 100, tag: "Third Victor" },
    { levelName: "Tidal Wave", name: "Player E", video: "https://example.com/e", date: "2024-03-20", percent: 100, tag: "Victor" }, // Fourth Victor and beyond use 'Victor'
    
    // Example WR (Thinking Space II)
    { levelName: "Thinking Space II", name: "Zoink", video: "https://www.youtube.com/watch?v=CELNmHwln_c", date: "2025-09-19", percent: 100, tag: "Verifier" },
    { levelName: "Thinking Space II", name: "High Run Player", video: "https://example.com/wr", date: "2025-09-20", percent: 98, tag: "World Record" },
    
    // Example List% run (Flamewall)
    { levelName: "Flamewall", name: "List Run Player", video: "https://example.com/list", date: "2025-10-01", percent: 78, tag: "List Run" },
];
