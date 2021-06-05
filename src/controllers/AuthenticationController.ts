import { Request, Response } from 'express';

const jwt = require('jsonwebtoken');

export default class AuthenticationController {
  public verifyJWT(req: Request, res: Response, next) {
    const { authorization } = req.headers;

    if (!authorization) {
      return res.status(401).json({ message: 'Header Authorization not present!' });
    }

    const authorizationSplit = authorization.split(' ');
    const bearer = authorizationSplit[0];
    const token = authorizationSplit[1];

    if (bearer !== 'Bearer') {
      return res.status(401).json({ message: 'No Bearer HTTP authentication scheme!' });
    }

    if (!token) {
      return res.status(401).json({ message: 'No token provided!' });
    }

    jwt.verify(token, process.env.SECRET, (err, decoded) => {
      if (err) {
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
