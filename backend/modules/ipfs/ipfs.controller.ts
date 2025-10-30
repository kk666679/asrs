import { Controller, Get, Post, Param, Res, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { IpfsService } from './ipfs.service';

@Controller('ipfs')
export class IpfsController {
  constructor(private readonly ipfsService: IpfsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() metadata: any,
  ) {
    try {
      const result = await this.ipfsService.uploadFile(file, metadata);
      return {
        success: true,
        data: result,
        message: 'File uploaded successfully to IPFS'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to upload file'
      };
    }
  }

  @Get('files')
  async getFiles() {
    try {
      const files = await this.ipfsService.getFiles();
      return {
        success: true,
        data: files
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch files'
      };
    }
  }

  @Get('download/:hash')
  async downloadFile(@Param('hash') hash: string, @Res() res: Response) {
    try {
      const buffer = await this.ipfsService.downloadFile(hash);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${hash}.file"`);
      res.send(buffer);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to download file'
      });
    }
  }

  @Post('pin/:hash')
  async pinFile(@Param('hash') hash: string) {
    try {
      await this.ipfsService.pinFile(hash);
      return {
        success: true,
        message: 'File pinned successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to pin file'
      };
    }
  }

  @Post('unpin/:hash')
  async unpinFile(@Param('hash') hash: string) {
    try {
      await this.ipfsService.unpinFile(hash);
      return {
        success: true,
        message: 'File unpinned successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to unpin file'
      };
    }
  }
}
