import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const createUserSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long'),
    email: z.string().email('Invalid email address'),
    role: z.nativeEnum(UserRole).optional().default(UserRole.USER),
});

export const updateUserSchema = z.object({
    name: z.string().min(2).optional(),
    role: z.nativeEnum(UserRole).optional(),
});

export const createTeamSchema = z.object({
    name: z.string().min(3, 'Team name must be at least 3 characters'),
    description: z.string().optional(),
});
