const { PrismaClient } = require('@prisma/client');
const { comparePassword } = require('../src/utils/auth');

const dbUrl = "postgresql://rohit:rohit%2123@72.60.23.150:5433/tmuaprep?sslmode=disable";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: dbUrl,
        },
    },
});

async function verifyAdmin() {
    const email = 'admin@naman.com';
    const password = 'Admin@123';

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
