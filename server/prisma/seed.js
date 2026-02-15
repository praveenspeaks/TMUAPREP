const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { hashPassword } = require('../src/utils/auth');

async function main() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPasswordPlain = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

    // Create Plans
    const plans = [
        { name: '6 Months Plan', durationMonths: 6, price: 49.99 },
        { name: '1 Year Plan', durationMonths: 12, price: 89.99 },
    ];

    for (const plan of plans) {
        await prisma.membershipPlan.create({
            data: plan,
        });
    }

    // Create Admin User
    const adminPassword = await hashPassword(adminPasswordPlain);
    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            password: adminPassword,
            name: 'Admin User',
            role: 'ADMIN',
        },
    });

    // Create a Sample Question
    await prisma.question.create({
        data: {
            text: 'What is the value of x if 2x + 4 = 10?',
            options: ['2', '3', '4', '5'],
            correctOptionIndex: 1, // '3'
            markings: 'Algebra basics',
        }
    });

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
