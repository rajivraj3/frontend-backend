const express = require('express');
const Alert = require('../models/Alert');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Get all alerts (Faculty/Admin only)
router.get('/', auth, authorize('faculty', 'admin'), async (req, res) => {
    try {
        const alerts = await Alert.find({})
            .populate({
                path: 'submissionId',
                populate: [
                    { path: 'studentId', select: 'name email' },
                    { path: 'assignmentId', select: 'title' }
                ]
            })
            .sort({ createdAt: -1 });
        res.send(alerts);
    } catch (e) {
        res.status(500).send(e);
    }
});

// Review alert
router.put('/:id/review', auth, authorize('faculty', 'admin'), async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id);
        if (!alert) return res.status(404).send();
        
        alert.status = req.body.status; // 'dismissed' or 'confirmed'
        alert.reviewedBy = req.user._id;
        await alert.save();
        res.send(alert);
    } catch (e) {
        res.status(400).send(e);
    }
});

module.exports = router;
