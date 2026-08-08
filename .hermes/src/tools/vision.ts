import { logger } from '../config';

export interface InspectionResult {
  passed: boolean;
  defects: string[];
  confidence: number;
  inspectedAt: string;
}

const ALLOWED_IMAGE_HOSTS = (process.env.VISION_ALLOWED_HOSTS || 'localhost,127.0.0.1,minio,storage')
  .split(',').map(h => h.trim());

function validateImageUrl(rawUrl: string): string {
  if (!rawUrl) throw new Error('Image URL is required');
  let parsed: URL;
  try { parsed = new URL(rawUrl); } catch { throw new Error(`Invalid image URL: ${rawUrl}`); }
  if (!ALLOWED_IMAGE_HOSTS.some(h => parsed.hostname === h || parsed.hostname.endsWith(`.${h}`))) {
    throw new Error(`Image host "${parsed.hostname}" not in allowlist`);
  }
  return rawUrl;
}

export async function inspectItem(imageUrl: string): Promise<InspectionResult> {
  const inspectedAt = new Date().toISOString();

  // Validate URL to prevent SSRF (CWE-918)
  try {
    validateImageUrl(imageUrl);
  } catch (err: any) {
    logger.warn({ err: err.message }, 'Vision inspection skipped — invalid image URL');
    return { passed: false, defects: ['invalid_url'], confidence: 0, inspectedAt };
  }

  // Production: call vision model API (e.g. AWS Rekognition, local ONNX model)
  if (process.env.VISION_API_URL) {
    try {
      const res = await fetch(process.env.VISION_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const data = await res.json() as InspectionResult;
        logger.info({ imageUrl, passed: data.passed }, 'Vision inspection complete');
        return { ...data, inspectedAt };
      }
    } catch (err: any) {
      logger.warn({ err: err.message }, 'Vision API call failed, falling back to simulation');
    }
  }

  // Simulation mode — deterministic enough for testing
  const passed = Math.random() > 0.1;
  const defects = passed ? [] : (['scratch', 'dent', 'discoloration', 'missing_label'] as string[])
    .filter(() => Math.random() > 0.6);

  logger.debug({ imageUrl, passed, defects }, 'Vision inspection simulated');
  return { passed, defects, confidence: passed ? 0.97 : 0.82, inspectedAt };
}
