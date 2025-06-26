const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const Post = sequelize.define(
  "Post",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("draft", "publish"),
      allowNull: false,
      defaultValue: "draft",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
  },
  {
    scopes: {
      byStatus(status) {
        return {
          where: { status },
        };
      },
    },
    timestamps: true,
  }
);

module.exports = { Post };
