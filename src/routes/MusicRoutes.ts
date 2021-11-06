import express from 'express';

import MusicController from 'src/controllers/MusicController';

export default class MusicRoutes {
  private routes: express.Router;

  constructor() {
    this.routes = express.Router();

    const musicController = new MusicController();
    this.routes.get('/musics/deleted/count/', musicController.getCountDeletedMusics);
    this.routes.get('/musics/deleted/', musicController.getAllDeletedMusics);
    this.routes.get('/musics/:id/', musicController.getById);
    this.routes.get('/musics/', musicController.getAllMusics);
    this.routes.post('/musics/deleted/restore/', musicController.restoreDeletedMusics);
    this.routes.post('/musics/', musicController.save);
    this.routes.put('/musics/:id/', musicController.update);
    this.routes.delete('/musics/definitive/:id/', musicController.definitiveDelete);
    this.routes.delete('/musics/empty-list/', musicController.emptyList);
    this.routes.delete('/musics/:id/', musicController.delete);
  }

  public getRoutes(): express.Router {
    return this.routes;
  }
}
