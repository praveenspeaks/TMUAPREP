const { PrismaClient } = require('@prisma/client');

const dbUrl = "postgresql://rohit:rohit%2123@72.60.23.150:5433/tmuaprep?sslmode=disable";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: dbUrl,
        },
    },
});

module.exports = prisma;
