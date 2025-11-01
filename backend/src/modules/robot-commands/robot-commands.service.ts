import { Injectable } from '@nestjs/common';

@Injectable()
export class RobotCommandsService {
  private commands = [
    {
      id: '1',
      robotId: '1',
      type: 'MOVE',
      status: 'COMPLETED',
      priority: 'MEDIUM',
      parameters: { destination: 'A-01-01' },
      createdAt: new Date().toISOString(),
      robot: { code: 'AMR-001', name: 'Storage Robot 1' }
    },
    {
      id: '2',
      robotId: '2',
      type: 'PICK',
      status: 'EXECUTING',
      priority: 'HIGH',
      parameters: { itemId: 'ITEM-001' },
      createdAt: new Date().toISOString(),
      robot: { code: 'AMR-002', name: 'Transport Robot 1' }
    }
  ];

  findAll(query?: any) {
    const page = parseInt(query?.page) || 1;
    const limit = parseInt(query?.limit) || 20;
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      commands: this.commands.slice(start, end),
      pagination: {
        page,
        limit,
        total: this.commands.length,
        pages: Math.ceil(this.commands.length / limit)
      }
    };
  }

  create(createDto: any) {
    const newCommand = {
      id: Date.now().toString(),
      ...createDto,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    this.commands.push(newCommand);
    return newCommand;
  }

  update(id: string, updateDto: any) {
    const index = this.commands.findIndex(cmd => cmd.id === id);
    if (index !== -1) {
      this.commands[index] = { ...this.commands[index], ...updateDto };
      return this.commands[index];
    }
    return null;
  }

  remove(id: string) {
    const index = this.commands.findIndex(cmd => cmd.id === id);
    if (index !== -1) {
      return this.commands.splice(index, 1)[0];
    }
    return null;
  }
}