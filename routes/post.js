const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const { update } = require("../models/Post");
const Post = require("../models/Post");
// @route POST api/posts
// @desciption Create post
// @access Private
router.post("/", verifyToken, async (req, res) => {
  const {
    imgs,
    title,
    processor,
    screen,
    ram,
    graphicCard,
    pin,
    weight,
    operatingSystem,
    price,
    review,
  } = req.body;
  if (!title) {
    return res
      .status(400)
      .json({ success: false, message: "title is required" });
  }
  try {
    const newPost = new Post({
      imgs,
      title,
      processor,
      screen,
      ram,
      graphicCard,
      pin,
      weight,
      operatingSystem,
      price,
      review,
    });
    await newPost.save();
    res.json({ success: true, post: newPost });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "server error" });
  }
});
//// get api/posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find({});
    res.json({ success: true, posts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "server error" });
  }
});
////pagination
router.get("/page=:page/amountPerPage=:limit", async (req, res) => {
  const { page, limit } = req.params;
  try {
    const posts = await Post.find()
      .limit(limit * 1)
      .skip((page - 1) * limit);
    res.json({ success: true, page, limit, posts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "server error" });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  const { title, description, url, status } = req.body;
  if (!title) {
    return res
      .status(400)
      .json({ success: false, message: "title is required" });
  }
  try {
    let updatedPost = {
      title,
      description: description || "",
      url: (url.startsWith("https://") ? url : `https://${url}`) || "",
      status: status || "to learn",
    };
    const postUpdateCondition = { _id: req.params.id, user: req.userId };
    updatePost = await Post.findOneAndUpdate(postUpdateCondition, updatedPost, {
      new: true,
    });
    ////user not authorize to update post
    if (!updatedPost) {
      return res
        .status(401)
        .json({ success: false, message: "not authorized" });
    }
    return res.json({
      success: true,
      message: "post updated",
      post: updatedPost,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "server error" });
  }
});

///// @route delete api/posts/id
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const postDeleteCondition = { _id: req.params.id, user: req.userId };
    const deletePost = await Post.findOneAndDelete(postDeleteCondition);

    //// user not authorize or post not found
    if (!deletePost) {
      return res
        .status(401)
        .json({ success: false, message: "not authorized" });
    }
    return res.json({ success: true, post: deletePost });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "server error" });
  }
});
module.exports = router;
