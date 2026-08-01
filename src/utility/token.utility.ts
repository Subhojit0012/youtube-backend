import jwt from "jsonwebtoken";

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

export function decodeToken(token: string) {
  if (token === "") {
    throw new Error("No token provided");
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET!);
  return decoded ? decoded : null;
}
