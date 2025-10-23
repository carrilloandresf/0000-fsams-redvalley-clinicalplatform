'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('statuses', {
      id: { type: Sequelize.CHAR(36), primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      parent_id: {
        type: Sequelize.CHAR(36),
        allowNull: true,
        references: { model: 'statuses', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      order: { type: Sequelize.INTEGER, allowNull: false }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('statuses');
  }
};
