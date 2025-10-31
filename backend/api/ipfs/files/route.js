"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function GET() {
    try {
        const files = await prisma.iPFSFile.findMany({
            orderBy: {
                uploadedAt: 'desc'
            }
        });
        const transformedFiles = files.map(file => ({
            id: file.id,
            name: file.name,
            hash: file.hash,
            size: file.size,
            type: file.type,
            uploadedAt: file.uploadedAt.toISOString(),
            status: file.status.toLowerCase(),
            halalCertified: file.halalCertified,
            blockchainTx: file.blockchainTx || undefined,
            certifyingBody: file.certifyingBody || undefined,
            description: file.description || undefined
        }));
        return server_1.NextResponse.json(transformedFiles);
    }
    catch (error) {
        console.error('Failed to fetch IPFS files:', error);
        return server_1.NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map