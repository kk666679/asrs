import { NextRequest, NextResponse } from 'next/server';
import { create } from 'ipfs-http-client';

const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: `Basic ${Buffer.from(process.env.INFURA_PROJECT_ID + ':' + process.env.INFURA_PROJECT_SECRET).toString('base64')}`,
  },
});

export async function GET(
  request: NextRequest,
  { params }: { params: { hash: string } }
) {
  try {
    const hash = params.hash;

    // Get file content from IPFS
    const chunks = [];
    for await (const chunk of ipfs.cat(hash)) {
      chunks.push(chunk);
    }

    const content = Buffer.concat(chunks);

    // Return file content
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    });
  } catch (error) {
    console.error('Download failed:', error);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}
