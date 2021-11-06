/* eslint-disable no-useless-constructor */
import { Sequelize } from 'sequelize-typescript';

import Music from 'src/models/Music';
import User from 'src/models/User';

const config = require('./database');

export default class SequelizeConfig {
  private static instance: Sequelize;

  // eslint-disable-next-line no-empty-function
  private constructor() { }

  public static config() {
    if (!SequelizeConfig.instance) {
      SequelizeConfig.instance = new Sequelize(config);
      const models: Array<any> = [
        Music, User,
      ];
      SequelizeConfig.instance.addModels(models);
    }
  }
}
