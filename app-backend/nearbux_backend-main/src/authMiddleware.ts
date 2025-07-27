import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

// Optional: extend req to include `user`
interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const jwt_secret = process.env.user_secret;

    if (!jwt_secret) {
      return res.status(500).json({ message: "JWT secret not configured" });
    }

    const decoded = jwt.verify(token, jwt_secret);
    req.user = decoded; // Attach decoded user info to the request
    next(); // Continue to the next handler
  } catch (error) {
    console.error("AuthMiddleware error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
