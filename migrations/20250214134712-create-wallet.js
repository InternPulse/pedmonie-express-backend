'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Wallets', {
      sn: {
        allowNull: false,
        autoIncrement: true,
        type: Sequelize.INTEGER,
        unique: true
      },
      wallet_id: {
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
      amount: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0.00
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'USD'
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
    await queryInterface.dropTable('Wallets');
  }
};