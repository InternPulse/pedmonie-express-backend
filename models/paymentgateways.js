'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PaymentGateways extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PaymentGateways.init({
      sn: {
        allowNull: false,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        unique: true
      },
      gateway_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        unique: true,
        allowNull: false
      },
      gateway_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      gateway_logo: {
        type: DataTypes.STRING,
        allowNull: false
      }
    }, {
    sequelize,
    modelName: 'PaymentGateways',
  });
  return PaymentGateways;
};