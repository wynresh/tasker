import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/lib/db.lib.js";
import Message from "@/src/models/message.models";
import config from "@/config";

// filtered fields for message response
function filterMessage(query: any) {
    const q: any = {};

    if (query.sender) {
        q.sender = query.sender;
    }
    if (query.task) {
        q.task = query.task;
    }
    if (query.read) {
        q.read = query.read === "true";
    }

    return q;
}

// GET /api/messages
export async function GET(req: NextRequest,
    { params }: { params: { id?: string } }
) {
    try {
        await connect();

        const { id } = params;

        if (!id) {
            const query = filterMessage(Object.fromEntries(req.nextUrl.searchParams.entries()));

            const messages = await Message.paginate(
                query,
                { 
                    limit: req.nextUrl.searchParams.get("limit") ? parseInt(req.nextUrl.searchParams.get("limit") as string, 10) : config.Pagination.limit,
                    page: req.nextUrl.searchParams.get("page") ? parseInt(req.nextUrl.searchParams.get("page") as string, 10) : 1,
                }
            );
            return NextResponse.json(messages, { status: 200 });
        }

        const message = await Message.findById(id);

        if (!message) {
            return NextResponse.json({ error: "Message not found" }, { status: 404 });
        }

        return NextResponse.json(message, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};

// POST /api/messages
export async function POST(req: NextRequest) {
    try {
        await connect();

        const body = await req.json();

        const newMessage = new Message(body);
        await newMessage.save();

        return NextResponse.json({ message: "Message created successfully", chat: newMessage }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};

// DELETE /api/messages/:id
export async function DELETE(req: NextRequest,
    { params }: { params: { id: string } }) {
    try {
        await connect();

        const { id } = params;

        const message = await Message.findByIdAndDelete(id);

        if (!message) {
            return NextResponse.json({ error: "Message not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Message deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};
