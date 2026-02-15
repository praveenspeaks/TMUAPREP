// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();
const prisma = require('../utils/prismaClient');
const { hashPassword } = require('../utils/auth');

const isSuperAdmin = (user) => user.role === 'ADMIN';
const isStaff = (user) => user.role === 'STAFF';

const canManageRole = (actingUser, targetRole) => {
    if (isSuperAdmin(actingUser)) return true;
    if (isStaff(actingUser)) return targetRole === 'USER';
    return false;
};

const getStats = async (req, res) => {
    try {
        const totalUsers = await prisma.user.count({ where: { role: 'USER' } });
        const totalSales = await prisma.payment.aggregate({
            _sum: { amount: true }
        });
        const activeMembers = await prisma.userMembership.count({ where: { status: 'ACTIVE' } });

        res.json({
            totalUsers,
            totalSales: totalSales._sum.amount || 0,
            activeMembers
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching admin stats', error: error.message });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: isStaff(req.user) ? { role: { not: 'ADMIN' } } : undefined,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
                membership: {
                    select: {
                        status: true,
                        plan: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        sessions: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

const createUser = async (req, res) => {
    const { email, password, name, role = 'USER', isActive = true } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        if (!canManageRole(req.user, role)) {
            return res.status(403).json({ message: 'You can only create student accounts' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role,
                isActive,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
        });

        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};

const updateUser = async (req, res) => {
    const userId = parseInt(req.params.id);
    const { email, name, role, isActive } = req.body;

    try {
        const targetUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!targetUser) return res.status(404).json({ message: 'User not found' });

        if (!canManageRole(req.user, targetUser.role)) {
            return res.status(403).json({ message: 'You can only manage student accounts' });
        }

        if (req.user.id === userId && role && role !== 'ADMIN') {
            return res.status(400).json({ message: 'You cannot remove your own admin role' });
        }

        if (req.user.id === userId && isActive === false) {
            return res.status(400).json({ message: 'You cannot deactivate your own account' });
        }

        if (email && email !== targetUser.email) {
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: 'Another user already has this email' });
            }
        }

        if (role !== undefined && !canManageRole(req.user, role)) {
            return res.status(403).json({ message: 'You can only assign USER role' });
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(email !== undefined ? { email } : {}),
                ...(name !== undefined ? { name } : {}),
                ...(role !== undefined ? { role } : {}),
                ...(isActive !== undefined ? { isActive } : {}),
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
                membership: {
                    select: {
                        status: true,
                        plan: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        sessions: true,
                    },
                },
            },
        });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};

const updateUserPassword = async (req, res) => {
    const userId = parseInt(req.params.id);
    const { password } = req.body;

    try {
        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const targetUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!targetUser) return res.status(404).json({ message: 'User not found' });

        if (!canManageRole(req.user, targetUser.role)) {
            return res.status(403).json({ message: 'You can only manage student accounts' });
        }

        const hashedPassword = await hashPassword(password);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating password', error: error.message });
    }
};

const deleteUser = async (req, res) => {
    const userId = parseInt(req.params.id);

    try {
        if (req.user.id === userId) {
            return res.status(400).json({ message: 'You cannot delete your own account' });
        }

        const targetUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!targetUser) return res.status(404).json({ message: 'User not found' });

        if (!canManageRole(req.user, targetUser.role)) {
            return res.status(403).json({ message: 'You can only manage student accounts' });
        }

        await prisma.$transaction(async (tx) => {
            await tx.userAnswer.deleteMany({
                where: {
                    session: {
                        userId,
                    },
                },
            });
            await tx.session.deleteMany({ where: { userId } });
            await tx.payment.deleteMany({ where: { userId } });
            await tx.userMembership.deleteMany({ where: { userId } });
            await tx.user.delete({ where: { id: userId } });
        });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

const revokeMembership = async (req, res) => {
    const { userId } = req.body;
    try {
        const targetUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!targetUser) return res.status(404).json({ message: 'User not found' });
        if (!canManageRole(req.user, targetUser.role)) {
            return res.status(403).json({ message: 'You can only manage student memberships' });
        }

        await prisma.userMembership.update({
            where: { userId },
            data: { status: 'CANCELLED' }
        });
        res.json({ message: 'Membership revoked' });
    } catch (error) {
        res.status(500).json({ message: 'Error revoking membership', error: error.message });
    }
};

const grantMembership = async (req, res) => {
    const { userId, planId } = req.body;
    try {
        const targetUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!targetUser) return res.status(404).json({ message: 'User not found' });
        if (!canManageRole(req.user, targetUser.role)) {
            return res.status(403).json({ message: 'You can only manage student memberships' });
        }

        const plan = await prisma.membershipPlan.findUnique({ where: { id: planId } });
        if (!plan) return res.status(404).json({ message: 'Plan not found' });

        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + plan.durationMonths);
        const uniqueMemberId = `MEM-MANUAL-${Date.now()}-${userId}`;

        await prisma.userMembership.upsert({
            where: { userId },
            update: {
                planId,
                startDate,
                endDate,
                status: 'ACTIVE',
                uniqueMemberId,
            },
            create: {
                userId,
                planId,
                startDate,
                endDate,
                status: 'ACTIVE',
                uniqueMemberId,
            },
        });
        res.json({ message: 'Membership granted' });
    } catch (error) {
        res.status(500).json({ message: 'Error granting membership', error: error.message });
    }
};

module.exports = {
    getStats,
    getUsers,
    createUser,
    updateUser,
    updateUserPassword,
    deleteUser,
    revokeMembership,
    grantMembership,
};
