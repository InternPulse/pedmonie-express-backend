'use strict';
const { Model } = require('sequelize');
// const shortUUID = require('short-uuid');
const { v4: uuidv4 } = require('uuid');

// const translator = shortUUID();
module.exports = (sequelize, DataTypes) => {
  class PaymentGateway extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PaymentGateway.hasMany(models.MerchantPaymentGateway, {
        foreignKey: "gateway_id",
        as: "merchantGateways",
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      });
    }
  }
  PaymentGateway.init({
      sn: {
        allowNull: false,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        unique: true
      },
      gateway_id: {
        type: DataTypes.UUID,
        // defaultValue:() => translator.new(),
        defaultValue: ()=>{
          let uuid = uuidv4()
          return uuid.toString().split('-').join('')
        },
        primaryKey: true,
        unique: true,
        allowNull: false
      },
      gateway_name: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      gateway_logo: {
        type: DataTypes.STRING(2083),
        allowNull: false
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
    modelName: 'PaymentGateways',
    tableName: 'paymentgateways'
  });
  return PaymentGateway;
};