const crypto = require('crypto');
const { ethers } = require('ethers');

const SCREENING_REGISTRY_ABI = [
    'function recordScreening(bytes32 resumeHash, string verificationId, string applicationId, uint256 score) external',
    'function getScreening(bytes32 resumeHash) external view returns (bytes32 storedResumeHash, string verificationId, string applicationId, uint256 score, uint256 recordedAt, address recorder)',
];

const DEFAULT_NETWORK = 'sepolia';
const DEFAULT_EXPLORER_URL = 'https://sepolia.etherscan.io';

const generateResumeHash = ({ resumeText = '', timestamp, fileBuffer = null, fileName = '', mimeType = '' }) => {
    const hash = crypto.createHash('sha256');

    hash.update(String(timestamp || ''));
    hash.update(String(fileName || ''));
    hash.update(String(mimeType || ''));
    hash.update(String(resumeText || ''));

    if (fileBuffer) {
        hash.update(fileBuffer);
    }

    return hash.digest('hex');
};

const generateVerificationId = () => {
    return 'HC-' + crypto.randomBytes(4).toString('hex').toUpperCase();
};

const getBlockchainConfig = () => ({
    enabled: process.env.BLOCKCHAIN_ENABLED !== 'false',
    rpcUrl: process.env.BLOCKCHAIN_RPC_URL || '',
    privateKey: process.env.BLOCKCHAIN_PRIVATE_KEY || '',
    contractAddress: process.env.BLOCKCHAIN_CONTRACT_ADDRESS || '',
    chainId: process.env.BLOCKCHAIN_CHAIN_ID ? Number(process.env.BLOCKCHAIN_CHAIN_ID) : 11155111,
    network: process.env.BLOCKCHAIN_NETWORK || DEFAULT_NETWORK,
    explorerUrl: process.env.BLOCKCHAIN_EXPLORER_URL || DEFAULT_EXPLORER_URL,
    requireOnChain: process.env.BLOCKCHAIN_REQUIRE_ONCHAIN === 'true',
});

const toBytes32Hash = (hash) => {
    const normalized = String(hash || '').replace(/^0x/, '');
    if (normalized.length !== 64) {
        throw new Error('Expected a SHA-256 hash for blockchain submission.');
    }

    return `0x${normalized}`;
};

const getRegistryContract = () => {
    const config = getBlockchainConfig();
    if (!config.rpcUrl || !config.privateKey || !config.contractAddress) {
        throw new Error('Sepolia blockchain env is incomplete. Set BLOCKCHAIN_RPC_URL, BLOCKCHAIN_PRIVATE_KEY, and BLOCKCHAIN_CONTRACT_ADDRESS.');
    }

    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    const signer = new ethers.Wallet(config.privateKey, provider);
    const contract = new ethers.Contract(config.contractAddress, SCREENING_REGISTRY_ABI, signer);

    return { config, provider, signer, contract };
};

const recordScreeningOnChain = async ({ hash, verificationId, applicationId, score }) => {
    const config = getBlockchainConfig();

    if (!config.enabled) {
        return {
            txHash: '',
            blockNumber: null,
            contractAddress: config.contractAddress || '',
            chainId: config.chainId,
            network: config.network,
            onChainConfirmed: false,
            explorerUrl: '',
        };
    }

    try {
        const { contract } = getRegistryContract();
        const tx = await contract.recordScreening(
            toBytes32Hash(hash),
            verificationId,
            String(applicationId),
            BigInt(score || 0)
        );
        const receipt = await tx.wait();

        return {
            txHash: tx.hash,
            blockNumber: receipt?.blockNumber || null,
            contractAddress: config.contractAddress,
            chainId: config.chainId,
            network: config.network,
            onChainConfirmed: true,
            explorerUrl: `${config.explorerUrl.replace(/\/$/, '')}/tx/${tx.hash}`,
        };
    } catch (error) {
        if (config.requireOnChain) {
            throw error;
        }

        console.warn('On-chain write skipped:', error.message);
        return {
            txHash: '',
            blockNumber: null,
            contractAddress: config.contractAddress || '',
            chainId: config.chainId,
            network: config.network,
            onChainConfirmed: false,
            explorerUrl: '',
        };
    }
};

module.exports = {
    DEFAULT_EXPLORER_URL,
    DEFAULT_NETWORK,
    SCREENING_REGISTRY_ABI,
    generateResumeHash,
    generateVerificationId,
    getBlockchainConfig,
    recordScreeningOnChain,
    toBytes32Hash,
};
