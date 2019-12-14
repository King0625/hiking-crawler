'use strict';
module.exports = (sequelize, DataTypes) => {
  const Invitation = sequelize.define('Invitation', {
    postId: DataTypes.STRING,
    subject: DataTypes.TEXT,
    departure_date: DataTypes.TEXT,
    description: DataTypes.TEXT
  }, {charset: 'utf8mb4'});
  Invitation.associate = function(models) {
    // associations can be defined here
  };
  return Invitation;
};