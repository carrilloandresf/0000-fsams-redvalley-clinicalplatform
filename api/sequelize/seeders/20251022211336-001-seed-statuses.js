'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up (queryInterface) {
    const scheduledId = uuidv4();
    const checkedInId = uuidv4();
    const inConsultId = uuidv4();
    const cancelledId = uuidv4();
    const noShowId = uuidv4();

    await queryInterface.bulkInsert('statuses', [
      { id: scheduledId, name: 'Scheduled', parent_id: null,       order: 1 },
      { id: checkedInId, name: 'Checked-In', parent_id: scheduledId, order: 2 },
      { id: inConsultId, name: 'In Consultation', parent_id: checkedInId, order: 3 },
      { id: cancelledId, name: 'Cancelled', parent_id: checkedInId, order: 3 },
      { id: noShowId,   name: 'No-Show',   parent_id: scheduledId, order: 2 },
    ]);
  },

  async down (queryInterface) {
    await queryInterface.bulkDelete('statuses', null, {});
  }
};