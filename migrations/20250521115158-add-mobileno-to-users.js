"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "mobileno", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "0000000000",
    });
  },

  async down(queryInterface, Sequelize) {
    // await queryInterface.removeColumn("Users", "mobileno");
  },
};
