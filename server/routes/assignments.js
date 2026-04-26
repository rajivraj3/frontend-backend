const express = require('express');
const Assignment = require('../models/Assignment');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Create Assignment (Faculty only)
router.post('/', auth, authorize('faculty', 'admin'), async (req, res) => {
    try {
        const assignment = new Assignment({
            ...req.body,
            facultyId: req.user._id
        });
        await assignment.save();
        res.status(201).send(assignment);
    } catch (e) {
        res.status(400).send(e);
    }
});

// Get all assignments
router.get('/', auth, async (req, res) => {
    try {
        const assignments = await Assignment.find({}).populate('facultyId', 'name');
        res.send(assignments);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;
