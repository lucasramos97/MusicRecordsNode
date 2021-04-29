module.exports = {
  up: async (queryInterface, Sequelize) => queryInterface.createTable('musics', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    artist: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    release_date: {
      type: Sequelize.DATEONLY,
      allowNull: false,
    },
    duration: {
      type: Sequelize.TIME,
      allowNull: false,
    },
    number_views: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    feat: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    deleted: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  }),

  down: async (queryInterface, Sequelize) => queryInterface.dropTable('musics'),
};
