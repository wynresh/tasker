import { Controller, Get, Post, Body, Param, Delete, Put, Req } from '@nestjs/common';
import TaskService from './service.task';
import UserService from '../users/service.user';
import { Task, TaskDocument } from './schema.task';


@Controller('tasks')
export default class TaskController {
    constructor(
        private readonly taskService: TaskService,
        private readonly userService: UserService
    ) {}

    @Post()
    async create(
        @Body() taskData: Partial<Task>,
        @Req() req: any
    ): Promise<TaskDocument | null | { message: string }> {
        try {
            const userId = req.user.id;
            const createBy = await this.userService.get(userId);
            if (!createBy) throw new Error('admin not found');

            if (!taskData.assignedTo) throw new Error('assignedTo is required');
            const assignedTo = await this.userService.get(taskData.assignedTo as string);
            if (!assignedTo) throw new Error('assign not found');

            return await this.taskService.create(taskData);
        } catch (err) {
            return { message: err instanceof Error ? err.message : 'An error occurred' }
       }
    }

    @Post(':id')
    async assignTask(
        @Body() taskData: Partial<Task>,
        @Param('id') id: string,
    ): Promise<TaskDocument | null | { message: string }> {
        try {
            const assignedToId = taskData.assignedTo;
            if (!assignedToId) throw new Error('assignedTo is required');
            
            const assignedTo = await this.taskService.assignTask(id, assignedToId as string);
            return assignedTo;
        } catch (err) {
            return { message: err instanceof Error ? err.message : 'An error occurred' }
       }
    }

    @Get(':id')
    async get(@Param() id: string): Promise<TaskDocument | null | { message: string }> {
        try {
            const task = await this.taskService.get(id);
            return task;
        } catch (err) {
            return { message: err instanceof Error ? err.message : 'An error occurred' }
       }
    }

    @Get()
    async find(@Req() req: any): Promise<TaskDocument[] | { message: string}> {
        
    }
}
