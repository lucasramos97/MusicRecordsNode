import { Request, Response } from 'express';

import Music from 'src/models/Music';
import MusicService from 'src/services/MusicService';

import { IPaginatedQueryModel } from 'src/interfaces/IPaginatedQueryModel';
import { IMusicJson } from 'src/interfaces/IMusicJson';

const musicService = new MusicService();

export default class MusicController {
  public async getAllMusics(req: Request, res: Response):
    Promise<Response<IPaginatedQueryModel<Music>>> {
    const page = req.query.page ? Number.parseInt(req.query.page.toString(), 10) - 1 : 0;
    const size = req.query.size ? Number.parseInt(req.query.size.toString(), 10) : 5;
    const { userId } = req.body;

    const result = await musicService.getAllMusics(userId, page, size);

    return res.json(result);
  }

  public async getById(req: Request, res: Response): Promise<Response<Music>> {
    const musicId = Number.parseInt(req.params.id, 10);
    const { userId } = req.body;

    try {
      const result = await musicService.getById(musicId, userId);

      return res.status(200).json(result);
    } catch (error) {
      return res.status(error.code).json({ message: error.message });
    }
  }

  public async save(req: Request, res: Response): Promise<Response<Music>> {
    const musicJson: IMusicJson = req.body;

    try {
      const result = await musicService.save(musicJson);

      return res.status(201).json(result);
    } catch (error) {
      return res.status(error.code).json({ message: error.message });
    }
  }

  public async update(req: Request, res: Response): Promise<Response<Music>> {
    const musicId = Number.parseInt(req.params.id, 10);
    const musicJson: IMusicJson = req.body;

    try {
      const result = await musicService.update(musicId, musicJson);

      return res.status(200).json(result);
    } catch (error) {
      return res.status(error.code).json({ message: error.message });
    }
  }

  public async delete(req: Request, res: Response): Promise<Response<Music>> {
    const musicId = Number.parseInt(req.params.id, 10);
    const { userId } = req.body;

    try {
      const result = await musicService.delete(musicId, userId);

      return res.status(200).json(result);
    } catch (error) {
      return res.status(error.code).json({ message: error.message });
    }
  }

  public async getCountDeletedMusics(req: Request, res: Response): Promise<Response<number>> {
    const { userId } = req.body;

    const result = await musicService.getCountDeletedMusics(userId);

    return res.json(result);
  }

  public async getAllDeletedMusics(req: Request, res: Response):
    Promise<Response<IPaginatedQueryModel<Music>>> {
    const page = req.query.page ? Number.parseInt(req.query.page.toString(), 10) - 1 : 0;
    const size = req.query.size ? Number.parseInt(req.query.size.toString(), 10) : 5;
    const { userId } = req.body;

    const result = await musicService.getAllMusics(userId, page, size, true);

    return res.json(result);
  }

  public async restoreDeletedMusics(req: Request, res: Response): Promise<Response<number>> {
    const { content, userId } = req.body;

    try {
      const result = await musicService.restoreDeletedMusics(content, userId);

      return res.status(200).json(result);
    } catch (error) {
      return res.status(error.code).json({ message: error.message });
    }
  }

  public async definitiveDelete(req: Request, res: Response): Promise<Response<Music>> {
    const musicId = Number.parseInt(req.params.id, 10);
    const { userId } = req.body;

    try {
      await musicService.definitiveDelete(musicId, userId);

      return res.status(200).json();
    } catch (error) {
      return res.status(error.code).json({ message: error.message });
    }
  }

  public async emptyList(req: Request, res: Response): Promise<Response<number>> {
    const { userId } = req.body;

    try {
      const result = await musicService.emptyList(userId);

      return res.status(200).json(result);
    } catch (error) {
      return res.status(error.code).json({ message: error.message });
    }
  }
}
