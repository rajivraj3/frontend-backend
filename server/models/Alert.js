const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true },
    type: { 
        type: String, 
        enum: ['duplicate_file', 'content_similarity', 'timing_anomaly', 'ip_collision', 'repeat_offender'],
        required: true 
    },
    message: { type: String, required: true },
    confidence: { type: Number, default: 0 }, // 0-100
    riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
    status: { type: String, enum: ['pending', 'dismissed', 'confirmed'], default: 'pending' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', alertSchema);
