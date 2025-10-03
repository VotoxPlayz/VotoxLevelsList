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
        minWR: 8,
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
        listPercent: 13,
        minWR: 2,
        currentWR: null
    },
    {
        name: "Thinking Space Circles",
        creator: "Votox", // RESTORING ORIGINAL VLL CREATOR
        publisher: "Finh7",
        verifier: "N/A",
        id: "126608933",
        video: "https://www.youtube.com/watch?v=ACSV7wG7Uq4",
        description: "This levels wave gameplay was inspired by Sakupen Circles. Like the normal Thinking Space levels, it is fairly end carried. Although, the predrop also accounts for a fair amount of the difficulty.",
        listPercent: 79,
        minWR: 6,
        currentWR: null
    },
    {
        name: "Overdrive",
        creator: "Votox", // RESTORING ORIGINAL VLL CREATOR
        publisher: "Finh7",
        verifier: "N/A",
        id: "87291127",
        video: "https://www.youtube.com/watch?v=JdL63L19qeE",
        description: "I was probably around 10/11 years old when I made this. The level name comes from a beat saber level I wanted to make, although I never ended up making it. The level actually isn't inspired by anything, and most of the difficulty comes from the ship sections and the wave drop.",
        listPercent: 43,
        minWR: 2,
        currentWR: null
    },
    {
        name: "A New Top 1",
        creator: "Votox", // RESTORING ORIGINAL VLL CREATOR
        publisher: "Finh7",
        verifier: "N/A",
        id: "89496627",
        video: "https://www.youtube.com/watch?v=GK84N-1dmkc",
        description: "This level was inspired by Overdrive, and was meant to be a new top 1. It's slightly inspired by slaughterhouse, but it's wave sections are similiar to the Sakupen Circles wave sections.",
        listPercent: 67,
        minWR: 8,
        currentWR: null
    },
    {
        name: "Legendary Depression",
        creator: "Votox", // RESTORING ORIGINAL VLL CREATOR
        publisher: "Finh7",
        verifier: "N/A",
        id: "126617358",
        video: "https://www.youtube.com/watch?v=SdbVSLSKbU4",
        description: "This level is inspired by conical depression. It features long spam corridors and tight gaps that abuse the hitboxes. The gameplay cannot be fun.",
        listPercent: 44,
        minWR: 9,
        currentWR: null
    },
];

/**
 * Record Submissions (Victors) Data
 * NOTE: 'percent' is the new required field.
 * NOTE: The 'tag' field is for display (e.g., 'Verifier', 'First Victor', 'WR', 'Normal').
 */
const VICTOR_COMPLETIONS = [
    // Format: { levelName: "Level Name", name: "Player", video: "Link", date: "YYYY-MM-DD", percent: 100, tag: "Verifier" }
    
    // Example Record (Tidal Wave)
    
  
];
