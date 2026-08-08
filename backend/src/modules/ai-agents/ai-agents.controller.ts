import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { AiAgentsService } from './ai-agents.service';

@Controller('api/ai-agents')
export class AiAgentsController {
  constructor(private readonly aiAgentsService: AiAgentsService) {}

  @Get()
  getAgents() {
    return this.aiAgentsService.getAgents();
  }

  @Get('orchestrator')
  getOrchestrator() {
    return this.aiAgentsService.getOrchestrator();
  }

  @Get('tasks')
  getTasks(@Query() query?: any) {
    return this.aiAgentsService.getTasks(query);
  }

  @Post('tasks')
  createTask(@Body() taskData: any) {
    return this.aiAgentsService.createTask(taskData);
  }

  @Get('predictions')
  getPredictions(@Query() query?: any) {
    return this.aiAgentsService.getPredictions(query);
  }

  @Post('optimize')
  optimize(@Body() data: any) {
    return this.aiAgentsService.optimize(data);
  }

  @Get('agents/:id/status')
  getAgentStatus(@Param('id') id: string) {
    return this.aiAgentsService.getAgentStatus(id);
  }
}