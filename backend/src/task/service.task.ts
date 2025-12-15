import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument } from './schema.task';
import { ClientProxy } from '@nestjs/microservices';

import config from '@/config';

@Injectable()
export default class TaskService {
    constructor(
        @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
        @Inject('TASKS_SERVICE') private client: ClientProxy,
    ) {}

    async create(taskData: Partial<Task>): Promise<TaskDocument | null> {
        const createdTask = new this.taskModel(taskData);
        const saved = await createdTask.save();
        this.client.emit('task.created', saved);
        return saved;
    }

    async assignTask(taskId: string, userId: string): Promise<TaskDocument | null> {
        const task = await this.taskModel.findByIdAndUpdate(
            taskId,
            { assignedTo: userId },
            { new: true },
        );
        this.client.emit('task.assigned', task);
        return task;
    }

    async get(id: string): Promise<TaskDocument | null> {
        const task = await this.taskModel.findById(id).exec();
        this.client.emit('task.get', task);
        return task
    }

    async find(query: any, limit: string | number, page: string | number = 1): Promise<TaskDocument[]> {
        const tasks = await this.taskModel
            .find(query)
            .limit(Number(limit || config.Pagination.limit))
            .skip((Number(page) - 1) * Number(limit))
            .exec();
        
        this.client.emit('task.find', tasks);
        return tasks;
    }

    async update(id: string, updateData: Partial<Task>): Promise<TaskDocument | null> {
        const task = this.taskModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .exec();

        this.client.emit('task.update', task);
        return task;
    }

    async delete(id: string): Promise<TaskDocument | null> {
        const task = await this.taskModel.findByIdAndDelete(id).exec();
        this.client.emit('task.delete', task);
        return task;
    }

    async count(query: any): Promise<number> {
        return this.taskModel.countDocuments(query).exec();
    }
}
