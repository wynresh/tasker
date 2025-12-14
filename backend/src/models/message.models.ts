import mongoose, { Schema, Types, model, models } from "mongoose";
import pagination from "mongoose-paginate-v2";

import ids from "@/src/models/ids.models";

// Message Interface
export interface IMessage {
    id: Types.ObjectId | string;
    content: string;
    // Reference to User
    sender: Types.ObjectId | string;
    // Reference to Task
    task: Types.ObjectId | string;
    // Read status
    read: boolean;

    createdAt?: Date;
    updatedAt?: Date;
};

// Message Schema
const messageSchema = new Schema<IMessage>(
    {
        content: { type: String, required: true },
        sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
        task: { type: Schema.Types.ObjectId, ref: "Task", required: true },
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Plugins
messageSchema.plugin(pagination);
messageSchema.plugin(ids);

// Model
interface MessageModel <T extends IMessage> extends mongoose.PaginateModel<T> {}

const Message = (models.Message as MessageModel<IMessage>) ||
    model<IMessage, MessageModel<IMessage>>("Message", messageSchema);

export default Message;
