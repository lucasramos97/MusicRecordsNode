/* eslint-disable no-useless-constructor */
import Music from '@models/Music';
import { Sequelize } from 'sequelize-typescript';

const config = require('./database');

export default class SequelizeConfig {
  private static instance: Sequelize;

  // eslint-disable-next-line no-empty-function
  private constructor() { }

  public static config() {
    if (!SequelizeConfig.instance) {
      SequelizeConfig.instance = new Sequelize(config);
      const models: Array<any> = [
        Music,
      ];
      SequelizeConfig.instance.addModels(models);
    }
  }
}
