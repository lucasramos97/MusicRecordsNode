import { Request, Response } from 'express';

import User from 'src/models/User';
import UserService from 'src/services/UserService';

import { IAuthenticable } from 'src/interfaces/IAuthenticable';
import { ILogin } from 'src/interfaces/ILogin';
import { IUserJson } from 'src/interfaces/IUserJson';

const userService = new UserService();

export default class UserController {
  public async save(req: Request, res: Response): Promise<Response<User>> {
    const user: IUserJson = req.body;

    try {
      const result = await userService.save(user);

      return res.status(201).json(result);
    } catch (error) {
      return res.status(error.code).json({ message: error.message });
    }
  }

  public async login(req: Request, res: Response): Promise<Response<IAuthenticable>> {
    const user: ILogin = req.body;

    try {
      const result = await userService.login(user);

      return res.status(200).json(result);
    } catch (error) {
      return res.status(error.code).json({ message: error.message });
    }
  }
}
