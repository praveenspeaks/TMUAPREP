const { PrismaClient } = require('@prisma/client');
const { comparePassword } = require('../src/utils/auth');

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    throw new Error('DATABASE_URL is required to run verify_admin.js');
}

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: dbUrl,
        },
    },
});

async function verifyAdmin() {
    const email = process.env.ADMIN_VERIFY_EMAIL;
    const password = process.env.ADMIN_VERIFY_PASSWORD;

    if (!email || !password) {
        throw new Error('Set ADMIN_VERIFY_EMAIL and ADMIN_VERIFY_PASSWORD before running verify_admin.js');
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log('User not found');
            return;
        }

        const isMatch = await comparePassword(password, user.password);
        if (isMatch) {
            console.log('Credentials valid! Password matches.');
        } else {
            console.log('Credentials INVALID! Password does NOT match.');
        }
    } catch (error) {
        console.error('Error verifying admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyAdmin();
