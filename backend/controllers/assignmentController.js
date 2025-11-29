const Assignment = require('../models_mongo/Assignment');
const Submission = require('../models_mongo/Submission');
const { User } = require('../models'); // Sequelize User model

// Create a new assignment
exports.createAssignment = async (req, res) => {
    try {
        const { title, subject, description, dueDate, totalPoints, questions } = req.body;

        const newAssignment = new Assignment({
            title,
            subject,
            description,
            dueDate,
            totalPoints,
            questions,
            createdBy: req.user.id, // Assuming auth middleware adds user to req
        });

        await newAssignment.save();
        res.status(201).json(newAssignment);
    } catch (error) {
        console.error('Error creating assignment:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all assignments (with optional filters)
exports.getAssignments = async (req, res) => {
    try {
        const { subject } = req.query;
        let query = {};
        if (subject) {
            query.subject = subject;
        }

        const assignments = await Assignment.find(query).sort({ createdAt: -1 });

        // If user is a student, check submission status for each assignment
        if (req.user.role === 'student') {
            const studentId = req.user.id; // This is the Postgres ID (integer)

            // Fetch all submissions for this student
            // Note: studentId in Submission model is stored as String.
            const submissions = await Submission.find({ studentId: String(studentId) });

            // Create a map of assignmentId -> submission
            const submissionMap = {};
            submissions.forEach(sub => {
                submissionMap[sub.assignmentId.toString()] = sub;
            });

            // Add status to each assignment object
            const assignmentsWithStatus = assignments.map(assignment => {
                const submission = submissionMap[assignment._id.toString()];
                return {
                    ...assignment.toObject(),
                    submissionStatus: submission ? 'completed' : 'due',
                    submissionId: submission ? submission._id : null
                };
            });

            return res.json(assignmentsWithStatus);
        }

        res.json(assignments);
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get single assignment by ID
exports.getAssignmentById = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        res.json(assignment);
    } catch (error) {
        console.error('Error fetching assignment:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Submit an assignment
exports.submitAssignment = async (req, res) => {
    try {
        const { assignmentId, answers } = req.body;
        const studentId = req.user.id;
        const studentName = req.user.name;

        // Check if already submitted
        const existingSubmission = await Submission.findOne({ assignmentId, studentId });
        if (existingSubmission) {
            return res.status(400).json({ message: 'You have already submitted this assignment.' });
        }

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Simple auto-grading logic (can be expanded)
        let score = 0;
        // Placeholder for grading logic if we had correct answers in DB
        // For now, we'll mark as submitted and let staff grade, or give full points if no grading logic

        const newSubmission = new Submission({
            assignmentId,
            studentId,
            studentName,
            answers,
            score: 0, // Default to 0 until graded
            status: 'submitted'
        });

        await newSubmission.save();
        res.status(201).json(newSubmission);
    } catch (error) {
        console.error('Error submitting assignment:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get submissions for an assignment (Staff only)
exports.getSubmissions = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const submissions = await Submission.find({ assignmentId });
        res.json(submissions);
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Grade a submission
exports.gradeSubmission = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { score } = req.body;

        const submission = await Submission.findById(submissionId);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        const previousScore = submission.score || 0;
        submission.score = score;
        submission.status = 'graded';
        await submission.save();

        // Update student's reward points
        // We need to find the user by their ID. 
        // Note: studentId in Submission is stored as String (from req.user.id which is likely Int from Postgres)
        // Ensure type consistency.
        const student = await User.findByPk(submission.studentId);
        if (student) {
            // Add difference if re-grading, or just add new score
            // Logic: Reward points = total accumulated score? Or just a gamified currency?
            // Let's assume 1 score = 1 reward point for simplicity, or just add the score.
            // If re-grading, we should subtract old score and add new score.

            // However, User.rewardPoints might be a separate "currency" from "grades".
            // For this feature, let's assume Score == Reward Points earned.

            // Adjust points: remove old score, add new score
            const currentPoints = student.rewardPoints || 0;
            const newPoints = currentPoints - previousScore + score;

            await student.update({ rewardPoints: newPoints });
        }

        res.json(submission);
    } catch (error) {
        console.error('Error grading submission:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get my submission for an assignment (Student)
exports.getMySubmission = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const studentId = req.user.id;

        const submission = await Submission.findOne({ assignmentId, studentId: String(studentId) });
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }
        res.json(submission);
    } catch (error) {
        console.error('Error fetching my submission:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete assignment
exports.deleteAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        await Assignment.findByIdAndDelete(id);
        await Submission.deleteMany({ assignmentId: id }); // Cascade delete submissions
        res.json({ message: 'Assignment deleted' });
    } catch (error) {
        console.error('Error deleting assignment:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
