import mongoose, { Schema, Types, model, models } from "mongoose";
import pagination from "mongoose-paginate-v2";

import ids from "@/src/models/ids.models";

// Notification Interface
export interface INotification {
    id: Types.ObjectId | string;
    message: string;
    // Reference to User
    user: Types.ObjectId | string;
    // Read status
    read: boolean;

    type: "TaskOverdue" | "TaskAssigned";

    createdAt?: Date;
    updatedAt?: Date;
};

// Notification Schema
const notificationSchema = new Schema<INotification>(
    {
        message: { type: String, required: true },
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        read: { type: Boolean, default: false },
        type: { type: String, enum: ["TaskOverdue", "TaskAssigned"], required: true },
    },
    { timestamps: true }
);

// Plugins
notificationSchema.plugin(pagination);
notificationSchema.plugin(ids);

// Model
interface NotificationModel <T extends INotification> extends mongoose.PaginateModel<T> {
    // Add custom static methods here if needed in future
}

const Notification = (models.Notification as NotificationModel<INotification>) ||
    model<INotification, NotificationModel<INotification>>("Notification", notificationSchema);

export default Notification;
