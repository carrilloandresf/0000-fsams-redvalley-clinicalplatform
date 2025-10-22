'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('providers', {
      id: { type: Sequelize.CHAR(36), primaryKey: true },
      full_name: { type: Sequelize.STRING, allowNull: false },
      specialty: { type: Sequelize.STRING, allowNull: false },
      created_at: {
        type: 'DATETIME',
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('providers');
  }
};
