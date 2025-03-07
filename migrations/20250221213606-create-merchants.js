'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('merchants', {
      sn: {
        allowNull: false,
        autoIncrement: true,
        type: Sequelize.INTEGER,
        unique: true,
      },
      merchant_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        unique: true,
        allowNull: false,
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      middle_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      is_email_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      business_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      password_hash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      password_salt: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING, // Changed from INTEGER to STRING (better for phone numbers)
        allowNull: false,
        unique: true,
      },
      role: {
        type: Sequelize.ENUM('superadmin', 'merchant'), // Fixed ENUM syntax
        defaultValue: 'merchant',
        allowNull: false,
      },
      nin: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      is_nin_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      bvn: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      is_bvn_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      cac_number: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      is_cac_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      id_card: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      passport: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      is_kyc_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('merchants');
  }
};