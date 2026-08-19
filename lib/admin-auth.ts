// Utilities for Admin Session Verification using Web Crypto API (Edge & Node compatible)

const SESSION_COOKIE_NAME = 'bloxylucy_admin_token';
const SECRET_KEY = process.env.ADMIN_SESSION_SECRET || 'bloxylucy_super_secret_admin_session_key_2026';

export async function createSessionToken(username: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: username,
    role: 'admin',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
  };

  const base64UrlEncode = (str: string) =>
    btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(SECRET_KEY),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(dataToSign)
  );

  const signatureArray = Array.from(new Uint8Array(signature));
  const signatureString = String.fromCharCode.apply(null, signatureArray);
  const encodedSignature = base64UrlEncode(signatureString);

  return `${dataToSign}.${encodedSignature}`;
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    if (!token) return false;
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const dataToVerify = `${encodedHeader}.${encodedPayload}`;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(SECRET_KEY),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Decode signature
    const base64UrlDecode = (str: string) => {
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }
      return atob(base64);
    };

    const signatureBytes = new Uint8Array(
      base64UrlDecode(encodedSignature)
        .split('')
        .map((c) => c.charCodeAt(0))
    );

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      encoder.encode(dataToVerify)
    );

    if (!isValid) return false;

    // Check expiration
    const payloadJson = JSON.parse(base64UrlDecode(encodedPayload));
    if (payloadJson.exp && payloadJson.exp < Math.floor(Date.now() / 1000)) {
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
}

export { SESSION_COOKIE_NAME };
