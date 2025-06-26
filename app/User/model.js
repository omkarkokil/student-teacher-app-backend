const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const bcrypt = require("bcrypt");
const { Post } = require("../post/model");

// Example User model
const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("admin", "student", "teacher"),
      allowNull: false,
    },
  },
  {
    timestamps: true,

    indexes: [
      {
        name: "users_email_index",
        fields: ["email"],
      },
      {
        name: "users_name_index",
        fields: ["name"],
      },
    ],
    hooks: {
      beforeCreate: async (user) => {
        const saltRounds = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, saltRounds);
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          const saltRounds = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, saltRounds);
        }
      },
    },
  }
);

const Student = sequelize.define("Student", {
  userId: {
    type: DataTypes.INTEGER, // changed from UUID to INTEGER
    primaryKey: true,
    references: {
      model: "Users",
      key: "id",
    },
  },
  classLevel: DataTypes.INTEGER,
  grade: DataTypes.STRING,
});

const Teacher = sequelize.define("Teacher", {
  userId: {
    type: DataTypes.INTEGER, // changed from UUID to INTEGER
    primaryKey: true,
    references: {
      model: "Users",
      key: "id",
    },
  },
  department: DataTypes.STRING,
  classes: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
  },
});

// Define associations
User.hasMany(Post, { foreignKey: "userId" });
Post.belongsTo(User, { foreignKey: "userId" });

Student.belongsTo(User, { foreignKey: "userId" });
Teacher.belongsTo(User, { foreignKey: "userId" });

module.exports = { sequelize, User, Student, Teacher, Post };
