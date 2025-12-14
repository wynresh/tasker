import mongoose, { Schema, Types, model, models } from "mongoose";
import ids from "@/src/models/ids.models";
import pagination from "mongoose-paginate-v2";

// Task Interface
export interface ITask extends mongoose.Document {
    id: Types.ObjectId | string;
    title: string;
    description?: string;
    status?: "todo" | "in-progress" | "done";
    
    dueDate?: Date;
    // Reference to User
    assignedTo: mongoose.Types.ObjectId | string;
    createdBy?: Date;
    createdAt?: Date;
    updatedAt?: Date;
};

// Task Schema
const taskSchema = new Schema<ITask>(
    {
        title: { type: String, required: true },
        description: { type: String },
        status: { type: String, enum: ["todo", "in-progress", "done"], default: "todo" },
        dueDate: { type: Date },
        assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

// Plugins
taskSchema.plugin(pagination);
taskSchema.plugin(ids);

// Model
interface TaskModel <T extends ITask> extends mongoose.PaginateModel<T> {}

const Task = (models.Task as TaskModel<ITask>) ||
    model<ITask, TaskModel<ITask>>("Task", taskSchema);

export default Task;

