module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Students"); // <-- Use the correct table name
  },

  down: async (queryInterface, Sequelize) => {
    // Optional: recreate the table if needed
    await queryInterface.createTable("Students", {
      userId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: "Users",
          key: "id",
        },
      },
      classLevel: Sequelize.INTEGER,
      grade: Sequelize.STRING,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },
};
