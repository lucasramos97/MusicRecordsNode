import express from 'express';
import MusicRoutes from '@routes/MusicRoutes';
import UserRoutes from '@routes/UserRoutes';

export default class Routes {
  private routes: express.Router;

  constructor() {
    this.routes = express.Router();
    this.routes.use(new UserRoutes().getRoutes());
    this.routes.use(new MusicRoutes().getRoutes());
  }

  public getRoutes(): express.Router {
    return this.routes;
  }
}
