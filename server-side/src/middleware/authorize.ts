import { UserRole } from '@prisma/client';

export interface AuthContext {
    user?: {
        id: number;
        email: string;
        role: UserRole;
    };
}

export class AuthorizationError extends Error {
    constructor(message: string = 'Access denied') {
        super(message);
        this.name = 'AuthorizationError';
    }
}

/**
 * Middleware factory to restrict access based on roles.
 * Returns a function that validates the context.
 */
export function requireRole(allowedRoles: UserRole[]) {
    return (context: AuthContext) => {
        if (!context.user) {
            throw new AuthorizationError('Unauthorized: No user found');
        }

        if (!allowedRoles.includes(context.user.role)) {
            throw new AuthorizationError(`Forbidden: User role '${context.user.role}' is not allowed. Required: ${allowedRoles.join(' or ')}`);
        }

        // If valid, just return true or pass through
        return true;
    };
}
