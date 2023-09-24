import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
interface Ipayload {
  sub: string;
}
class AuthMiddleware {
  auth(request: Request, response: Response, next: NextFunction) {
    const autHeader = request.headers.authorization;
    if (!autHeader) {
      return response.status(400).json({
        code: 'token.missing',
        message: 'Token is missing'
      });
    }
    const [, token] = autHeader.split(' ')
    let secretKey: string | undefined = process.env.ACESS_KEY_TOKEN;

    if (!secretKey) {
      throw new Error("There is no token")
    }
    try {
      const { sub } = verify(token, secretKey) as Ipayload;
      request.user_id = sub;
      return next();
    } catch (error) {
      return response.status(401).json({
        code: 'token.expired',
        message: 'Token expired.'
      });
    }
  }
}

export { AuthMiddleware }