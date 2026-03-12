const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');
const solc = require('solc');

const contractPath = path.resolve(__dirname, '..', 'contracts', 'ScreeningRegistry.sol');
const artifactDir = path.resolve(__dirname, '..', 'artifacts');
const artifactPath = path.resolve(artifactDir, 'ScreeningRegistry.json');

const compileArtifact = () => {
    const source = fs.readFileSync(contractPath, 'utf8');
    const input = {
        language: 'Solidity',
        sources: {
            'ScreeningRegistry.sol': { content: source },
        },
        settings: {
            optimizer: { enabled: true, runs: 200 },
            outputSelection: {
                '*': {
                    '*': ['abi', 'evm.bytecode.object'],
                },
            },
        },
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    const compilerErrors = output.errors || [];
    const fatalErrors = compilerErrors.filter((entry) => entry.severity === 'error');
    if (fatalErrors.length > 0) {
        throw new Error(fatalErrors.map((entry) => entry.formattedMessage).join('\n\n'));
    }

    const contract = output.contracts['ScreeningRegistry.sol'].ScreeningRegistry;
    const artifact = {
        contractName: 'ScreeningRegistry',
        abi: contract.abi,
        bytecode: `0x${contract.evm.bytecode.object}`,
    };

    fs.mkdirSync(artifactDir, { recursive: true });
    fs.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2));
    return artifact;
};

const getArtifact = () => {
    if (fs.existsSync(artifactPath)) {
        return JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    }

    return compileArtifact();
};

const main = async () => {
    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
    const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;

    if (!rpcUrl || !privateKey) {
        throw new Error('BLOCKCHAIN_RPC_URL and BLOCKCHAIN_PRIVATE_KEY are required.');
    }

    const artifact = getArtifact();
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
    const contract = await factory.deploy();
    await contract.waitForDeployment();

    const deploymentAddress = await contract.getAddress();
    const network = await provider.getNetwork();

    console.log(`ScreeningRegistry deployed to ${deploymentAddress}`);
    console.log(`Chain ID: ${network.chainId.toString()}`);
    console.log('Update server/.env with:');
    console.log(`BLOCKCHAIN_CONTRACT_ADDRESS=${deploymentAddress}`);
    console.log(`BLOCKCHAIN_CHAIN_ID=${network.chainId.toString()}`);
    console.log('BLOCKCHAIN_NETWORK=sepolia');
  };

main().catch((error) => {
    console.error(error.message || error);
    process.exit(1);
});
