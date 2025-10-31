"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const ipfs_http_client_1 = require("ipfs-http-client");
const ipfs = (0, ipfs_http_client_1.create)({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: `Basic ${Buffer.from(process.env.INFURA_PROJECT_ID + ':' + process.env.INFURA_PROJECT_SECRET).toString('base64')}`,
    },
});
async function GET(request, { params }) {
    try {
        const hash = params.hash;
        const chunks = [];
        for await (const chunk of ipfs.cat(hash)) {
            chunks.push(chunk);
        }
        const content = Buffer.concat(chunks);
        return new server_1.NextResponse(content, {
            headers: {
                'Content-Type': 'application/octet-stream',
            },
        });
    }
    catch (error) {
        console.error('Download failed:', error);
        return server_1.NextResponse.json({ error: 'Download failed' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map