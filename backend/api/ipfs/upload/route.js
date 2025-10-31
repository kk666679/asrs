"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const client_1 = require("@prisma/client");
const ipfs_http_client_1 = require("ipfs-http-client");
const prisma = new client_1.PrismaClient();
const ipfs = (0, ipfs_http_client_1.create)({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: `Basic ${Buffer.from(process.env.INFURA_PROJECT_ID + ':' + process.env.INFURA_PROJECT_SECRET).toString('base64')}`,
    },
});
async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const metadata = JSON.parse(formData.get('metadata'));
        if (!file) {
            return server_1.NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        const result = await ipfs.add({
            path: file.name,
            content: buffer
        });
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
        return server_1.NextResponse.json({
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
    }
    catch (error) {
        console.error('Upload failed:', error);
        return server_1.NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map