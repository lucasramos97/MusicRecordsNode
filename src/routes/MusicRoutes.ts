import MusicController from '@controllers/MusicController';
import express from 'express';

export default class MusicRoutes {
  private routes: express.Router;

  constructor() {
    this.routes = express.Router();
    const musicController = new MusicController();
    this.routes.get('/musics', musicController.getAllPagination);
    this.routes.post('/musics', musicController.save);
    this.routes.put('/musics/:id', musicController.update);
  }

  public getRoutes(): express.Router {
    return this.routes;
  }
}
