'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Wallet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Wallet.belongsTo(models.Merchant, {
        foreignKey: 'merchant_id',
      })

      models.Merchant.hasOne(Wallet)
    }
  }
  Wallet.init({
      sn: {
        allowNull: false,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        unique: true
      },
      wallet_id: {
        type: DataTypes.CHAR(36),
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        unique: true,
        allowNull: false
      },
      merchant_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValue: 0.00
      },
      currency:{
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'NGN'  
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
    modelName: 'Wallet',
    tableName: 'wallets'
  });
  return Wallet;
};