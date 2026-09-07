require('dotenv').config();
const prisma = require('../src/config/prisma');
const bcrypt = require('bcrypt');

async function main() {
    console.log('Creating admin account...');
    const passwordHash = await bcrypt.hash('password123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@company.com' },
        update: {},
        create: {
            name: 'Admin',
            email: 'admin@company.com',
            passwordHash,
            role: 'ADMIN'
        }
    });

    console.log('Admin account created/verified:', admin.email);
    console.log('Seed complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });