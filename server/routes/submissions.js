const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const { auth, authorize } = require('../middleware/auth');
const Submission = require('../models/Submission');
const { calculateHash, runDetection } = require('../utils/detectionEngine');
const router = express.Router();

// Multer config
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Upload Submission (Student only)
router.post('/upload', auth, authorize('student'), upload.single('assignment'), async (req, res) => {
    try {
        const fileBuffer = fs.readFileSync(req.file.path);
        const hash = calculateHash(fileBuffer);
        
        let textContent = '';
        const ext = path.extname(req.file.originalname).toLowerCase();
        
        if (ext === '.pdf') {
            const data = await pdf(fileBuffer);
            textContent = data.text;
        } else if (ext === '.docx') {
            const result = await mammoth.extractRawText({ path: req.file.path });
            textContent = result.value;
        } else if (ext === '.txt') {
            textContent = fileBuffer.toString();
        }

        const submission = new Submission({
            studentId: req.user._id,
            assignmentId: req.body.assignmentId,
            filePath: req.file.path,
            fileName: req.file.originalname,
            hash: hash,
            ipAddress: req.ip || req.connection.remoteAddress,
            textContent: textContent
        });

        await submission.save();

        // Run detection logic
        const alerts = await runDetection(submission, fileBuffer);

        res.status(201).send({ submission, alerts });
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
});

// Get submissions (Role based)
router.get('/', auth, async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'student') {
            query.studentId = req.user._id;
        }
        const submissions = await Submission.find(query)
            .populate('studentId', 'name email')
            .populate('assignmentId', 'title');
        res.send(submissions);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;
