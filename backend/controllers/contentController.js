const { Content, User } = require('../models');

// @desc    Create new content (Schedule, Material, Announcement)
// @route   POST /api/content
// @access  Private (Staff/Admin)
const createContent = async (req, res) => {
    const { title, description, type, fileUrl, targetAudience } = req.body;

    try {
        const content = await Content.create({
            title,
            description,
            type,
            fileUrl,
            targetAudience,
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

        const content = await Content.findAll({
            where: query,
            include: [
                {
                    model: User,
                    as: 'uploader',
                    attributes: ['name'],
                },
            ],
        });
        res.json(content);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createContent, getContent };
