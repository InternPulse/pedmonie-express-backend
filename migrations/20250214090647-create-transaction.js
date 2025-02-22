'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transactions', {
      sn: {
        allowNull: false,
        autoIncrement: true,
        type: Sequelize.INTEGER,
        unique: true
      },
      transaction_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        unique: true,
        allowNull: false
      },
      order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'order_id'
        },
        onDelete: 'CASCADE'
      },
      merchant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'merchants',
          key: 'merchant_id'
        },
        onDelete: 'CASCADE'
      },
      gateway_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      gateway_transaction_identifier: {
        type: Sequelize.STRING,
        allowNull: false
      },
      payment_channel: {
        type: Sequelize.STRING,
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'successful', 'failed'),
        defaultValue: 'pending'
      },
      currency: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('transactions');
  }
};