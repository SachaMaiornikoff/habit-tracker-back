"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
require("dotenv/config");
const adapter_libsql_1 = require("@prisma/adapter-libsql");
const client_1 = require("../generated/prisma/client");
const auth_validator_1 = require("../validators/auth.validator");
const auth_service_1 = require("../services/auth.service");
const adapter = new adapter_libsql_1.PrismaLibSql({ url: process.env.DATABASE_URL });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new client_1.PrismaClient({ adapter });
async function register(req, res) {
    try {
        const validation = auth_validator_1.registerSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                error: 'Validation failed',
                details: validation.error.issues,
            });
            return;
        }
        const { email, password, firstName, lastName } = validation.data;
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            res.status(409).json({
                error: 'Email already registered',
            });
            return;
        }
        const passwordHash = await (0, auth_service_1.hashPassword)(password);
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                firstName,
                lastName,
            },
        });
        const token = (0, auth_service_1.generateToken)(user.id);
        res.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                createdAt: user.createdAt,
            },
            token,
        });
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            error: 'Internal server error',
        });
    }
}
