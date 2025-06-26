const express = require("express");
const { Student, User } = require("../User/model");
const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();

router.post("/student", authMiddleware, async (req, res) => {
  try {
    const { name, email, classLevel, grade } = req.body;

    const user = await User.create({
      name,
      email,
      password: `${name}@123`,
      role: "student",
    });

    const student = await Student.create({
      userId: user.id,
      classLevel: Number(classLevel),
      grade,
    });

    return res.status(201).json({ status: "success", user, student });
  } catch (error) {
    console.log(`🚀 ~ error:`, error);
    return res.status(500).json({ status: "error", message: error.message });
  }
});

// Get all Students
router.get("/student", async (req, res) => {
  try {
    const students = await Student.findAll({ include: [{ model: User }] });
    return res.status(200).json({ status: "success", students });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
});

// Get Student by ID
router.get("/student/:id", authMiddleware, async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [{ model: User }],
    });
    if (!student)
      return res
        .status(404)
        .json({ status: "error", message: "Student not found" });
    return res.status(200).json({ status: "success", student });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
});

// Update Student
router.put("/student/:id", authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;
    const student = await Student.findByPk(req.params.id);
    if (!student)
      return res
        .status(404)
        .json({ status: "error", message: "Student not found" });

    const user = await User.findByPk(student.userId);
    if (!user)
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });

    await user.update({ name, email });
    await student.update(req.body);
    return res.status(200).json({ status: "success", student });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
});

// Delete Student
router.delete("/student/:id", authMiddleware, async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student)
      return res
        .status(404)
        .json({ status: "error", message: "Student not found" });
    await student.destroy();
    return res
      .status(200)
      .json({ status: "success", message: "Student deleted" });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
});

module.exports = router;
