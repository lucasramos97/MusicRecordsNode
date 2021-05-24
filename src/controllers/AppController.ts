import SequelizeConfig from '@config/SequelizeConfig';
import Routes from '@routes/Routes';
import express from 'express';

require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
});

const cors = require('cors');

export default class AppController {
  private application: express.Application;

  constructor() {
    SequelizeConfig.config();
    this.application = express();
    this.application.use(cors());
    this.middlewares();
    this.routes();
  }

  public getExpress(): express.Application {
    return this.application;
  }

  private middlewares() {
    this.application.use(express.json());
  }

  private routes() {
    this.application.use(new Routes().getRoutes());
  }
}
