import { sendSuccess, sendError } from '@/lib/responseHandler';

// Mock tasks database
let tasks = [
  { id: 1, title: 'Complete assignment', completed: false, userId: 1 },
  { id: 2, title: 'Review code', completed: true, userId: 2 },
  { id: 3, title: 'Write documentation', completed: false, userId: 1 },
];

// GET /api/tasks - Get all tasks
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    let filteredTasks = tasks;
    if (userId) {
      filteredTasks = tasks.filter((t) => t.userId === Number(userId));
    }

    return sendSuccess(filteredTasks, 'Tasks fetched successfully');
  } catch (error) {
    return sendError('Failed to fetch tasks', 'INTERNAL_ERROR', 500, error);
  }
}

// POST /api/tasks - Create a new task
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, userId } = body;

    if (!title) {
      return sendError('Missing required field: title', 'MISSING_FIELD', 400);
    }

    if (!userId) {
      return sendError('Missing required field: userId', 'MISSING_FIELD', 400);
    }

    const newTask = {
      id: tasks.length + 1,
      title,
      completed: false,
      userId,
    };

    tasks.push(newTask);

    return sendSuccess(newTask, 'Task created successfully', 201);
  } catch (error) {
    return sendError('Task creation failed', 'INTERNAL_ERROR', 500, error);
  }
}

// PUT /api/tasks - Update a task
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, title, completed } = body;

    if (!id) {
      return sendError('Task ID is required', 'MISSING_FIELD', 400);
    }

    const taskIndex = tasks.findIndex((t) => t.id === id);

    if (taskIndex === -1) {
      return sendError('Task not found', 'NOT_FOUND', 404);
    }

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...(title !== undefined && { title }),
      ...(completed !== undefined && { completed }),
    };

    return sendSuccess(tasks[taskIndex], 'Task updated successfully');
  } catch (error) {
    return sendError('Failed to update task', 'INTERNAL_ERROR', 500, error);
  }
}

// DELETE /api/tasks - Delete a task
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get('id'));

    if (!id) {
      return sendError('Task ID is required', 'MISSING_FIELD', 400);
    }

    const taskIndex = tasks.findIndex((t) => t.id === id);

    if (taskIndex === -1) {
      return sendError('Task not found', 'NOT_FOUND', 404);
    }

    const deletedTask = tasks.splice(taskIndex, 1)[0];

    return sendSuccess(deletedTask, 'Task deleted successfully');
  } catch (error) {
    return sendError('Failed to delete task', 'INTERNAL_ERROR', 500, error);
  }
}
