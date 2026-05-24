import * as jose from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-kanban-key-123456789-abcdefg";
const secretKey = new TextEncoder().encode(JWT_SECRET);

/**
 * Signs a payload inside a JWT token.
 */
export async function signJWT(payload: { userId: string; email: string; name?: string | null }): Promise<string> {
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

/**
 * Verifies a JWT token. Returns the payload or null if invalid.
 */
export async function verifyJWT(token: string) {
  try {
    const { payload } = await jose.jwtVerify(token, secretKey);
    return payload;
  } catch (error) {
    return null;
  }
}
