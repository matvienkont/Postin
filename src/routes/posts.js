const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ensureAuthenticated } = require('../../helpers/auth');

//Load photo model
require('../models/photoSchema');
const PhotoModel = mongoose.model('photo');

//Load note model
require('../models/noteSchema');
const NoteModel = mongoose.model('note');

router.get('/', ensureAuthenticated, (req, res) => {
    
    NoteModel.find({ user: req.user.id })
    .then((notes) => 
    {
        PhotoModel.find({ user: req.user.id })
        .then((photos) => 
        {
            var posts = notes.concat(photos);
            posts = posts.sort((a, b) => b.date - a.date);
            return res.render('posts/viewPosts', {
                posts: posts
            })
        });
    });

}); 

module.exports = router;