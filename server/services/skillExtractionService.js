const SKILL_PATTERNS = [
    { label: 'JavaScript', patterns: [/\bjavascript\b/i] },
    { label: 'TypeScript', patterns: [/\btypescript\b/i, /\bts\b/i] },
    { label: 'React', patterns: [/\breact(?:\.js|js)?\b(?!\s+native)/i] },
    { label: 'Next.js', patterns: [/\bnext(?:\.js|js)?\b/i] },
    { label: 'Vue.js', patterns: [/\bvue(?:\.js|js)?\b/i] },
    { label: 'Angular', patterns: [/\bangular\b/i] },
    { label: 'HTML', patterns: [/\bhtml5?\b/i] },
    { label: 'CSS', patterns: [/\bcss3?\b/i] },
    { label: 'Tailwind CSS', patterns: [/\btailwind(?:\s+css)?\b/i] },
    { label: 'Bootstrap', patterns: [/\bbootstrap\b/i] },
    { label: 'Node.js', patterns: [/\bnode(?:\.js|js)?\b/i] },
    { label: 'Express.js', patterns: [/\bexpress(?:\.js|js)?\b/i, /\bexpress\b/i] },
    { label: 'NestJS', patterns: [/\bnest(?:\.js|js)?\b/i, /\bnestjs\b/i] },
    { label: 'Python', patterns: [/\bpython\b/i] },
    { label: 'Java', patterns: [/\bjava\b/i] },
    { label: 'C++', patterns: [/(^|[^a-z0-9])c\+\+(?=$|[^a-z0-9])/i] },
    { label: 'C#', patterns: [/(^|[^a-z0-9])c#(?=$|[^a-z0-9])/i] },
    { label: '.NET', patterns: [/(^|[^a-z0-9])\.net(?=$|[^a-z0-9])/i, /\bdotnet\b/i, /\basp\.net\b/i] },
    { label: 'PHP', patterns: [/\bphp\b/i] },
    { label: 'Laravel', patterns: [/\blaravel\b/i] },
    { label: 'Django', patterns: [/\bdjango\b/i] },
    { label: 'Flask', patterns: [/\bflask\b/i] },
    { label: 'Spring Boot', patterns: [/\bspring\s+boot\b/i] },
    { label: 'REST API', patterns: [/\brest(?:ful)?\s+api?s?\b/i, /\brestful\b/i] },
    { label: 'GraphQL', patterns: [/\bgraphql\b/i] },
    { label: 'SQL', patterns: [/\bsql\b/i] },
    { label: 'MySQL', patterns: [/\bmysql\b/i] },
    { label: 'PostgreSQL', patterns: [/\bpostgres(?:ql)?\b/i] },
    { label: 'MongoDB', patterns: [/\bmongodb\b/i, /\bmongo\b/i] },
    { label: 'Redis', patterns: [/\bredis\b/i] },
    { label: 'Firebase', patterns: [/\bfirebase\b/i] },
    { label: 'Supabase', patterns: [/\bsupabase\b/i] },
    { label: 'Docker', patterns: [/\bdocker\b/i] },
    { label: 'Kubernetes', patterns: [/\bkubernetes\b/i, /\bk8s\b/i] },
    { label: 'Git', patterns: [/\bgit\b/i] },
    { label: 'GitHub Actions', patterns: [/\bgithub\s+actions\b/i] },
    { label: 'CI/CD', patterns: [/\bci\/cd\b/i, /\bcontinuous integration\b/i, /\bcontinuous deployment\b/i] },
    { label: 'Jenkins', patterns: [/\bjenkins\b/i] },
    { label: 'Linux', patterns: [/\blinux\b/i] },
    { label: 'AWS', patterns: [/\baws\b/i, /\bamazon web services\b/i] },
    { label: 'Azure', patterns: [/\bazure\b/i] },
    { label: 'GCP', patterns: [/\bgcp\b/i, /\bgoogle cloud\b/i] },
    { label: 'Terraform', patterns: [/\bterraform\b/i] },
    { label: 'Microservices', patterns: [/\bmicroservices?\b/i] },
    { label: 'Machine Learning', patterns: [/\bmachine learning\b/i] },
    { label: 'Deep Learning', patterns: [/\bdeep learning\b/i] },
    { label: 'TensorFlow', patterns: [/\btensorflow\b/i] },
    { label: 'PyTorch', patterns: [/\bpytorch\b/i] },
    { label: 'Scikit-learn', patterns: [/\bscikit-learn\b/i, /\bsklearn\b/i] },
    { label: 'Pandas', patterns: [/\bpandas\b/i] },
    { label: 'NumPy', patterns: [/\bnumpy\b/i] },
    { label: 'Power BI', patterns: [/\bpower\s*bi\b/i] },
    { label: 'Tableau', patterns: [/\btableau\b/i] },
    { label: 'Excel', patterns: [/\bexcel\b/i] },
    { label: 'Figma', patterns: [/\bfigma\b/i] },
    { label: 'React Native', patterns: [/\breact\s+native\b/i] },
    { label: 'Flutter', patterns: [/\bflutter\b/i] },
    { label: 'Android', patterns: [/\bandroid\b/i] },
    { label: 'iOS', patterns: [/(^|[^a-z0-9])ios(?=$|[^a-z0-9])/i] },
    { label: 'Swift', patterns: [/\bswift\b/i] },
    { label: 'Kotlin', patterns: [/\bkotlin\b/i] },
    { label: 'Solidity', patterns: [/\bsolidity\b/i] },
    { label: 'Ethereum', patterns: [/\bethereum\b/i] },
    { label: 'Hardhat', patterns: [/\bhardhat\b/i] },
    { label: 'Ethers.js', patterns: [/\bethers(?:\.js|js)?\b/i] },
    { label: 'Web3.js', patterns: [/\bweb3(?:\.js|js)?\b/i] },
];

const normalizeSkillKey = (value = '') =>
    String(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '');

const mergeUniqueSkills = (...skillLists) => {
    const merged = [];
    const seen = new Set();

    skillLists.flat().forEach((skill) => {
        const trimmed = String(skill || '').trim();
        if (!trimmed) {
            return;
        }

        const key = normalizeSkillKey(trimmed);
        if (!key || seen.has(key)) {
            return;
        }

        seen.add(key);
        merged.push(trimmed);
    });

    return merged;
};

const extractSkillsFromText = (value = '') => {
    const text = String(value || '');
    if (!text.trim()) {
        return [];
    }

    return SKILL_PATTERNS
        .filter(({ patterns }) => patterns.some((pattern) => pattern.test(text)))
        .map(({ label }) => label);
};

const extractSkillsFromSources = ({ resumeText = '', candidateProfileText = '' }) =>
    mergeUniqueSkills(
        extractSkillsFromText(resumeText),
        extractSkillsFromText(candidateProfileText)
    );

const findMissingRequiredSkills = (requiredSkills = [], matchedSkills = []) => {
    const matchedKeys = new Set(matchedSkills.map((skill) => normalizeSkillKey(skill)));

    return mergeUniqueSkills(requiredSkills.filter((skill) => {
        const requiredKey = normalizeSkillKey(skill);
        return requiredKey && !matchedKeys.has(requiredKey);
    }));
};

module.exports = {
    SKILL_PATTERNS,
    extractSkillsFromText,
    extractSkillsFromSources,
    findMissingRequiredSkills,
    mergeUniqueSkills,
    normalizeSkillKey,
};
