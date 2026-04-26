const express = require('express');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Get all users (Admin only)
router.get('/', auth, authorize('admin'), async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.send(users);
    } catch (e) {
        res.status(500).send(e);
    }
});

// Get profile
router.get('/me', auth, async (req, res) => {
    res.send(req.user);
});

module.exports = router;
