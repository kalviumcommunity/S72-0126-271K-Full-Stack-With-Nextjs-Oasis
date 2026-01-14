import { sendSuccess, sendError } from '@/lib/responseHandler';

// Mock database
export let users = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'user' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'user' },
];

// GET /api/users - Get all users with pagination
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';

    // Filter users by search term
    let filteredUsers = users;
    if (search) {
      filteredUsers = users.filter(
        (user) =>
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return sendSuccess(
      {
        users: paginatedUsers,
        pagination: {
          page,
          limit,
          total: filteredUsers.length,
          totalPages: Math.ceil(filteredUsers.length / limit),
        },
      },
      'Users fetched successfully'
    );
  } catch (error) {
    return sendError('Failed to fetch users', 'INTERNAL_ERROR', 500, error);
  }
}

// POST /api/users - Create a new user
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, role } = body;

    if (!name || !email) {
      return sendError('Name and email are required', 'MISSING_FIELD', 400);
    }

    // Check for duplicate email
    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      return sendError('Email already exists', 'DUPLICATE_ENTRY', 400);
    }

    const newUser = {
      id: users.length + 1,
      name,
      email,
      role: role || 'user',
    };

    users.push(newUser);

    return sendSuccess(newUser, 'User created successfully', 201);
  } catch (error) {
    return sendError('Failed to create user', 'INTERNAL_ERROR', 500, error);
  }
}

// PUT /api/users - Update a user
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, email, role } = body;

    if (!id) {
      return sendError('User ID is required', 'MISSING_FIELD', 400);
    }

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

// DELETE /api/users - Delete a user
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get('id'));

    if (!id) {
      return sendError('User ID is required', 'MISSING_FIELD', 400);
    }

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
