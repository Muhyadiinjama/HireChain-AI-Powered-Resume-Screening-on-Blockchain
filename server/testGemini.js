require('dotenv').config();
const { analyzeResume } = require('./services/geminiService');

async function test() {
    console.log("Testing Gemini API Key...");
    try {
        const dummyResume = "Experienced software engineer with 5 years of full-stack development using React and Node.js.";
        const dummyJobDesc = "Looking for a full-stack developer with React and Node.js experience.";
        
        const result = await analyzeResume({
            resumeText: dummyResume,
            candidateProfileText: 'Technical Skills: React, Node.js',
            jobDescription: dummyJobDesc,
            uploadedFile: null,
        });
        console.log("Success! Response from Gemini:");
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Test failed:", error.message);
    }
}

test();
