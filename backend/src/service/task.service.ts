import { Injectable } from '@nestjs/common';
import { ClientProxy, Client, Transport } from '@nestjs/microservices';

@Injectable()
export class TasksService {
    @Client({
        transport: Transport.RMQ,
        options: {
            urls: ['amqp://localhost:5672'],
            queue: 'tasks_queue',
            queueOptions: { durable: true }
        }
    })
    private client!: ClientProxy;

    async createTask(task: any) {
        // Logique pour créer la tâche (DB etc.)
        console.log('Task created:', task);

        // Publier l'événement
        this.client.emit('task.created', task);
    }

    async assignTask(taskId: number, userId: number) {
        const payload = { taskId, userId };
        console.log('Task assigned:', payload);
        this.client.emit('task.assigned', payload);
    }
}
