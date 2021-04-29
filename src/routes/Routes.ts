import express from 'express';
import MusicRoutes from '@routes/MusicRoutes';

export default class Routes {
  private routes: express.Router;

  constructor() {
    this.routes = express.Router();
    this.routes.use(new MusicRoutes().getRoutes());
  }

  public getRoutes(): express.Router {
    return this.routes;
  }
}
