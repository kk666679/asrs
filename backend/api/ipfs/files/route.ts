import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const files = await prisma.iPFSFile.findMany({
      orderBy: {
        uploadedAt: 'desc'
      }
    });

    // Transform to match frontend interface
    const transformedFiles = files.map(file => ({
      id: file.id,
      name: file.name,
      hash: file.hash,
      size: file.size,
      type: file.type,
      uploadedAt: file.uploadedAt.toISOString(),
      status: file.status.toLowerCase() as 'pinned' | 'unpinned' | 'pending',
      halalCertified: file.halalCertified,
      blockchainTx: file.blockchainTx || undefined,
      certifyingBody: file.certifyingBody || undefined,
      description: file.description || undefined
    }));

    return NextResponse.json(transformedFiles);
  } catch (error) {
    console.error('Failed to fetch IPFS files:', error);
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  }
}
