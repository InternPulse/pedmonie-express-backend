'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Merchant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part ofDataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Merchant.hasMany(models.Order, {
        foreignKey: 'merchant_id',
      })
    }
  }
  Merchant.init({
      sn: {
        allowNull: false,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        unique: true,
      },
      merchant_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        unique: true,
        allowNull: false,
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      middle_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      is_email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      business_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password_salt: {
        type:DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type:DataTypes.STRING, // Changed from INTEGER to STRING (better for phone numbers)
        allowNull: false,
        unique: true,
      },
      role: {
        type:DataTypes.ENUM('admin', 'merchant'), // Fixed ENUM syntax
        defaultValue: 'merchant',
        allowNull: false,
      },
      total_balance: {
        type:DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false,
      },
      nin: {
        type:DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      is_nin_verified: {
        type:DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      bvn: {
        type:DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      is_bvn_verified: {
        type:DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      cac_number: {
        type:DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      is_cac_verified: {
        type:DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      id_card: {
        type:DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      passport: {
        type:DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      is_kyc_verified: {
        type:DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type:DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type:DataTypes.DATE,
      },
    }, {
    sequelize,
    modelName: 'Merchant',
  });
  return Merchant;
};

