import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/lib/db.lib.js";

import User from "@/src/models/user.models.js";
import config from "@/config";


// filtered fields for user response
function filterUser(query: any) {
    const q: any = {};

    if (query.username) {
        q.username = { $regex: query.username, $options: "i" };
    }
    if (query.email) {
        q.email = { $regex: query.email, $options: "i" };
    }
    if (query.role) {
        q.role = query.role;
    }

    return q;
}

// GET /api/users/:id
export async function GET(req: NextRequest,
    { params }: { params: { id?: string } }) {
    try {
        await connect();

        const { id } = params;

        if (!id) {
            const query = filterUser(Object.fromEntries(req.nextUrl.searchParams.entries()));

            const users = await User.paginate(
                query,
                { 
                    select: "-password", 
                    limit: req.nextUrl.searchParams.get("limit") ? parseInt(req.nextUrl.searchParams.get("limit") as string, 10) : config.Pagination.limit,
                    page: req.nextUrl.searchParams.get("page") ? parseInt(req.nextUrl.searchParams.get("page") as string, 10) : 1,
                }
            );
            return NextResponse.json(users, { status: 200 });
        }

        const user = await User.findUser((req as any).user.role === "admin" ? id : (req as any).user.id);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};

// DELETE /api/users/:id
export async function DELETE(req: NextRequest,
    { params }: { params: { id: string } }) {
    try {
        await connect();

        const { id } = params;

        const user = await User.findUser(id);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        await User.deleteOne({ id: (req as any).user.role === "admin" ? id : (req as any).user.id });

        return NextResponse.json({ message: "User deleted successfully", user }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};

// PUT /api/users/:id
export async function PUT(req: NextRequest,
    { params }: { params: { id: string } }) {
    try {
        await connect();

        const { id } = params;
        const body = await req.json();

        const user = await User.findUser(id);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        Object.assign(user, body);
        await user.save();

        return NextResponse.json({ message: "User updated successfully", user }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};
