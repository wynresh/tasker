import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/lib/db.lib.js";

import Task from "@/src/models/task.models.js";
import config from "@/config";


// filtered fields for task response
function filterTask(query: any) {
    const q: any = {};

    if (query.title) {
        q.title = { $regex: query.title, $options: "i" };
    }
    if (query.status) {
        q.status = query.status;
    }
    if (query.assignedTo) {
        q.assignedTo = query.assignedTo;
    }

    return q;
}

// GET /api/tasks/:id
export async function GET(req: NextRequest,
    { params }: { params: { id?: string } }) {
    try {
        await connect();

        const { id } = params;

        if (!id) {
            const query = filterTask(Object.fromEntries(req.nextUrl.searchParams.entries()));

            const tasks = await Task.paginate(
                query,
                { 
                    limit: req.nextUrl.searchParams.get("limit") ? parseInt(req.nextUrl.searchParams.get("limit") as string, 10) : config.Pagination.limit,
                    page: req.nextUrl.searchParams.get("page") ? parseInt(req.nextUrl.searchParams.get("page") as string, 10) : 1,
                }
            );
            return NextResponse.json(tasks, { status: 200 });
        }

        const task = await Task.findById(id);

        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        return NextResponse.json(task, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};

// DELETE /api/tasks/:id
export async function DELETE(req: NextRequest,
    { params }: { params: { id: string } }) {
    try {
        await connect();

        const { id } = params;

        const task = await Task.findById(id);
        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        await Task.deleteOne({ id });

        return NextResponse.json({ message: "Task deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};

// Exporting PUT /api/tasks/:id for updating a task
export async function PUT(req: NextRequest,
    { params }: { params: { id: string } }) {
    try {
        await connect();

        const { id } = params;
        const data = await req.json();

        const task = await Task.findById(id);
        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        Object.assign(task, data);
        await task.save();

        return NextResponse.json({ message: "Task updated successfully", task }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};

// Exporting POST /api/tasks for creating a new task
export async function POST(req: NextRequest) {
    try {
        await connect();

        const data = await req.json();

        const newTask = new Task(data);
        await newTask.save();

        return NextResponse.json({ message: "Task created successfully", task: newTask }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};
