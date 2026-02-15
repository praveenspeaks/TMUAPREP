const { PrismaClient } = require('@prisma/client');

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    throw new Error('DATABASE_URL is not defined. Set it in environment variables before starting the server.');
}

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: dbUrl,
        },
    },
});

module.exports = prisma;
