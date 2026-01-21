import { z } from 'zod';
import { createUserSchema, updateUserSchema } from './schemas/userSchemas';
import { prisma } from './lib/prisma'; // Assuming this exists from previous steps

async function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): Promise<T> {
    return schema.parseAsync(data);
}

async function createUserHandler(input: unknown) {
    console.log('--- Creating User ---');
    console.log('Input:', JSON.stringify(input, null, 2));

    try {
        const validatedData = await validateRequest(createUserSchema, input);
        console.log('✅ Validation Successful:', validatedData);

        // Simulate DB call
        // const user = await prisma.user.create({ data: validatedData });
        // console.log('User created in DB:', user.id);
        console.log('Simulating DB insertion...');

    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('❌ Validation Failed:', error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', '));
        } else {
            console.error('❌ Unknown Error:', error);
        }
    }
    console.log('\n');
}

async function main() {
    console.log('🚀 Starting Zod Validation Demo...\n');

    // Case 1: Valid Input
    await createUserHandler({
        name: 'Alice Johnson',
        email: 'alice@example.com',
        role: 'ADMIN',
    });

    // Case 2: Invalid Email
    await createUserHandler({
        name: 'Bob Smith',
        email: 'not-an-email',
    });

    // Case 3: Name too short
    await createUserHandler({
        name: 'A',
        email: 'shortname@example.com',
    });

    // Case 4: Extra fields (Zod strips them by default if configured, or ignores them in parse, but strict() would fail)
    // By default, parse() just returns the shape defined in schema, effectively stripping extras if you use the return value.
    await createUserHandler({
        name: 'Charlie',
        email: 'charlie@example.com',
        isAdmin: true, // This field is not in schema
    });
}

main().catch(console.error);
