import * as jwt from 'jsonwebtoken';

import { Request, Response } from 'express';

import Messages from 'src/utils/Messages';

export default class AuthenticationController {
  public verifyJWT(req: Request, res: Response, next) {
    const { authorization } = req.headers;

    if (!authorization) {
      return res.status(401).json({ message: Messages.HEADER_AUTHORIZATION_NOT_PRESENT });
    }

    const authorizationSplit = authorization.split(' ');
    const bearer = authorizationSplit[0];
    const token = authorizationSplit[1];

    if (bearer !== 'Bearer') {
      return res.status(401).json({ message: Messages.NO_BEARER_AUTHENTICATION_SCHEME });
    }

    if (!token) {
      return res.status(401).json({ message: Messages.NO_TOKEN_PROVIDED });
    }

    jwt.verify(token, process.env.SECRET, (err, decoded) => {
      if (err) {
        if (err.message === 'jwt malformed') {
          return res.status(401).json({ message: Messages.INVALID_TOKEN });
        }

        if (err.message === 'jwt expired') {
          return res.status(401).json({ message: Messages.TOKEN_EXPIRED });
        }

        return res.status(401).json({ message: err.message });
      }

      if (req.body instanceof Array) {
        req.body = { content: req.body, userId: decoded.id };
      } else {
        req.body.userId = decoded.id;
      }

      next();
    });
  }
}
