'use strict';
const {Model} = require('sequelize');
// const shortUUID = require('short-uuid');
// const translator = shortUUID();
const { v4: uuidv4 } = require('uuid');

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
        onDelete: "CASCADE",
      });
      Merchant.hasMany(models.MerchantPaymentGateway, {
        foreignKey: "merchant_id",
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      });
      Merchant.hasMany(models.Transaction, {
        foreignKey: "merchant_id",
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      })
      
      Merchant.hasOne(models.Wallet, {
        foreignKey: "merchant_id",
      });

    }
  }
  Merchant.init({
      sn: {
        allowNull: false,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        unique: true 
        },
      merchant_id: {
        type: DataTypes.UUID,
        // defaultValue: () => translator.new(),
        defaultValue: ()=>{
          let uuid = uuidv4()
          return uuid.toString().split('-').join('')
        },
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
      last_login:{
        type: DataTypes.DATE
      },
      is_superuser: {
        type: DataTypes.BOOLEAN,
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

