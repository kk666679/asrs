import { EventEmitter } from 'events';

export interface AgentMessage {
  id: string;
  from: string;
  to: string;
  type: 'request' | 'response' | 'notification';
  payload: any;
  timestamp: Date;
}

export interface AgentCapability {
  name: string;
  description: string;
  inputSchema: any;
  outputSchema: any;
}

export abstract class BaseAgent extends EventEmitter {
  protected id: string;
  protected name: string;
  protected capabilities: AgentCapability[] = [];
  protected isActive = false;
  protected orchestrator?: AgentOrchestrator;

  constructor(id: string, name: string) {
    super();
    this.id = id;
    this.name = name;
  }

  abstract initialize(): Promise<void>;
  abstract processMessage(message: AgentMessage): Promise<any>;
  abstract getStatus(): Record<string, any>;

  getId(): string { return this.id; }
  getName(): string { return this.name; }
  getCapabilities(): AgentCapability[] { return this.capabilities; }
  isAgentActive(): boolean { return this.isActive; }

  setOrchestrator(orchestrator: AgentOrchestrator) {
    this.orchestrator = orchestrator;
  }

  protected async sendMessage(to: string, type: AgentMessage['type'], payload: any): Promise<void> {
    if (!this.orchestrator) return;

    const message: AgentMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      from: this.id,
      to,
      type,
      payload,
      timestamp: new Date()
    };

    await this.orchestrator.routeMessage(message);
  }

  protected async broadcastMessage(type: AgentMessage['type'], payload: any): Promise<void> {
    if (!this.orchestrator) return;
    await this.orchestrator.broadcastMessage(this.id, type, payload);
  }

  async start(): Promise<void> {
    await this.initialize();
    this.isActive = true;
    this.emit('started');
  }

  async stop(): Promise<void> {
    this.isActive = false;
    this.emit('stopped');
  }
}

export class AgentOrchestrator extends EventEmitter {
  private agents: Map<string, BaseAgent> = new Map();
  private messageQueue: AgentMessage[] = [];
  private isProcessing = false;

  async registerAgent(agent: BaseAgent): Promise<void> {
    agent.setOrchestrator(this);
    this.agents.set(agent.getId(), agent);
    await agent.start();
    this.emit('agentRegistered', agent);
  }

  async unregisterAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (agent) {
      await agent.stop();
      this.agents.delete(agentId);
      this.emit('agentUnregistered', agentId);
    }
  }

  async routeMessage(message: AgentMessage): Promise<void> {
    this.messageQueue.push(message);
    if (!this.isProcessing) {
      await this.processMessageQueue();
    }
  }

  async broadcastMessage(fromId: string, type: AgentMessage['type'], payload: any): Promise<void> {
    for (const [agentId, agent] of this.agents) {
      if (agentId !== fromId && agent.isAgentActive()) {
        const message: AgentMessage = {
          id: `broadcast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          from: fromId,
          to: agentId,
          type,
          payload,
          timestamp: new Date()
        };
        await this.routeMessage(message);
      }
    }
  }

  private async processMessageQueue(): Promise<void> {
    this.isProcessing = true;

    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()!;
      const targetAgent = this.agents.get(message.to);

      if (targetAgent && targetAgent.isAgentActive()) {
        try {
          const response = await targetAgent.processMessage(message);
          
          if (response && message.type === 'request') {
            const responseMessage: AgentMessage = {
              id: `response-${message.id}`,
              from: message.to,
              to: message.from,
              type: 'response',
              payload: response,
              timestamp: new Date()
            };
            this.messageQueue.push(responseMessage);
          }
        } catch (error) {
          console.error(`Error processing message ${message.id}:`, error);
          this.emit('messageError', { message, error });
        }
      }
    }

    this.isProcessing = false;
  }

  async requestCapability(requesterAgentId: string, capability: string, parameters: any): Promise<any> {
    for (const [agentId, agent] of this.agents) {
      if (agentId !== requesterAgentId && agent.isAgentActive()) {
        const hasCapability = agent.getCapabilities().some(cap => cap.name === capability);
        if (hasCapability) {
          const message: AgentMessage = {
            id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            from: requesterAgentId,
            to: agentId,
            type: 'request',
            payload: { capability, parameters },
            timestamp: new Date()
          };

          return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Request timeout'));
            }, 30000);

            const responseHandler = (responseMessage: AgentMessage) => {
              if (responseMessage.id === `response-${message.id}`) {
                clearTimeout(timeout);
                resolve(responseMessage.payload);
              }
            };

            this.once('messageProcessed', responseHandler);
            this.routeMessage(message);
          });
        }
      }
    }

    throw new Error(`No agent found with capability: ${capability}`);
  }

  getAgentStatus(): Record<string, any> {
    const status: Record<string, any> = {};
    
    for (const [agentId, agent] of this.agents) {
      status[agentId] = {
        name: agent.getName(),
        active: agent.isAgentActive(),
        capabilities: agent.getCapabilities().map(cap => cap.name),
        status: agent.getStatus()
      };
    }

    return status;
  }

  getSystemMetrics(): Record<string, any> {
    return {
      totalAgents: this.agents.size,
      activeAgents: Array.from(this.agents.values()).filter(agent => agent.isAgentActive()).length,
      queueLength: this.messageQueue.length,
      isProcessing: this.isProcessing,
      totalCapabilities: Array.from(this.agents.values())
        .reduce((total, agent) => total + agent.getCapabilities().length, 0)
    };
  }

  async shutdown(): Promise<void> {
    for (const agent of this.agents.values()) {
      await agent.stop();
    }
    this.agents.clear();
    this.messageQueue = [];
    this.emit('shutdown');
  }
}