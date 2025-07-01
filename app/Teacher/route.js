const express = require("express");
const { Teacher, User } = require("../User/model");
const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();

// Create Teacher (User + Teacher in one API)
router.post("/teacher", async (req, res) => {
  try {
    const { name, email, department, classes } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.json({ status: "error", message: "Email already exists" });
    }

    const user = await User.create({
      name,
      email,
      password: `${name}@123`,
      role: "teacher",
    });

    const teacher = await Teacher.create({
      userId: user.id,
      department,
      classes,
    });

    return res.status(201).json({ status: "success", user, teacher });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ status: "error", message: error.message });
  }
});

// Get all Teachers
router.get("/teacher", async (req, res) => {
  try {
    const teachers = await Teacher.findAll({
      include: [{ model: User, attributes: ["id", "name", "email"] }],
    });
    return res.status(200).json({ status: "success", teachers });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
});

// Get Teacher by ID
router.get("/teacher/:id", authMiddleware, async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id, {
      include: [{ model: User }],
    });
    if (!teacher)
      return res
        .status(404)
        .json({ status: "error", message: "Teacher not found" });
    return res.status(200).json({ status: "success", teacher });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
});

// Update Teacher
router.put("/teacher/:id", authMiddleware, async (req, res) => {
  try {
    const { name, email, department, classes } = req.body;
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher)
      return res
        .status(404)
        .json({ status: "error", message: "Teacher not found" });
    await teacher.update({ name, email, department, classes });
    return res.status(200).json({ status: "success", teacher });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
});

// Delete Teacher
router.delete("/teacher/:id", authMiddleware, async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher)
      return res
        .status(404)
        .json({ status: "error", message: "Teacher not found" });
    await teacher.destroy();
    return res
      .status(200)
      .json({ status: "success", message: "Teacher deleted" });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
});

module.exports = router;
