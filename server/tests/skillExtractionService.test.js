const test = require('node:test');
const assert = require('node:assert/strict');
const {
    extractSkillsFromSources,
    findMissingRequiredSkills,
} = require('../services/skillExtractionService');

test('extractSkillsFromSources detects technical skills from both resume text and candidate profile text', () => {
    const skills = extractSkillsFromSources({
        resumeText: `
            Senior full-stack engineer
            Built React and Next.js applications with Node.js APIs.
            Worked with PostgreSQL, Docker, AWS, and GitHub Actions.
        `,
        candidateProfileText: `
            Technical Skills: Python, TensorFlow, Power BI
            Additional tools: Firebase and Tableau
        `
    });

    assert.deepEqual(skills, [
        'React',
        'Next.js',
        'Node.js',
        'PostgreSQL',
        'Docker',
        'GitHub Actions',
        'AWS',
        'Python',
        'Firebase',
        'TensorFlow',
        'Power BI',
        'Tableau',
    ]);
});

test('findMissingRequiredSkills compares normalized required skills against detected matches', () => {
    const missingSkills = findMissingRequiredSkills(
        ['React', 'Node.js', 'Power BI', 'Solidity'],
        ['react', 'Node.js', 'powerbi']
    );

    assert.deepEqual(missingSkills, ['Solidity']);
});
