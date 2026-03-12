const fs = require('fs');
const path = require('path');
const solc = require('solc');

const contractPath = path.resolve(__dirname, '..', 'contracts', 'ScreeningRegistry.sol');
const artifactDir = path.resolve(__dirname, '..', 'artifacts');
const artifactPath = path.resolve(artifactDir, 'ScreeningRegistry.json');

const compileContract = () => {
    const source = fs.readFileSync(contractPath, 'utf8');

    const input = {
        language: 'Solidity',
        sources: {
            'ScreeningRegistry.sol': {
                content: source,
            },
        },
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
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

    console.log(`Compiled ScreeningRegistry to ${artifactPath}`);
};

try {
    compileContract();
} catch (error) {
    console.error(error.message);
    process.exit(1);
}
