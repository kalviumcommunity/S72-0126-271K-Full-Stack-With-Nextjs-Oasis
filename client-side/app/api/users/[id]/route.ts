import { NextRequest } from 'next/server';
import { sendSuccess, sendError } from '@/lib/responseHandler';
import { users } from '../route';

// GET /api/users/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = Number(id);

    const user = users.find((u) => u.id === userId);
    if (!user) {
      return sendError('User not found', 'NOT_FOUND', 404);
    }

    return sendSuccess(user, 'User fetched successfully');
  } catch (error) {
    return sendError('Failed to fetch user', 'INTERNAL_ERROR', 500, error);
  }
}

// PUT /api/users/[id]
export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = Number(id);

    const body = await _request.json();
    const { name, email, role } = body;

    const userIndex = users.findIndex((u) => u.id === userId);
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

// DELETE /api/users/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = Number(id);

    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return sendError('User not found', 'NOT_FOUND', 404);
    }

    const deletedUser = users.splice(userIndex, 1)[0];
    return sendSuccess(deletedUser, 'User deleted successfully');
  } catch (error) {
    return sendError('Failed to delete user', 'INTERNAL_ERROR', 500, error);
  }
}
