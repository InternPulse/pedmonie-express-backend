'use strict';
const {Model} = require('sequelize');
// const shortUUID = require('short-uuid');
// const translator = shortUUID();
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
        Transaction.belongsTo(models.Order, {
            foreignKey: "order_id",
            as: "orders",
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
          });
          Transaction.belongsTo(models.Merchant, {
            foreignKey: "merchant_id",
            as: "merchant",
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
          });
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
        // defaultValue:() => translator.new(),
        defaultValue: ()=>{
          let uuid = uuidv4()
          return uuid.toString().split('-').join('')
        },
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
        type: DataTypes.STRING(50),
        allowNull: false

      },
      gateway_transaction_identifier: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      payment_channel: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      amount: {
        type: DataTypes.DECIMAL(15, 2),
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
    modelName: 'Transaction',
    tableName: 'transactions'
  });
  return Transaction;
};