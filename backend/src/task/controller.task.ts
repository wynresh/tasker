import { Controller, Get, Post, Body, Param, Delete, Put, Req, Query } from '@nestjs/common';
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
    async find(@Query() query: any): Promise<TaskDocument[] | { message: string}> {
        try {
            const { limit, page, ...filters } = query;

            const take = limit ? Number(limit) : 10;
            const currentPage = page ? Number(page) : 1;

            return await this.taskService.find(filters, take, currentPage);
        } catch (err) {
            return { message: err instanceof Error ? err.message : 'An error occurred' }
        }
    }

    @Get('count')
    async count(@Query() query: any): Promise<number | { message: string}> {
        try {
            return await this.taskService.count(query);
        } catch (err) {
            return { message: err instanceof Error ? err.message : 'An error occurred' }
        }
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updateData: Partial<Task>,
        @Req() req: any
    ): Promise<TaskDocument | null | { message: string }> {
        try {
            const user = await this.userService.get(req.user.id);
            if (!user) throw new Error('not foun user');

            const task = await this.taskService.get(id);
            if (!task) throw new Error('task not found');

            if (![task.createBy.toString(), task.assignedTo?.toString()].includes(user.id.toString())) {
                throw new Error('unauthorized!!!');
            }

            return await this.taskService.update(id, updateData);
        } catch (err) {
            return { message: err instanceof Error ? err.message : 'An error occurred' }
        }
    }

    @Delete(':id')
    async delete(@Param('id') id: string, @Req() req: any): Promise<TaskDocument | null | { message: string }> {
        try {
            const user = await this.userService.get(req.user.id);
            if (!user) throw new Error('not foun user');

            const task = await this.taskService.get(id);
            if (!task) throw new Error('task not found');

            if (![task.createBy.toString(), task.assignedTo?.toString()].includes(user.id.toString())) {
                throw new Error('unauthorized!!!');
            }

            return await this.taskService.delete(id);
        } catch (err) {
            return { message: err instanceof Error ? err.message : 'An error occurred' }
        }
    }
}
