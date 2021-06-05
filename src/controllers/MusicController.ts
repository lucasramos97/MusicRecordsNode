import Music from '@models/Music';
import PaginatedQueryModel from '@models/PaginatedQueryModel';
import MusicService from '@services/MusicService';
import { Request, Response } from 'express';

const musicService = new MusicService();

export default class MusicController {
  public async getAllPagination(req: Request, res: Response):
  Promise<Response<PaginatedQueryModel<Music>>> {
    const page = req.query.page ? Number.parseInt(req.query.page.toString(), 10) : 0;
    const size = req.query.size ? Number.parseInt(req.query.size.toString(), 10) : 5;
    const { userId } = req.body;

    const result = await musicService.getAllPagination(page, size, userId);

    return res.json(result);
  }

  public async getById(req: Request, res: Response): Promise<Response<Music>> {
    const musicId = Number.parseInt(req.params.id, 10);
    const { userId } = req.body;

    try {
      const result = await musicService.getById(musicId, userId);

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async save(req: Request, res: Response): Promise<Response<Music>> {
    const music = req.body;

    try {
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
      const result = await musicService.update(musicId, music);

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async logicalDelete(req: Request, res: Response): Promise<Response<Music>> {
    const musicId = Number.parseInt(req.params.id, 10);
    const { userId } = req.body;

    try {
      const result = await musicService.logicalDelete(musicId, userId);

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async getCountDeletedMusics(req: Request, res: Response): Promise<Response<number>> {
    const { userId } = req.body;

    const result = await musicService.getCountDeletedMusics(userId);

    return res.json(result);
  }

  public async getAllDeletedPagination(req: Request, res: Response):
  Promise<Response<PaginatedQueryModel<Music>>> {
    const page = req.query.page ? Number.parseInt(req.query.page.toString(), 10) : 0;
    const size = req.query.size ? Number.parseInt(req.query.size.toString(), 10) : 5;
    const { userId } = req.body;

    const result = await musicService.getAllDeletedPagination(page, size, userId);

    return res.json(result);
  }

  public async restoreDeletedMusics(req: Request, res: Response): Promise<Response<Music>> {
    const { content, userId } = req.body;

    try {
      const result = await musicService.restoreDeletedMusics(content, userId);

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async definitiveDelete(req: Request, res: Response): Promise<Response<Music>> {
    const musicId = Number.parseInt(req.params.id, 10);
    const { userId } = req.body;

    try {
      const result = await musicService.definitiveDelete(musicId, userId);

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async emptyList(req: Request, res: Response): Promise<Response<number>> {
    const { userId } = req.body;

    try {
      const result = await musicService.emptyList(userId);

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
}
