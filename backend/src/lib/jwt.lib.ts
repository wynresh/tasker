import jsonwebtoken from 'jsonwebtoken';
import config from '@/config';


const generateToken = (
    payload: object, 
    expiresIn: any ): string => {
  return jsonwebtoken.sign(
    payload, 
    config.JWT.secretKey, 
    { expiresIn }
  );
};

export const generateAccessToken = (payload: object): string => {
  return generateToken(payload, config.JWT.expiresIn );
};

export const generateRefreshToken = (payload: object): string => {
  return generateToken(payload, config.JWT.refreshExpiresIn );
};

export const verifyToken = (token: string): object | string => {
  return jsonwebtoken.verify(token, config.JWT.secretKey );
};

export const decodeToken = (token: string): string | object | null => {
  return jsonwebtoken.decode(token);
};
