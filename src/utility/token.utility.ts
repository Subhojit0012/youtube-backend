import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

export function encodeToken(userId: string) {
  // 1.
  const token: any = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET!,
    { expiresIn: "1D" },
    (error, token) => {
      if (error) {
        throw new Error("Error signing token");
      }
      return token;
    },
  );

  if (!token || token instanceof Error) {
    throw new Error("Error generating token");
  }

  return token;
}

export function decodeToken(token: string): JwtPayload | null {
  if (token === "") return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return typeof decoded === "object" ? decoded : null;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) return null;
    throw error;
  }
}
