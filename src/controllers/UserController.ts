import User from '@models/User';
import UserService from '@services/UserService';
import { Request, Response } from 'express';

const userService = new UserService();

export default class UserController {
  public async save(req: Request, res: Response): Promise<Response<User>> {
    const user = req.body;

    try {
      const result = await userService.save(user);

      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
}
