const express = require("express");
const { Post } = require("./model");
const { User } = require("../User/model");
const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();

// Create a new post (requires authentication)
router.post("/post", authMiddleware, async (req, res) => {
  try {
    const { title, content, status } = req.body;
    const userId = req.user.id;
    const post = await Post.create({ title, content, status, userId });
    return res.status(201).json({
      status: "success",
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error creating post",
      error: error.message,
    });
  }
});

router.get("/post", async (req, res) => {
  const { status } = req.query;
  try {
    let posts;
    if (status) {
      posts = await Post.scope({ method: ["byStatus", status] }).findAll({
        include: [{ model: User, attributes: ["id", "name", "email"] }],
      });
    } else {
      posts = await Post.findAll({
        include: [{ model: User, attributes: ["id", "name", "email"] }],
      });
    }

    return res.status(200).json({
      status: "success",
      posts,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error fetching posts",
      error: error.message,
    });
  }
});

module.exports = router;
