'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MerchantPaymentGateway extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      MerchantPaymentGateway.belongsTo(models.Merchant, { foreignKey: 'merchant_id'} )
      models.Merchant.hasOne(MerchantPaymentGateway);
    }
  }
  MerchantPaymentGateway.init({
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      merchant_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      payment_gateways: {
        type: DataTypes.JSON,
        allowNull: false
      }
    }, {
    sequelize,
    modelName: 'MerchantPaymentGateway',
    timestamps: true,
    underscored: true,
  });
  return MerchantPaymentGateway;
};