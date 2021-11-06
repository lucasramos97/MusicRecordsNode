import express from 'express';
import request from 'supertest';
import * as jwt from 'jsonwebtoken';

import Messages from 'src/utils/Messages';

import { IUser } from 'src/interfaces/IUser';
import { ILogin } from 'src/interfaces/ILogin';

export default class BaseTdd {
  public static readonly INAPPROPRIATE_TOKENS = [
    ['Bearer 123', Messages.INVALID_TOKEN],
    ['', Messages.HEADER_AUTHORIZATION_NOT_PRESENT],
    ['Bearer ', Messages.NO_TOKEN_PROVIDED],
  ]

  public static readonly MUSIC_REQUIRED_FIELDS = [
    ['title', Messages.TITLE_IS_REQUIRED],
    ['artist', Messages.ARTIST_IS_REQUIRED],
    ['release_date', Messages.RELEASE_DATE_IS_REQUIRED],
    ['duration', Messages.DURATION_IS_REQUIRED],
  ]

  public static readonly USER_REQUIRED_FIELDS = [
    ['username', Messages.USERNAME_IS_REQUIRED],
    ['email', Messages.EMAIL_IS_REQUIRED],
    ['password', Messages.PASSWORD_IS_REQUIRED],
  ]

  public static readonly LOGIN_REQUIRED_FIELDS = [
    ['email', Messages.EMAIL_IS_REQUIRED],
    ['password', Messages.PASSWORD_IS_REQUIRED],
  ]

  public async getAuthorization(app: express.Application, user: IUser): Promise<string> {
    const credentials: ILogin = {
      email: user.email,
      password: user.password,
    };
    const loginResponse = await request(app).post('/login').send(credentials);

    return `Bearer ${loginResponse.body.token}`;
  }

  public async getExpiredAuthorization(userId: number): Promise<string> {
    const token = await jwt.sign({ id: userId }, process.env.SECRET, {
      expiresIn: '0',
    });

    return `Bearer ${token}`;
  }

  public matchDate(date: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(date);
  }

  public matchTime(time: string): boolean {
    return /^\d{2}:\d{2}:\d{2}$/.test(time);
  }

  public matchDateTime(dateTime: string): boolean {
    return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}.\d{3}$/.test(dateTime);
  }
}
