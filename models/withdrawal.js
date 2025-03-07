'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

// const shortUUID = require('short-uuid')
// const translator = shortUUID()
module.exports = (sequelize, DataTypes) => {
  class Withdrawal extends Model {
    
    static associate(models) {
      // Withdrawal.belongsTo(models.Merchant, { foreignKey:'merchant_id' })
      // models.Merchant.hasMany(Withdrawal)
    }
  }
  Withdrawal.init({
      sn: {
        allowNull: false,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        unique: true
      },
      withdrawal_id: {
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
      merchant_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      initial_balance:{
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      final_balance: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'successful', 'failed'),
        allowNull: false,
        defaultValue: 'pending'
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
    modelName: 'Withdrawal',
    tableName: 'withdrawals'
  });
  return Withdrawal;
};
