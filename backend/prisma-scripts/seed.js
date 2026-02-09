"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    const managerPassword = await bcrypt.hash('Manager123!', 10);
    const employeePassword = await bcrypt.hash('Employee123!', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@flexspace.com' },
        update: {},
        create: {
            email: 'admin@flexspace.com',
            password: adminPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN',
        },
    });
    const manager = await prisma.user.upsert({
        where: { email: 'manager@flexspace.com' },
        update: {},
        create: {
            email: 'manager@flexspace.com',
            password: managerPassword,
            firstName: 'Manager',
            lastName: 'Smith',
            role: 'MANAGER',
        },
    });
    const employee = await prisma.user.upsert({
        where: { email: 'employee@flexspace.com' },
        update: {},
        create: {
            email: 'employee@flexspace.com',
            password: employeePassword,
            firstName: 'John',
            lastName: 'Doe',
            role: 'EMPLOYEE',
        },
    });
    console.log('✅ Users created:', { admin, manager, employee });
    const spaces = [
        {
            name: 'Bureau Open Space 1',
            type: 'DESK',
            capacity: 1,
            floor: '2',
            building: 'A',
            openTime: '08:00',
            closeTime: '20:00',
        },
        {
            name: 'Bureau Open Space 2',
            type: 'DESK',
            capacity: 1,
            floor: '2',
            building: 'A',
            openTime: '08:00',
            closeTime: '20:00',
        },
        {
            name: 'Salle Zeus',
            type: 'MEETING_ROOM',
            capacity: 10,
            floor: '3',
            building: 'B',
            openTime: '08:00',
            closeTime: '20:00',
        },
        {
            name: 'Salle Athena',
            type: 'MEETING_ROOM',
            capacity: 8,
            floor: '3',
            building: 'B',
            openTime: '08:00',
            closeTime: '20:00',
        },
        {
            name: 'Espace Innovation',
            type: 'COLLABORATIVE_SPACE',
            capacity: 6,
            floor: '1',
            building: 'A',
            openTime: '08:00',
            closeTime: '20:00',
        },
        {
            name: 'Espace Créatif',
            type: 'COLLABORATIVE_SPACE',
            capacity: 4,
            floor: '1',
            building: 'C',
            openTime: '08:00',
            closeTime: '18:00',
        },
    ];
    for (const space of spaces) {
        await prisma.space.upsert({
            where: { name: space.name },
            update: {},
            create: space,
        });
    }
    console.log(`✅ ${spaces.length} spaces created`);
    console.log('🎉 Seeding completed!');
}
main()
    .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map