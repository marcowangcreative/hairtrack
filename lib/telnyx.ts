import { createPublicKey, verify } from 'node:crypto';

const MAX_TIMESTAMP_AGE_SEC = 300;

/**
 * Verify a Telnyx ed25519 webhook signature.
 *
 * Telnyx signs `${timestamp}|${rawBody}` with their private key, and the
 * portal exposes a base64-encoded ed25519 public key. Set it as
 * TELNYX_PUBLIC_KEY.
 *
 * Returns { ok: true } when the signature is valid, or { ok: false, reason }
 * when it fails. If TELNYX_PUBLIC_KEY is unset, we log a warning and allow
 * the request through so local dev stays usable — but production should
 * always have it configured.
 */
export function verifyTelnyxSignature({
  rawBody,
  signature,
  timestamp,
}: {
  rawBody: string;
  signature: string | null | undefined;
  timestamp: string | null | undefined;
}): { ok: true; devMode: boolean } | { ok: false; reason: string } {
  const publicKeyB64 = process.env.TELNYX_PUBLIC_KEY;
  if (!publicKeyB64) {
    console.warn(
      '[telnyx] TELNYX_PUBLIC_KEY is not set — accepting webhook without signature check (dev only).'
    );
    return { ok: true, devMode: true };
  }

  if (!signature || !timestamp) {
    return { ok: false, reason: 'missing signature or timestamp header' };
  }

  const tsNum = Number(timestamp);
  if (!Number.isFinite(tsNum)) {
    return { ok: false, reason: 'invalid timestamp' };
  }
  const ageSec = Math.abs(Date.now() / 1000 - tsNum);
  if (ageSec > MAX_TIMESTAMP_AGE_SEC) {
    return { ok: false, reason: 'timestamp out of range' };
  }

  try {
    const keyDer = Buffer.concat([
      Buffer.from('302a300506032b6570032100', 'hex'),
      Buffer.from(publicKeyB64, 'base64'),
    ]);
    const publicKey = createPublicKey({
      key: keyDer,
      format: 'der',
      type: 'spki',
    });
    const signed = Buffer.from(`${timestamp}|${rawBody}`, 'utf8');
    const sig = Buffer.from(signature, 'base64');
    const valid = verify(null, signed, publicKey, sig);
    return valid
      ? { ok: true, devMode: false }
      : { ok: false, reason: 'bad signature' };
  } catch (e) {
    return {
      ok: false,
      reason:
        'verification error: ' + (e instanceof Error ? e.message : 'unknown'),
    };
  }
}
