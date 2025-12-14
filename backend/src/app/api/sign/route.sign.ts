import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/src/lib/db.lib.js";

import User, { IUser } from "@/src/models/user.models.js";
import { 
    generateAccessToken, 
    generateRefreshToken, 
    verifyToken 
} from "@/src/lib/jwt.lib";



// auth
async function authenticateToken(user: IUser) {
    user.online = true;
    user.status = "active";
    await user.save();

    const access = generateAccessToken({ id: user.id, role: user.role });
    const refresh = generateRefreshToken({ id: user.id, role: user.role });

    return { user, token: { access, refresh } };
};

// POST /api/sign/signup
export async function signUp(req: NextRequest) {
    try {
        await connect();

        const body = await req.json();

        const existingUser = await User.findUser(body.email) || await User.findUser(body.username);
        if (existingUser) {
            return NextResponse.json({ error: "User with given email or username already exists" }, { status: 400 });
        }

        const newUser = new User(body);
        await newUser.save();
        const authData = await authenticateToken(newUser);

        return NextResponse.json(authData, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};

// POST /api/sign/login
export async function logIn(req: NextRequest) {
    try {
        await connect();

        const body = await req.json();

        const user = await User.findUser(body.identifier);
        if (!user) {
            return NextResponse.json({ error: "Invalid email/username or password" }, { status: 400 });
        }

        const isMatch = await user.comparePassword(body.password);
        if (!isMatch) {
            return NextResponse.json({ error: "Invalid email/username or password" }, { status: 400 });
        }

        const authData = await authenticateToken(user);

        return NextResponse.json(authData, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};

// POST /api/sign/logout
export async function logOut(req: NextRequest) {
    try {
        await connect();

        const body = await req.json();

        const user = await User.findUser(body.identifier);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        user.online = false;
        user.status = "inactive";
        await user.save();

        return NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};

// POST /api/sign/refresh
export async function refreshToken(req: NextRequest) {
    try {
        await connect();

        const body = await req.json();
        const refreshToken = body.refreshToken;

        if (!refreshToken) {
            return NextResponse.json({ error: "Refresh token is required" }, { status: 400 });
        }

        const payload: any = verifyToken(refreshToken);
        if (!payload) {
            return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
        }

        const user = await User.findUser(payload.id);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const access = generateAccessToken({ id: user.id, role: user.role });

        return NextResponse.json({ access }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};
