import { NextResponse } from 'next/server';

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

        return NextResponse.json({
            success: true,
            data: paginatedUsers,
            pagination: {
                page,
                limit,
                total: filteredUsers.length,
                totalPages: Math.ceil(filteredUsers.length / limit),
            },
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

// POST /api/users - Create a new user
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, role } = body;

        if (!name || !email) {
            return NextResponse.json(
                { success: false, error: 'Name and email are required' },
                { status: 400 }
            );
        }

        const newUser = {
            id: users.length + 1,
            name,
            email,
            role: role || 'user',
        };

        users.push(newUser);

        return NextResponse.json(
            { success: true, data: newUser },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to create user' },
            { status: 500 }
        );
    }
}

// PUT /api/users - Update a user
export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, name, email, role } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'User ID is required' },
                { status: 400 }
            );
        }

        const userIndex = users.findIndex((u) => u.id === id);

        if (userIndex === -1) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        users[userIndex] = {
            ...users[userIndex],
            ...(name && { name }),
            ...(email && { email }),
            ...(role && { role }),
        };

        return NextResponse.json({
            success: true,
            data: users[userIndex],
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to update user' },
            { status: 500 }
        );
    }
}

// DELETE /api/users - Delete a user
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = Number(searchParams.get('id'));

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'User ID is required' },
                { status: 400 }
            );
        }

        const userIndex = users.findIndex((u) => u.id === id);

        if (userIndex === -1) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        const deletedUser = users.splice(userIndex, 1)[0];

        return NextResponse.json({
            success: true,
            data: deletedUser,
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to delete user' },
            { status: 500 }
        );
    }
}
