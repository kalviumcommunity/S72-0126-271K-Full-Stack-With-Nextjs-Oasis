import { sendSuccess, sendError } from '@/lib/responseHandler';
import { users } from '../route';

// GET /api/users/[id] - Get a single user by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const user = users.find((u) => u.id === id);

    if (!user) {
      return sendError('User not found', 'NOT_FOUND', 404);
    }

    return sendSuccess(user, 'User fetched successfully');
  } catch (error) {
    return sendError('Failed to fetch user', 'INTERNAL_ERROR', 500, error);
  }
}

// PUT /api/users/[id] - Update a user
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const body = await req.json();
    const { name, email, role } = body;

    const userIndex = users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return sendError('User not found', 'NOT_FOUND', 404);
    }

    users[userIndex] = {
      ...users[userIndex],
      ...(name && { name }),
      ...(email && { email }),
      ...(role && { role }),
    };

    return sendSuccess(users[userIndex], 'User updated successfully');
  } catch (error) {
    return sendError('Failed to update user', 'INTERNAL_ERROR', 500, error);
  }
}

// DELETE /api/users/[id] - Delete a user
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const userIndex = users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return sendError('User not found', 'NOT_FOUND', 404);
    }

    const deletedUser = users.splice(userIndex, 1)[0];

    return sendSuccess(deletedUser, 'User deleted successfully');
  } catch (error) {
    return sendError('Failed to delete user', 'INTERNAL_ERROR', 500, error);
  }
}
