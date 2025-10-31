import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { create } from 'ipfs-http-client';

const prisma = new PrismaClient();

// Initialize IPFS client (using Infura or local node)
const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: `Basic ${Buffer.from(process.env.INFURA_PROJECT_ID + ':' + process.env.INFURA_PROJECT_SECRET).toString('base64')}`,
  },
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const metadata = JSON.parse(formData.get('metadata') as string);

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to IPFS
    const result = await ipfs.add({
      path: file.name,
      content: buffer
    });

    // Save to database
    const ipfsFile = await prisma.iPFSFile.create({
      data: {
        name: metadata.name || file.name,
        hash: result.cid.toString(),
        size: buffer.length,
        type: file.type,
        status: 'PINNED',
        halalCertified: metadata.halalCertified || false,
        certifyingBody: metadata.certifyingBody || null,
        description: metadata.description || null,
      },
    });

    return NextResponse.json({
      success: true,
      file: {
        id: ipfsFile.id,
        name: ipfsFile.name,
        hash: ipfsFile.hash,
        size: ipfsFile.size,
        type: ipfsFile.type,
        uploadedAt: ipfsFile.uploadedAt.toISOString(),
        status: ipfsFile.status.toLowerCase(),
        halalCertified: ipfsFile.halalCertified,
        certifyingBody: ipfsFile.certifyingBody,
        description: ipfsFile.description,
      }
    });
  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
