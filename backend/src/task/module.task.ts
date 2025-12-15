import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import TaskService from './service.task';
import TaskController from './controller.task';
import { Task, TaskSchema } from './schema.task';

import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
        ClientsModule.register([
            {
                name: 'TASKS_SERVICE',
                transport: Transport.RMQ,
                options: {
                    urls: ['amqp://localhost:5672'],
                    queue: 'tasks_queue',
                    queueOptions: { durable: true },
                },
            },
        ]),
    ],
    providers: [TaskService],
    controllers: [TaskController],
})
export default class TaskModule {}
