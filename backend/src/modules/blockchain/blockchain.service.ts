import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../../prisma.service';
import Web3 from 'web3';
import { firstValueFrom } from 'rxjs';

export interface BlockchainTransaction {
  id: string;
  hash: string;
  type: 'halal_certification' | 'document_upload' | 'compliance_audit' | 'supply_chain_update';
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber: number;
  gasUsed: number;
  timestamp: Date;
  entityId: string;
  entityType: string;
  halalCertified: boolean;
  certifyingBody?: string;
  ipfsHash?: string;
}

export interface SmartContract {
  id: string;
  address: string;
  name: string;
  version: string;
  abi: any;
  bytecode?: string;
  deployedAt?: Date;
  lastInteraction: Date;
  functions: string[];
  status: string;
}

export interface NetworkStats {
  blockHeight: number;
  activePeers: number;
  totalTransactions: number;
  gasPrice?: number;
  networkLatency?: number;
  consensusStatus: string;
}

@Injectable()
export class BlockchainService {
  private web3: any;
  private contracts: Map<string, any> = new Map();

  constructor(private prisma: PrismaService, private httpService: HttpService) {
    // Initialize Web3 connection (HyperLedger Fabric or Ethereum)
    try {
      this.web3 = new Web3(process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545');
    } catch (error) {
      console.warn('Blockchain connection not available, using mock implementation');
      this.web3 = null;
    }
  }

  async createTransaction(
    type: string,
    entityId: string,
    entityType: string,
    halalCertified: boolean = false,
    certifyingBody?: string,
    ipfsHash?: string
  ): Promise<BlockchainTransaction> {
    try {
      // Generate transaction hash (mock for development)
      const txHash = `0x${Math.random().toString(16).substring(2, 66)}`;

      // Create transaction record
      const transaction = await this.prisma.blockchainTransaction.create({
        data: {
          hash: txHash,
          type: type as any,
          status: 'PENDING',
          entityId,
          entityType,
          halalCertified,
          certifyingBody,
          ipfsHash,
        }
      });

      // Simulate blockchain submission
      if (this.web3) {
        // Submit to actual blockchain network
        // This would involve calling smart contract methods
      } else {
        // Mock confirmation for development
        setTimeout(async () => {
          await this.confirmTransaction(txHash);
        }, 2000);
      }

      return this.mapToBlockchainTransaction(transaction);
    } catch (error) {
      console.error('Blockchain transaction creation error:', error);
      throw new Error('Failed to create blockchain transaction');
    }
  }

  async getTransactions(): Promise<BlockchainTransaction[]> {
    try {
      const transactions = await this.prisma.blockchainTransaction.findMany({
        orderBy: { timestamp: 'desc' }
      });

      return transactions.map(tx => this.mapToBlockchainTransaction(tx));
    } catch (error) {
      console.error('Error fetching blockchain transactions:', error);
      throw new Error('Failed to fetch blockchain transactions');
    }
  }

  async getTransaction(hash: string): Promise<BlockchainTransaction | null> {
    try {
      const transaction = await this.prisma.blockchainTransaction.findUnique({
        where: { hash }
      });

      return transaction ? this.mapToBlockchainTransaction(transaction) : null;
    } catch (error) {
      console.error('Error fetching blockchain transaction:', error);
      throw new Error('Failed to fetch blockchain transaction');
    }
  }

  async confirmTransaction(hash: string): Promise<void> {
    try {
      await this.prisma.blockchainTransaction.update({
        where: { hash },
        data: {
          status: 'CONFIRMED',
          blockNumber: Math.floor(Math.random() * 1000000), // Mock block number
          gasUsed: Math.floor(Math.random() * 100000) // Mock gas used
        }
      });
    } catch (error) {
      console.error('Error confirming blockchain transaction:', error);
      throw new Error('Failed to confirm blockchain transaction');
    }
  }

  async getSmartContracts(): Promise<SmartContract[]> {
    try {
      const contracts = await this.prisma.smartContract.findMany({
        orderBy: { lastInteraction: 'desc' }
      });

      return contracts.map(contract => this.mapToSmartContract(contract));
    } catch (error) {
      console.error('Error fetching smart contracts:', error);
      throw new Error('Failed to fetch smart contracts');
    }
  }

  async deployContract(name: string, abi: any, bytecode: string): Promise<SmartContract> {
    try {
      let contractAddress = '';

      if (this.web3) {
        // Deploy contract to blockchain
        const contract = new this.web3.eth.Contract(abi);
        const deployTx = contract.deploy({ data: bytecode });
        // This would require actual deployment logic with gas, signer, etc.
        contractAddress = `0x${Math.random().toString(16).substring(2, 42)}`; // Mock address
      } else {
        // Mock deployment for development
        contractAddress = `0x${Math.random().toString(16).substring(2, 42)}`;
      }

      const smartContract = await this.prisma.smartContract.create({
        data: {
          address: contractAddress,
          name,
          version: '1.0.0',
          abi,
          bytecode,
          deployedAt: new Date(),
          lastInteraction: new Date(),
          functions: abi.filter((item: any) => item.type === 'function').map((item: any) => item.name),
          status: 'active'
        }
      });

      return this.mapToSmartContract(smartContract);
    } catch (error) {
      console.error('Smart contract deployment error:', error);
      throw new Error('Failed to deploy smart contract');
    }
  }

  async getNetworkStats(): Promise<NetworkStats> {
    try {
      let stats: NetworkStats;

      if (this.web3) {
        // Get real network statistics
        const blockNumber = await this.web3.eth.getBlockNumber();
        const gasPrice = await this.web3.eth.getGasPrice();

        stats = {
          blockHeight: Number(blockNumber),
          activePeers: 5, // Mock peer count
          totalTransactions: await this.prisma.blockchainTransaction.count(),
          gasPrice: Number(gasPrice),
          networkLatency: 50, // Mock latency
          consensusStatus: 'healthy'
        };
      } else {
        // Mock network statistics
        stats = {
          blockHeight: 1234567,
          activePeers: 8,
          totalTransactions: await this.prisma.blockchainTransaction.count(),
          gasPrice: 20000000000,
          networkLatency: 45,
          consensusStatus: 'healthy'
        };
      }

      // Store network stats
      await this.prisma.blockchainNetworkStats.create({
        data: {
          blockHeight: stats.blockHeight,
          activePeers: stats.activePeers,
          totalTransactions: stats.totalTransactions,
          gasPrice: stats.gasPrice,
          networkLatency: stats.networkLatency,
          consensusStatus: stats.consensusStatus
        }
      });

      return stats;
    } catch (error) {
      console.error('Error fetching network stats:', error);
      throw new Error('Failed to fetch network statistics');
    }
  }

  async fetchAndStoreExternalData(apiUrl?: string): Promise<BlockchainTransaction> {
    try {
      // Default API URL if not provided
      const url = apiUrl || 'https://api.example.com/halal-data';

      // Fetch data from external API
      const response = await firstValueFrom(this.httpService.get(url));
      const externalData = response.data;

      // Validate response structure (assuming JSON with entityId, halalCertified, etc.)
      if (!externalData.entityId || typeof externalData.halalCertified !== 'boolean') {
        throw new Error('Invalid external API response structure');
      }

      // Create blockchain transaction with fetched data
      const transaction = await this.createTransaction(
        'halal_certification', // type
        externalData.entityId,
        externalData.entityType || 'product', // default to product if not specified
        externalData.halalCertified,
        externalData.certifyingBody,
        externalData.ipfsHash
      );

      return transaction;
    } catch (error) {
      console.error('Error fetching and storing external data:', error);
      throw new Error('Failed to fetch and store external API data');
    }
  }

  private mapToBlockchainTransaction(dbTx: any): BlockchainTransaction {
    return {
      id: dbTx.id,
      hash: dbTx.hash,
      type: dbTx.type.toLowerCase().replace('_', '_'),
      status: dbTx.status.toLowerCase(),
      blockNumber: dbTx.blockNumber || 0,
      gasUsed: dbTx.gasUsed || 0,
      timestamp: dbTx.timestamp,
      entityId: dbTx.entityId,
      entityType: dbTx.entityType,
      halalCertified: dbTx.halalCertified,
      certifyingBody: dbTx.certifyingBody,
      ipfsHash: dbTx.ipfsHash,
    };
  }

  private mapToSmartContract(dbContract: any): SmartContract {
    return {
      id: dbContract.id,
      address: dbContract.address,
      name: dbContract.name,
      version: dbContract.version,
      abi: dbContract.abi,
      bytecode: dbContract.bytecode,
      deployedAt: dbContract.deployedAt,
      lastInteraction: dbContract.lastInteraction,
      functions: Array.isArray(dbContract.functions) ? dbContract.functions : [],
      status: dbContract.status,
    };
  }
}
