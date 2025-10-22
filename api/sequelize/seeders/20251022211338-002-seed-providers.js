'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up (queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('providers', [
      { id: uuidv4(), full_name: 'Dr. Ana Ruiz',  specialty: 'Internal Medicine', created_at: now },
      { id: uuidv4(), full_name: 'Dr. Luis Gómez', specialty: 'General Practice',  created_at: now },
    ]);
  },

  async down (queryInterface) {
    await queryInterface.bulkDelete('providers', null, {});
  }
};