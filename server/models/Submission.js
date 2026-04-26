const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    filePath: { type: String, required: true },
    fileName: { type: String, required: true },
    hash: { type: String, required: true },
    ipAddress: { type: String, required: true },
    textContent: { type: String }, // For similarity check
    submittedAt: { type: Date, default: Date.now },
    suspiciousScore: { type: Number, default: 0 },
    status: { type: String, enum: ['clean', 'flagged', 'reviewed'], default: 'clean' }
});

module.exports = mongoose.model('Submission', submissionSchema);
