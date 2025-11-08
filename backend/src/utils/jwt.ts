import jwt from 'jsonwebtoken';
import { config } from '../config/env';

interface TokenPayload {
  userId: string;
  email: string;
  roles: string[];
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtRefreshExpiresIn,
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwtSecret) as TokenPayload;
};

export const decodeToken = (token: string): TokenPayload | null => {
  const decoded = jwt.decode(token);
  return decoded as TokenPayload | null;
};
