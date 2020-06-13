const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ensureAuthenticated } = require('../../helpers/auth');

//Load post model
require('../models/postSchema');
const PostModel = mongoose.model('post');

// View posts page
router.get('/', ensureAuthenticated, (req, res) => {
    PostModel.find({ user: req.user.id })
    .then((posts) => {
        posts = posts.sort((a, b) => b.date - a.date);
        return res.render('posts/viewphotos', {
            posts: posts
        });
    });
});

// Add post
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('posts/add');
});

// Edit post
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    PostModel.findOne({ _id: req.params.id }).then((post) => {
        if (post.user != req.user.id) 
        {
            req.flash('error_msg', 'Sorry, not authenticated :(');
            res.redirect('/posts')
        } else 
        {
            res.render('posts/edit', {
                post: post
            });
        }
    });
});

// Update post
router.put('/:id', ensureAuthenticated, (req, res) => {
    /* 
        Post didn't change logic needed
     */
    PostModel.findOne({ _id: req.params.id }).then((post) => 
    {
        post.title = req.body.title;
        post.details = req.body.details;
        post.save(); 
    })
    .then(() => {
            req.flash('success_msg', 'Post successfully updated!');
            res.redirect('/posts')
        });
});

//Delete post
router.delete('/:id', ensureAuthenticated, (req, res) => {
    PostModel.deleteOne({ _id: req.params.id }).then(() => {
        req.flash('success_msg', 'Post successfully deleted!');
        res.redirect('/posts');
    })
});

//Process form
router.post('/', ensureAuthenticated, (req, res) => {
    let errors = [];
    if (!req.body.title) errors.push({ textError: 'Required title field is empty' });
    if (!req.body.details) errors.push({ textError: 'Required details field is empty' });

    if (errors.length > 0) {
        res.render('posts/add', {
            errors: errors,
            title: req.body.title,
            details: req.body.details
        });
    } else {
        const newPost = {
            title: req.body.title,
            details: req.body.details,
            user: req.user.id
        };
        new PostModel(newPost).save().then(() => {
            req.flash('success_msg', 'Post successfully added!');
            res.redirect('/posts');
        });
    }
});

module.exports = router;