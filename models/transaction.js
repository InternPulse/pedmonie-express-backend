'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Transaction.belongsTo(models.Merchant,{ foreignKey: 'merchant_id'})
      models.Merchant.hasMany(Transaction)

      Transaction.belongsTo(models.Order, { foreignKey: 'order_id'})
      models.Merchant.hasMany(Transaction)
    }
  }
  Transaction.init({
      sn: {
        allowNull: false,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        unique: true
      },
      transaction_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        unique: true,
        allowNull: false
      },
      order_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      merchant_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      gateway_name: {
        type: DataTypes.STRING,
        allowNull: false

      },
      gateway_transaction_identifier: {
        type: DataTypes.STRING,
        allowNull: false
      },
      payment_channel: {
        type: DataTypes.STRING,
        allowNull: false
      },
      amount: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'successful', 'failed'),
        defaultValue: 'pending'
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: false
      },
      
    }, {
    sequelize,
    modelName: 'Transaction',
  });
  return Transaction;
};