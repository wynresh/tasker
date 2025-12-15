import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export interface TaskDocument extends Document {
    id: string;
    _id: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    status?: 'todo' | 'in-progress' | 'done';
    priority?: 'low' | 'medium' | 'high';
    assignedTo?: mongoose.Types.ObjectId | string;
    dueDate?: Date;
    createBy: mongoose.Types.ObjectId | string;
    createdAt?: Date;
    updatedAt?: Date;
}

@Schema({ timestamps: true })
export class Task {

    @Prop({ required: true })
    title!: string;

    @Prop()
    description?: string;

    @Prop({ enum: ['todo', 'in-progress', 'done'], default: 'todo' })
    status?: 'todo' | 'in-progress' | 'done';

    @Prop({ enum: ['low', 'medium', 'high'], default: 'medium' })
    priority?: 'low' | 'medium' | 'high';

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    assignedTo!: mongoose.Types.ObjectId | string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    createBy!: mongoose.Types.ObjectId | string;

    @Prop()
    dueDate?: Date;

    createdAt?: Date;
    updatedAt?: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

TaskSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

TaskSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete (ret as any)._id;
  },
});
