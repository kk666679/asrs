import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { create } from 'ipfs-http-client';

export interface IPFSFile {
  id: string;
  name: string;
  hash: string;
  size: number;
  type?: string;
  uploadedAt: Date;
  isEncrypted: boolean;
  tags: string[];
}

@Injectable()
export class IpfsService {
  private ipfs: any;

  constructor(private prisma: PrismaService) {
    // Initialize IPFS client (using local node or Infura)
    try {
      this.ipfs = create({
        host: process.env.IPFS_HOST || 'localhost',
        port: parseInt(process.env.IPFS_PORT || '5001'),
        protocol: process.env.IPFS_PROTOCOL || 'http'
      });
    } catch (error) {
      console.warn('IPFS client not available, using mock implementation');
      this.ipfs = null;
    }
  }

  async uploadFile(file: Express.Multer.File, metadata: any): Promise<IPFSFile> {
    try {
      let ipfsHash = '';

      if (this.ipfs) {
        // Upload to IPFS
        const result = await this.ipfs.add({
          path: file.originalname,
          content: file.buffer
        });
        ipfsHash = result.cid.toString();

        // Pin the file
        await this.ipfs.pin.add(ipfsHash);
      } else {
        // Mock IPFS hash for development
        ipfsHash = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      }

      // Store file metadata in database
      const ipfsFile = await this.prisma.iPFSFile.create({
        data: {
          name: metadata.name || file.originalname,
          hash: ipfsHash,
          ipfsHash: ipfsHash,
          size: file.size,
          type: file.mimetype,
          uploadedAt: metadata.uploadedAt,
        }
      });

      return this.mapToIPFSFile(ipfsFile);
    } catch (error) {
      console.error('IPFS upload error:', error);
      throw new Error('Failed to upload file to IPFS');
    }
  }

  async getFiles(): Promise<IPFSFile[]> {
    try {
      const files = await this.prisma.iPFSFile.findMany({
        orderBy: { uploadedAt: 'desc' }
      });

      return files.map(file => this.mapToIPFSFile(file));
    } catch (error) {
      console.error('Error fetching IPFS files:', error);
      throw new Error('Failed to fetch IPFS files');
    }
  }

  async downloadFile(hash: string): Promise<Buffer> {
    try {
      if (this.ipfs) {
        const chunks: Uint8Array[] = [];
        for await (const chunk of this.ipfs.cat(hash)) {
          chunks.push(chunk);
        }
        return Buffer.concat(chunks);
      } else {
        // Mock download for development
        throw new Error('IPFS client not available');
      }
    } catch (error) {
      console.error('IPFS download error:', error);
      throw new Error('Failed to download file from IPFS');
    }
  }

  async pinFile(hash: string): Promise<void> {
    try {
      if (this.ipfs) {
        await this.ipfs.pin.add(hash);
      }

      // Note: Since the schema doesn't have status field, we can remove this update
      // await this.prisma.iPFSFile.updateMany({
      //   where: { hash: hash },
      //   data: { status: 'pinned' }
      // });
    } catch (error) {
      console.error('IPFS pin error:', error);
      throw new Error('Failed to pin file');
    }
  }

  async unpinFile(hash: string): Promise<void> {
    try {
      if (this.ipfs) {
        await this.ipfs.pin.rm(hash);
      }

      // Note: Since the schema doesn't have status field, we can remove this update
      // await this.prisma.iPFSFile.updateMany({
      //   where: { hash: hash },
      //   data: { status: 'unpinned' }
      // });
    } catch (error) {
      console.error('IPFS unpin error:', error);
      throw new Error('Failed to unpin file');
    }
  }

  private mapToIPFSFile(dbFile: any): IPFSFile {
    return {
      id: dbFile.id,
      name: dbFile.name,
      hash: dbFile.hash,
      size: dbFile.size,
      type: dbFile.type,
      uploadedAt: dbFile.uploadedAt,
      isEncrypted: dbFile.isEncrypted,
      tags: dbFile.tags,
    };
  }
}
