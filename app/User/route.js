const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../../middleware/authMiddleware");
const { User } = require("./model");
const { Op } = require("sequelize");

const router = express.Router();

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.json({ status: "error", message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ status: "error", message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      token,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Login failed",
      error: error.message,
    });
  }
});

// Protect all user routes below
router.get("/user", authMiddleware, async (req, res) => {
  const user = await User.findAll();
  console.log(req.user);
  return res.status(200).json({
    status: "success",
    message: "User fetched successfully",
    user,
  });
});

router.post("/user", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password, role: "admin" });
    return res.status(201).json({
      status: "success",
      message: "User created successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error creating user",
      error: error.message,
    });
  }
});

router.put("/user/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    await user.update({ name, email, password });

    return res.status(200).json({
      status: "success",
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error updating user",
      error: error.message,
    });
  }
});

router.delete("/user/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }
    await user.destroy();
    return res.status(200).json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error deleting user",
      error: error.message,
    });
  }
});

router.get("/search-user", async (req, res) => {
  try {
    const { email, name } = req.query;

    // If no query params were passed, return all users
    if (!email && !name) {
      const allUsers = await User.findAll(); // Fetch all users
      return res.status(200).json({
        message: "No search parameters provided. Returning all users.",
        users: allUsers,
      });
    }

    // Perform the search using the provided parameters
    const user = await User.findAll({
      where: {
        [Op.or]: [
          email ? { email: email } : undefined,
          name ? { name: name } : undefined,
        ].filter(Boolean),
      },
    });

    // If no user is found, return all users
    if (!user) {
      const allUsers = await User.findAll(); // Fetch all users
      return res.status(200).json({
        message:
          "No user found with the provided parameters. Returning all users.",
        users: allUsers,
      });
    }

    return res.status(200).json({
      message: "User found.",
      user,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "An error occurred while processing your request.",
      error: error.message,
    });
  }
});

module.exports = router;
