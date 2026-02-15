// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();
const prisma = require('../utils/prismaClient');

const validateQuestionPayload = ({ text, options, correctOptionIndex }) => {
    if (!text || typeof text !== 'string' || !text.trim()) return 'Question text is required';
    if (!Array.isArray(options) || options.length < 2) return 'At least 2 options are required';
    if (options.some((option) => typeof option !== 'string' || !option.trim())) return 'All options must be non-empty text';
    if (typeof correctOptionIndex !== 'number' || correctOptionIndex < 0 || correctOptionIndex >= options.length) {
        return 'Correct option index is invalid';
    }
    return null;
};

const getQuestion = async (req, res) => {
    try {
        // Get a random question OR next unanswered question logic can be implemented here.
        // START SIMPLE: Random question
        const count = await prisma.question.count();
        const skip = Math.floor(Math.random() * count);
        const question = await prisma.question.findFirst({
            skip: skip,
            select: {
                id: true,
                text: true,
                options: true,
                // Exclude correctOptionIndex and markings for user
            }
        });

        if (!question) return res.status(404).json({ message: 'No questions available' });
        res.json(question);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching question', error: error.message });
    }
};

const addQuestion = async (req, res) => {
    const { text, options, correctOptionIndex, markings } = req.body;

    try {
        const validationError = validateQuestionPayload({ text, options, correctOptionIndex });
        if (validationError) return res.status(400).json({ message: validationError });

        const question = await prisma.question.create({
            data: {
                text,
                options,
                correctOptionIndex,
                markings,
            },
        });
        res.status(201).json(question);
    } catch (error) {
        res.status(500).json({ message: 'Error adding question', error: error.message });
    }
};

const listQuestions = async (req, res) => {
    try {
        const questions = await prisma.question.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching questions', error: error.message });
    }
};

const updateQuestion = async (req, res) => {
    const questionId = parseInt(req.params.id);
    const { text, options, correctOptionIndex, markings } = req.body;

    try {
        const existing = await prisma.question.findUnique({ where: { id: questionId } });
        if (!existing) return res.status(404).json({ message: 'Question not found' });

        const nextPayload = {
            text: text ?? existing.text,
            options: options ?? existing.options,
            correctOptionIndex: correctOptionIndex ?? existing.correctOptionIndex,
        };

        const validationError = validateQuestionPayload(nextPayload);
        if (validationError) return res.status(400).json({ message: validationError });

        const updatedQuestion = await prisma.question.update({
            where: { id: questionId },
            data: {
                ...(text !== undefined ? { text } : {}),
                ...(options !== undefined ? { options } : {}),
                ...(correctOptionIndex !== undefined ? { correctOptionIndex } : {}),
                ...(markings !== undefined ? { markings } : {}),
            },
        });

        res.json(updatedQuestion);
    } catch (error) {
        res.status(500).json({ message: 'Error updating question', error: error.message });
    }
};

module.exports = { getQuestion, addQuestion, listQuestions, updateQuestion };
