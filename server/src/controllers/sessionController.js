// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();
const prisma = require('../utils/prismaClient');

const startSession = async (req, res) => {
    const userId = req.user.id;
    try {
        const session = await prisma.session.create({
            data: {
                userId,
                startTime: new Date(),
            },
        });
        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ message: 'Error starting session', error: error.message });
    }
};

const submitAnswer = async (req, res) => {
    const { sessionId, questionId, selectedOption } = req.body;
    const userId = req.user.id;

    try {
        // Check if answered
        const existingAnswer = await prisma.userAnswer.findUnique({
            where: {
                sessionId_questionId: {
                    sessionId,
                    questionId,
                },
            },
        });

        if (existingAnswer) {
            return res.status(400).json({ message: 'Question already answered in this session' });
        }

        const question = await prisma.question.findUnique({ where: { id: questionId } });
        if (!question) return res.status(404).json({ message: 'Question not found' });

        const isCorrect = question.correctOptionIndex === selectedOption;

        const answer = await prisma.userAnswer.create({
            data: {
                sessionId,
                questionId,
                selectedOption,
                isCorrect,
            },
        });

        // Update session score if correct
        if (isCorrect) {
            await prisma.session.update({
                where: { id: sessionId },
                data: {
                    score: { increment: 1 }
                }
            });
        }

        res.json({ isCorrect, correctAnswer: isCorrect ? null : question.correctOptionIndex });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting answer', error: error.message });
    }
};

const endSession = async (req, res) => {
    const { sessionId } = req.body;
    try {
        const session = await prisma.session.update({
            where: { id: sessionId },
            data: { endTime: new Date() },
            include: { answers: true } // Include answers for stats if needed
        });
        res.json(session);
    } catch (error) {
        res.status(500).json({ message: 'Error ending session', error: error.message });
    }
};

const getHistory = async (req, res) => {
    const userId = req.user.id;
    try {
        const sessions = await prisma.session.findMany({
            where: { userId },
            orderBy: { startTime: 'desc' },
            include: { _count: { select: { answers: true } } }
        });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching history', error: error.message });
    }
};

module.exports = { startSession, submitAnswer, endSession, getHistory };
