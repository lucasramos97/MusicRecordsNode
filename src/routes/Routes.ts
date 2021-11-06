import express from 'express';

import AuthenticationController from 'src/controllers/AuthenticationController';
import MusicRoutes from 'src/routes/MusicRoutes';
import UserRoutes from 'src/routes/UserRoutes';

export default class Routes {
  private routes: express.Router;

  constructor() {
    this.routes = express.Router();
    this.routes.use(new UserRoutes().getRoutes());
    this.routes.use(new AuthenticationController().verifyJWT, new MusicRoutes().getRoutes());
  }

  public getRoutes(): express.Router {
    return this.routes;
  }
}
