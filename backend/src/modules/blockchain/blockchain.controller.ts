import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import type { BlockchainTransaction, SmartContract, NetworkStats } from './blockchain.service';

@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Post('transactions')
  async createTransaction(@Body() body: {
    type: string;
    entityId: string;
    entityType: string;
    halalCertified?: boolean;
    certifyingBody?: string;
    ipfsHash?: string;
  }) {
    try {
      const transaction = await this.blockchainService.createTransaction(
        body.type,
        body.entityId,
        body.entityType,
        body.halalCertified,
        body.certifyingBody,
        body.ipfsHash
      );
      return {
        success: true,
        data: transaction,
        message: 'Blockchain transaction created successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to create blockchain transaction'
      };
    }
  }

  @Get('transactions')
  async getTransactions() {
    try {
      const transactions = await this.blockchainService.getTransactions();
      return {
        success: true,
        data: transactions
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch blockchain transactions'
      };
    }
  }

  @Get('transactions/:hash')
  async getTransaction(@Param('hash') hash: string) {
    try {
      const transaction = await this.blockchainService.getTransaction(hash);
      if (transaction) {
        return {
          success: true,
          data: transaction
        };
      } else {
        return {
          success: false,
          message: 'Transaction not found'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch blockchain transaction'
      };
    }
  }

  @Post('transactions/:hash/confirm')
  async confirmTransaction(@Param('hash') hash: string) {
    try {
      await this.blockchainService.confirmTransaction(hash);
      return {
        success: true,
        message: 'Transaction confirmed successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to confirm transaction'
      };
    }
  }

  @Get('contracts')
  async getSmartContracts() {
    try {
      const contracts = await this.blockchainService.getSmartContracts();
      return {
        success: true,
        data: contracts
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch smart contracts'
      };
    }
  }

  @Post('contracts')
  async deployContract(@Body() body: {
    name: string;
    abi: any;
    bytecode: string;
  }) {
    try {
      const contract = await this.blockchainService.deployContract(
        body.name,
        body.abi,
        body.bytecode
      );
      return {
        success: true,
        data: contract,
        message: 'Smart contract deployed successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to deploy smart contract'
      };
    }
  }

  @Get('stats')
  async getNetworkStats() {
    try {
      const stats = await this.blockchainService.getNetworkStats();
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch network statistics'
      };
    }
  }

  @Post('fetch-external-data')
  async fetchExternalData(@Body() body: { apiUrl?: string }) {
    try {
      const transaction = await this.blockchainService.fetchAndStoreExternalData(body.apiUrl);
      return {
        success: true,
        data: transaction,
        message: 'External data fetched and stored in blockchain successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch and store external data'
      };
    }
  }
}
