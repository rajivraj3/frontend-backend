const crypto = require('crypto');
const stringSimilarity = require('string-similarity');
const Submission = require('../models/Submission');
const Alert = require('../models/Alert');
const User = require('../models/User');

const calculateHash = (buffer) => {
    return crypto.createHash('sha256').update(buffer).digest('hex');
};

const runDetection = async (newSubmission, buffer) => {
    const alerts = [];

    // 1. Duplicate File Detection (Hash)
    const duplicateFile = await Submission.findOne({
        hash: newSubmission.hash,
        _id: { $ne: newSubmission._id }
    }).populate('studentId');

    if (duplicateFile) {
        alerts.push({
            submissionId: newSubmission._id,
            type: 'duplicate_file',
            message: `Exact file match found with submission from ${duplicateFile.studentId.name}`,
            confidence: 100,
            riskLevel: 'critical'
        });
    }

    // 2. Content Similarity (Text)
    if (newSubmission.textContent) {
        const otherSubmissions = await Submission.find({
            assignmentId: newSubmission.assignmentId,
            _id: { $ne: newSubmission._id },
            textContent: { $exists: true }
        }).populate('studentId');

        for (const other of otherSubmissions) {
            const similarity = stringSimilarity.compareTwoStrings(newSubmission.textContent, other.textContent);
            const percentage = Math.round(similarity * 100);

            if (percentage > 70) {
                alerts.push({
                    submissionId: newSubmission._id,
                    type: 'content_similarity',
                    message: `${percentage}% content similarity detected with student ${other.studentId.name}`,
                    confidence: percentage,
                    riskLevel: percentage > 90 ? 'high' : 'medium'
                });
            }
        }
    }

    // 3. Timing Anomaly (Within 2 minutes)
    const twoMinutesAgo = new Date(newSubmission.submittedAt.getTime() - 2 * 60000);
    const recentSubmissions = await Submission.find({
        assignmentId: newSubmission.assignmentId,
        _at: { $gte: twoMinutesAgo, $lte: newSubmission.submittedAt },
        _id: { $ne: newSubmission._id }
    });

    if (recentSubmissions.length >= 4) { // Bulk submission
        alerts.push({
            submissionId: newSubmission._id,
            type: 'timing_anomaly',
            message: `Bulk submission pattern: ${recentSubmissions.length + 1} submissions within 2 minutes`,
            confidence: 85,
            riskLevel: 'high'
        });
    }

    // 4. Same IP Detection
    const sameIp = await Submission.find({
        ipAddress: newSubmission.ipAddress,
        assignmentId: newSubmission.assignmentId,
        _id: { $ne: newSubmission._id }
    });

    if (sameIp.length > 0) {
        alerts.push({
            submissionId: newSubmission._id,
            type: 'ip_collision',
            message: `Multiple submissions from the same IP address (${newSubmission.ipAddress})`,
            confidence: 90,
            riskLevel: 'medium'
        });
    }

    // 5. Repeat Offender Detection
    const student = await User.findById(newSubmission.studentId);
    if (student.flaggedCount >= 3) {
        alerts.push({
            submissionId: newSubmission._id,
            type: 'repeat_offender',
            message: `Student has been flagged ${student.flaggedCount} times in the past`,
            confidence: 100,
            riskLevel: 'high'
        });
    }

    // Save alerts and update submission status
    if (alerts.length > 0) {
        await Alert.insertMany(alerts);
        newSubmission.status = 'flagged';
        newSubmission.suspiciousScore = Math.max(...alerts.map(a => a.confidence));
        await newSubmission.save();
        
        // Increment user flagged count
        student.flaggedCount += 1;
        await student.save();
    }

    return alerts;
};

module.exports = { calculateHash, runDetection };
