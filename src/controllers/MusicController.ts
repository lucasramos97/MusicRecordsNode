/* eslint-disable class-methods-use-this */
import Music from '@models/Music';
import PaginatedQueryModel from '@models/PaginatedQueryModel';
import MusicService from '@services/MusicService';
import { Request, Response } from 'express';

export default class MusicController {
  async getAllPagination(req: Request, res: Response):
  Promise<Response<PaginatedQueryModel<Music>>> {
    const page = req.query.page ? Number.parseInt(req.query.page.toString(), 10) : 0;
    const size = req.query.size ? Number.parseInt(req.query.size.toString(), 10) : 5;

    const musicService = new MusicService();
    const result = await musicService.getAllPagination(page, size);

    return res.json(result);
  }

  async save(req: Request, res: Response): Promise<Response<any>> {
    const music = req.body;

    const musicService = new MusicService();

    try {
      const result = await musicService.save(music);

      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
}
