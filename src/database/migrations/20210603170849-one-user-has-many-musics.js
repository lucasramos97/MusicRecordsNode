module.exports = {
  up: async (queryInterface, Sequelize) => queryInterface.addColumn(
    'musics',
    'userId',
    {
      type: Sequelize.INTEGER,
      references: {
        model: 'users',
        key: 'id',
      },
      allowNull: false,
      onDelete: 'CASCADE',
    },
  ),

  down: async (queryInterface, Sequelize) => queryInterface.removeColumn(
    'musics',
    'userId',
  ),
};
