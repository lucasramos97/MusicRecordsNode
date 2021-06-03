import UserController from '@controllers/UserController';
import express from 'express';

export default class UserRoutes {
  private routes: express.Router;

  constructor() {
    this.routes = express.Router();
    const userController = new UserController();
    this.routes.post('/users/', userController.save);
  }

  public getRoutes(): express.Router {
    return this.routes;
  }
}
