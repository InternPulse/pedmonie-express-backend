'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Supports', {
      sn: {
        allowNull: false,
        autoIncrement: true,
        type: Sequelize.INTEGER,
        unique: true
      },
      support_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        unique: true,
        allowNull: false
      },
      merchant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Merchants',
          key: 'merchant_id'
        },
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('pending', 'resolved'),
        defaultValue: 'pending',
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Supports');
  }
};