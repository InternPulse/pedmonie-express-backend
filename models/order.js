'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Order.belongsTo(models.Merchant, {
        foreignKey: "merchant_id",
        as: "merchant",
      });
    
    }
  }
  Order.init({
    sn: {
        allowNull: false,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        unique: true
      },
      order_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
        allowNull: false
      },
      merchant_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      gateway_name: {  
        type: DataTypes.STRING,
        allowNull: false
      },
      amount: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: false
      },
      order_status: {
        type: DataTypes.ENUM('pending', 'successful', 'failed'),
        defaultValue: 'pending',
        allowNull: false
      },
     
    }, {
    sequelize,
    modelName: 'Order',
    timestamps: true,
    underscored: true,
  });
  return Order;
};