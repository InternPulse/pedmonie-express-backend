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
        },
      merchant_id: {
        type: DataTypes.CHAR(36),
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
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
        type:DataTypes.STRING, // Changed from INTEGER to STRING (better for phone numbers)
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
    tableName: 'merchants',
  });
  return Merchant;
};

