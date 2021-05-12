/* eslint-disable class-methods-use-this */
import Music from '@models/Music';
import PaginatedQueryModel from '@models/PaginatedQueryModel';
import MusicService from '@services/MusicService';
import { Request, Response } from 'express';

export default class MusicController {
  public async getAllPagination(req: Request, res: Response):
  Promise<Response<PaginatedQueryModel<Music>>> {
    const page = req.query.page ? Number.parseInt(req.query.page.toString(), 10) : 0;
    const size = req.query.size ? Number.parseInt(req.query.size.toString(), 10) : 5;

    const musicService = new MusicService();
    const result = await musicService.getAllPagination(page, size);

    return res.json(result);
  }

  public async save(req: Request, res: Response): Promise<Response<Music>> {
    const music = req.body;

    try {
      const musicService = new MusicService();
      const result = await musicService.save(music);

      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async update(req: Request, res: Response): Promise<Response<Music>> {
    const musicId = Number.parseInt(req.params.id, 10);
    const music = req.body;

    try {
      const musicService = new MusicService();
      const result = await musicService.update(musicId, music);

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async logicalDelete(req: Request, res: Response): Promise<Response<Music>> {
    const musicId = Number.parseInt(req.params.id, 10);

    try {
      const musicService = new MusicService();
      const result = await musicService.logicalDelete(musicId);

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
}
