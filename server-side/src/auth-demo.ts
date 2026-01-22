import { UserRole } from '@prisma/client';
import { requireRole, AuthContext, AuthorizationError } from './middleware/authorize';

// --- Mock Handlers ---

// specific handler that requires ADMIN role
const deleteDatabaseDictionary = {
    name: 'Delete Database',
    authorize: requireRole([UserRole.ADMIN]),
    execute: async () => {
        console.log('🔥 DATABASE DELETED (Simulated) 🔥');
        return 'Success';
    }
};

// specific handler that requires USER or ADMIN
const viewDashboardDictionary = {
    name: 'View Dashboard',
    authorize: requireRole([UserRole.USER, UserRole.ADMIN]),
    execute: async () => {
        console.log('📊 Displaying Dashboard...');
        return 'Dashboard Content';
    }
};

// --- Demo Logic ---

async function simulateRequest(userContext: AuthContext, handlerData: typeof deleteDatabaseDictionary) {
    console.log(`\n--- Request: ${handlerData.name} by ${userContext.user?.role || 'Guest'} ---`);

    try {
        // 1. Run Authorization
        handlerData.authorize(userContext);

        // 2. Run Handler if auth passes
        await handlerData.execute();
        console.log('✅ Request Completed Successfully');
    } catch (error) {
        if (error instanceof AuthorizationError) {
            console.error('❌ Authorization Failed:', error.message);
        } else {
            console.error('❌ Unexpected Error:', error);
        }
    }
}

async function main() {
    console.log('🚀 Starting Authorization Middleware Demo...\n');

    // Define Contexts
    const adminUser: AuthContext = {
        user: { id: 1, email: 'admin@oasis.com', role: UserRole.ADMIN }
    };

    const regularUser: AuthContext = {
        user: { id: 2, email: 'student@oasis.com', role: UserRole.USER }
    };

    const guestUser: AuthContext = {
        user: undefined
    };

    // Case 1: Admin performs Admin Task -> Should Success
    await simulateRequest(adminUser, deleteDatabaseDictionary);

    // Case 2: Regular User performs Admin Task -> Should Fail
    await simulateRequest(regularUser, deleteDatabaseDictionary);

    // Case 3: Regular User performs Common Task -> Should Success
    await simulateRequest(regularUser, viewDashboardDictionary);

    // Case 4: Guest User performs Common Task -> Should Fail (Unauthorized)
    await simulateRequest(guestUser, viewDashboardDictionary);
}

main().catch(console.error);
