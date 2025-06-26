"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "role", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "student",
      validate: {
        isIn: [["admin", "student", "teacher"]],
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("Users", "role");
  },
};
