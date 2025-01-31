// Create web server
// Create a new comment
// Get all comments
// Get a comment by id
// Update a comment
// Delete a comment
const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

// Create a new comment
router.post(
  '/',
  [
    auth,
    check('text', 'Text is required').not().isEmpty(),
    check('post', 'Post is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).json({ errors: errors.array() });
    }

    try {
      const newComment = new Comment({
        text: req.body.text,
        post: req.body.post,
        user: req.user.id,
      });

      const comment = await newComment.save();
      res.json(comment);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  }
);

// Get all comments
router.get('/', async (req, res) => {
  try {
    const comments = await Comment.find();
    res.json(comments);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Get a comment by id
router.get('/:id', async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }
    res.json(comment);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Comment not found' });
    }
    res.status(500).send('Server Error');
  }
});

// Update a comment
router.put('/:id', auth, async (req, res) => {
  try {
    let comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not