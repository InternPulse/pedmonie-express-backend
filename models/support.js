'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Support extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Support.belongsTo(models.Merchant, { foreignKey:'merchant_id' });
      models.Merchant.hasMany(Support);
    }
  }
  Support.init( {
      sn: {
        allowNull: false,
        autoIncrement: true,
        type: DataTypes.INTEGER,
        unique: true
      },
      support_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        unique: true,
        allowNull: false
      },
      merchant_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'resolved'),
        defaultValue: 'pending',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    }, {
    sequelize,
    modelName: 'Support',
  });
  return Support;
};