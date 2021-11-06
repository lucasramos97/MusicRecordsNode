import express from 'express';

import UserController from 'src/controllers/UserController';

export default class UserRoutes {
  private routes: express.Router;

  constructor() {
    this.routes = express.Router();
    const userController = new UserController();
    this.routes.post('/users/', userController.save);
    this.routes.post('/login/', userController.login);
  }

  public getRoutes(): express.Router {
    return this.routes;
  }
}
