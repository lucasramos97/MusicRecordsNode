import User from '@models/User';
import UserService from '@services/UserService';
import { Request, Response } from 'express';
import { UniqueConstraintError } from 'sequelize';

const userService = new UserService();

export default class UserController {
  public async save(req: Request, res: Response): Promise<Response<User>> {
    const user = req.body;

    try {
      const result = await userService.save(user);

      return res.status(201).json(result);
    } catch (error) {
      if (error instanceof UniqueConstraintError && error.errors[0].type === 'unique violation') {
        return res.status(400).json({ message: `The ${user.email} e-mail has already been registered!` });
      }
      return res.status(400).json({ message: error.message });
    }
  }

  public async login(req: Request, res: Response): Promise<Response<any>> {
    const user = req.body;

    try {
      const result = await userService.login(user);

      return res.status(200).json(result);
    } catch (error) {
      return res.status(401).json({ message: error.message });
    }
  }
}
