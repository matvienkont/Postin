const express = require('express');
const router = express.Router();
const multer  = require('multer');
const fs = require('fs-extra');
const path = require('path');
const mongoose = require('mongoose');

//Load photo model
require('../models/photoSchema');
const photoModel = mongoose.model('photo');

let UPLOAD_LOCATION = path.join(__dirname, '../../photoset');
fs.mkdirsSync(UPLOAD_LOCATION);

//optins for multer package: store photos on disk, unique names, filter file which size more than 1kb or not png/jpeg/jpg
var options =   { 
                    storage: multer.diskStorage(
                    {
                        destination: (req, file, callback) => 
                        {
                            callback(null, UPLOAD_LOCATION);
                        },
                        filename: (req, file, callback) => 
                        {
                            callback(null, req.uniqueName)
                        }
                    }),

                    fileFilter: (req, file, callback) =>
                    {    
                        var ext = file.mimetype;
                        if(ext !== 'image/png' && ext !== 'image/jpeg') 
                        {
                            return callback(new Error('Only images are allowed'));
                        }
                        callback(null, true);
                    },
                    limits: { fileSize: 1000000 }
                };
                
var upload = multer(options).single('inputPhoto');
                
router.post('/', function (req, res, next) 
{   
    req.uniqueName = 'inputPhoto-'+Date.now() + '-' + Math.round(Math.random() * 1E9);

    upload(req, res, function(err) 
    {
        if (err instanceof multer.MulterError) 
        {
            req.flash('error_msg', 'Photo is too large, mate (1mb - is top) !');
            res.redirect('/photos');
        } if(err instanceof Error)
        {
            req.flash('error_msg', 'Only png/jpg/jpeg are allowed');
            res.redirect('/photos');
        } else 
        {
            next();
        }

    });
    
});

router.post('/', function (req, res, next) 
{
    var mmm = require('mmmagic'),
    Magic = mmm.Magic;

    let magic = new Magic(mmm.MAGIC_MIME_TYPE);
    let fileNameWithLocation = path.join(UPLOAD_LOCATION, req.uniqueName);

    magic.detectFile(fileNameWithLocation, function (err, mimeType) 
    {
        const ALLOWED_TYPES = [
        'image/jpeg',
        'image/jpg',
        'image/png'
        ];

        if(!ALLOWED_TYPES.includes(mimeType))
        {
            fs.unlink(fileNameWithLocation);
            req.flash('error_msg', 'Only png/jpg/jpeg are allowed');
            res.redirect('/photos');
        } else 
        {
            next();    
        }
    });
});

router.post('/', (req, res) =>
{

    console.log("Middleware to post to db");
    res.redirect('/photos');
        /*const newPhoto = {
            title: req.body.title,
            details: req.body.details,
            user: req.user.id
        };
        new PostModel(newPost).save().then(() => {
            req.flash('success_msg', 'Post successfully added!');
            res.redirect('/posts');
        });*/
});

router.get('/', (req, res) => 
{
    res.render('photos/photos');
})

module.exports = router;