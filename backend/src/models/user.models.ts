import mongoose, { Schema, Types, model, models } from "mongoose";
import bcrypt from "bcryptjs";
import pagination from "mongoose-paginate-v2";

import ids from "@/src/models/ids.models";


// User Interface
export interface IUser extends mongoose.Document {
    id: Types.ObjectId | string;
    username: string;
    email: string;
    password: string;
    role?: "user" | "admin";
    online?: boolean;
    status?: "active" | "inactive" | "banned";

    createdAt?: Date;
    updatedAt?: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
};

// User Schema
const userSchema = new Schema<IUser>(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["user", "admin"], default: "user" },
        online: { type: Boolean, default: false },
        status: { type: String, enum: ["active", "inactive", "banned"], default: "active" },
    },
    { timestamps: true }
);

// Middleware
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Methods
userSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.statics.findUser = async function (
    identifier: string
): Promise<IUser | null> {
    return this.findOne({
        $or: [
            { email: identifier }, 
            { username: identifier },
            { id: identifier }
        ],
    });
};

userSchema.statics.findAdmin = async function (
    identifier: string
): Promise<IUser | null> {
    return this.findOne({
        $and: [
            { role: "admin" },
            { $or: [{ email: identifier }, { username: identifier }] },
        ],
    });
};

// Plugins
userSchema.plugin(pagination);
userSchema.plugin(ids);

// Model
interface UserModel <T extends IUser> extends mongoose.PaginateModel<T> {
    findUser(identifier: string): Promise<IUser | null>;
    findAdmin(identifier: string): Promise<IUser | null>;
}

const User = (models.User as UserModel<IUser>) ||
    model<IUser, UserModel<IUser>>("User", userSchema);

export default User;
