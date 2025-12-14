import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/lib/db.lib.js";
import Notification from "@/src/models/notification.models.js";
import config from "@/config";

// filtered fields for notification response
function filterNotification(query: any) {
    const q: any = {};

    if (query.user) {
        q.user = query.user;
    }
    if (query.read) {
        q.read = query.read === "true";
    }
    if (query.type) {
        q.type = query.type;
    }

    return q;
}

// GET /api/notifications
export async function GET(req: NextRequest,
    { params }: { params: { id?: string } }
) {
    try {
        await connect();

        const { id } = params;

        if (!id) {
            const query = filterNotification(Object.fromEntries(req.nextUrl.searchParams.entries()));

            const notifications = await Notification.paginate(
                query,
                { 
                    limit: req.nextUrl.searchParams.get("limit") ? parseInt(req.nextUrl.searchParams.get("limit") as string, 10) : config.Pagination.limit,
                    page: req.nextUrl.searchParams.get("page") ? parseInt(req.nextUrl.searchParams.get("page") as string, 10) : 1,
                }
            );
            return NextResponse.json(notifications, { status: 200 });
        }

        const notification = await Notification.findById(id);

        if (!notification) {
            return NextResponse.json({ error: "Notification not found" }, { status: 404 });
        }

        return NextResponse.json(notification, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};

// POST /api/notifications
export async function POST(req: NextRequest) {
    try {
        await connect();

        const body = await req.json();

        const notification = new Notification(body);
        await notification.save();

        return NextResponse.json({ message: "Notification created successfully", notification }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};

// DELETE /api/notifications/:id
export async function DELETE(req: NextRequest,
    { params }: { params: { id: string } }) {
    try {
        await connect();

        const { id } = params;

        const notification = await Notification.findByIdAndDelete(id);

        if (!notification) {
            return NextResponse.json({ error: "Notification not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Notification deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};