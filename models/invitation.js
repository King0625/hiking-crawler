'use strict';
module.exports = (sequelize, DataTypes) => {
  const Invitation = sequelize.define('Invitation', {
    postId: DataTypes.STRING,
    subject: DataTypes.STRING,
    departure_date: DataTypes.STRING,
    description: DataTypes.STRING
  }, {});
  Invitation.associate = function(models) {
    // associations can be defined here
  };
  return Invitation;
};