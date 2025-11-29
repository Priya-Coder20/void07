const Content = require('../models_mongo/Content');

// @desc    Create new content (Schedule, Material, Announcement)
// @route   POST /api/content
// @access  Private (Staff/Admin)
const createContent = async (req, res) => {
    const { title, description, type, fileUrl, targetAudience, scheduledDate, eventType } = req.body;

    try {
        const content = await Content.create({
            title,
            description,
            type,
            fileUrl,
            targetAudience,
            scheduledDate,
            eventType,
            uploadedBy: req.user.id,
        });

        res.status(201).json(content);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all content
// @route   GET /api/content
// @access  Private
const getContent = async (req, res) => {
    try {
        const { type } = req.query;
        let query = {};
        if (type) {
            query.type = type;
        }

        const content = await Content.find(query);
        res.json(content);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update content
// @route   PUT /api/content/:id
// @access  Private (Staff/Admin)
const updateContent = async (req, res) => {
    try {
        let content = await Content.findById(req.params.id);

        if (!content) {
            return res.status(404).json({ message: 'Content not found' });
        }

        // Check user ownership or admin role (simplified for now, assuming staff can edit their own or admin can edit all)
        // For now, let's allow if they are authorized as staff/admin via middleware

        content = await Content.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.json(content);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete content
// @route   DELETE /api/content/:id
// @access  Private (Staff/Admin)
const deleteContent = async (req, res) => {
    try {
        const content = await Content.findById(req.params.id);

        if (!content) {
            return res.status(404).json({ message: 'Content not found' });
        }

        await content.deleteOne();

        res.json({ message: 'Content removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createContent, getContent, updateContent, deleteContent };
