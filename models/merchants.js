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
        foreignKey: "merchant_id",
        as: "orders",
        onDelete: "CASCADE",
      });
      Merchant.hasMany(models.MerchantPaymentGateway, {
        foreignKey: "merchant_id",
        as: "merchantPaymentGateways",
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      });
      Merchant.hasMany(models.Transaction, {
        foreignKey: "merchant_id",
        as: "transactions",
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      });
      Merchant.hasOne(models.Wallet, {
        foreignKey: "merchant_id",
        as: "wallet",
      });
      Merchant.hasMany(models.Withdrawal, {
        foreignKey: "merchant_id",
        as: "withdrawals",
      });
    }
  }
  Merchant.init({
      sn: {
        allowNull: false,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        },
      merchant_id: {
        type: DataTypes.CHAR(36),
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      first_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      middle_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
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
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      
      phone: {
        type:DataTypes.STRING(20), // Changed from INTEGER to STRING (better for phone numbers)
        allowNull: false,
      },
      is_staff:{
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      role: {
        type:DataTypes.ENUM('superadmin', 'merchant'), // Fixed ENUM syntax
        defaultValue: 'merchant',
        allowNull: false,
      },
      nin: {
        type:DataTypes.STRING,
        allowNull: true,
      },
      is_nin_verified: {
        type:DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      bvn: {
        type:DataTypes.STRING,
        allowNull: true,
      },
      is_bvn_verified: {
        type:DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      cac_number: {
        type:DataTypes.STRING,
        allowNull: true,
      },
      is_business_cac_verified: {
        type:DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      id_card: {
        type:DataTypes.STRING,
        allowNull: true,
      },
      passport: {
        type:DataTypes.STRING,
        allowNull: true,
      },
      is_kyc_verified: {
        type:DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      
    }, {
    sequelize,
    modelName: 'Merchant',
    tableName: 'merchants',
  });
  return Merchant;
};

