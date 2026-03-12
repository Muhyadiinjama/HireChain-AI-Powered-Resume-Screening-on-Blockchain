const mongoose = require('mongoose');

const blockchainLogSchema = new mongoose.Schema({
    hash: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
    verificationId: { type: String, required: true },
    txHash: { type: String, default: '' },
    blockNumber: { type: Number },
    contractAddress: { type: String, default: '' },
    chainId: { type: Number },
    network: { type: String, default: '' },
    onChainConfirmed: { type: Boolean, default: false },
    explorerUrl: { type: String, default: '' }
});

module.exports = mongoose.model('BlockchainLog', blockchainLogSchema);
