import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../lib/jwt.lib";



export async function authMiddleware(req: NextRequest, res: NextResponse, next: Function) {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = verifyToken(token);
        (req as any).user = decoded;
        await next();
    } catch (error) {
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
};

export function adminMiddleware(req: NextRequest, res: NextResponse, next: Function) {
    const user = (req as any).user;
    if (user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return next();
};
