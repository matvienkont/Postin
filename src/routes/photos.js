const express = require('express');
const router = express.Router();
const multer  = require('multer');
const fs = require('fs-extra');
const path = require('path');
const mongoose = require('mongoose');
const { ensureAuthenticated } = require('../../helpers/auth');



//Load photo model
require('../models/photoSchema');
const PhotoModel = mongoose.model('photo');

let UPLOAD_LOCATION = 'src/public/photoset';
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
                            let extension = "." + file.mimetype.split("/")[1];
                            req.uniqueName += extension;
                            callback(null, req.uniqueName)
                        }
                    }),

                    fileFilter: (req, file, callback) =>
                    {    
                        var ext = file.mimetype;
                        if(ext !== "image/png" && ext !== "image/jpeg" && ext !== "image/jpg") 
                        {
                            return callback(new Error("Only images are allowed"));
                        }
                        callback(null, true);
                    },
                    limits: { fileSize: 1500000 }
                };
                
var upload = multer(options).single("inputPhoto");
                
router.post('/add', ensureAuthenticated, function (req, res, next) 
{   
    var prefix = "inputPhoto-"; 
    req.uniqueName = prefix+Date.now() + "-" + Math.round(Math.random() * 1E9);
        upload(req, res, function(err) 
        {
            
            console.log(req.body);
            if(!req.body.title)
            {
                req.flash("error_msg", "A title is a must");
                res.redirect("/photos/add");
            } else if (err instanceof multer.MulterError) 
                {
                    req.flash("error_msg", "Photo is too large, mate (1mb - is top) !");
                    res.redirect("/photos/add");
                } else if(!req.file) 
                {
                    req.flash("error_msg", "Choose a photo, please");
                    res.redirect("/photos/add");
                } else if(err instanceof Error)
                    {
                        console.log("Error HERE");
                        req.flash("error_msg", "Only png/jpg/jpeg are allowed");
                        res.redirect("/photos/add");
                    } else 
                    {
                        
                        next();
                    }
                
        });
    
});

router.post('/add', ensureAuthenticated, function (req, res, next) 
{
    var mmm = require("mmmagic"),
    Magic = mmm.Magic;

    let magic = new Magic(mmm.MAGIC_MIME_TYPE);
    PHOTO_DIR = "../public/photoset";
    req.fileNameWithLocation = path.join(__dirname, PHOTO_DIR, req.uniqueName);
    magic.detectFile(req.fileNameWithLocation, function (err, mimeType) 
    {
        //if(err) throw err;

        const ALLOWED_TYPES = [
            "image/jpeg",
            "image/jpg",
            "image/png"
        ];
        
        if(!(ALLOWED_TYPES.includes(mimeType)))
        {
            fs.unlink(req.fileNameWithLocation);
            req.flash("error_msg", "Only png/jpg/jpeg are allowed");
            res.redirect("/photos");
        } else 
        {
            next();    
        }
    });
});

router.post('/add', ensureAuthenticated, (req, res) =>
{
    let pathToFile = "./photoset/"+req.uniqueName;
    const newPhoto = {
        title: req.body.title,
        imgLocation: pathToFile,
        user: req.user.id,
        isPhoto: true
    };
    new PhotoModel(newPhoto).save().then(() => {
        req.flash('success_msg', 'Post successfully added!');
    });

    res.redirect("/photos");
});

//Get photo form
router.get('/add', ensureAuthenticated, (req, res) => 
{
    res.render("photos/add_photos");
})

// View photos page
router.get('/', ensureAuthenticated, (req, res) => 
{
    PhotoModel.find({ user: req.user.id })
    .then((photos) => 
    {
        photos = photos.sort((a, b) => b.date - a.date);
        return res.render('photos/viewPhotos', {
            photos: photos
        });
    });
});

//Delete photo
router.delete('/:id', ensureAuthenticated, (req, res) => {
    PhotoModel.deleteOne({ _id: req.params.id }).then(() => {
        req.flash('success_msg', 'Photo successfully deleted!');
        res.redirect('/photos');
    })
});

//Edit photo title
router.put('/:id', ensureAuthenticated, (req, res) => {
    
    if(!req.body.title)
    {
        req.flash('error_msg', 'A title shouldn\'t be empty, no update happened');
        return res.redirect('/photos')
    } else 
    {
        PhotoModel.findOne({ _id: req.params.id }).then((photo) => 
        {
            if(photo.title == req.body.title)
            {
                return 0; 
            } else 
            {
                photo.title = req.body.title;
                photo.save(); 
                return 1;
            }
        })
        .then((success) => {
            if (success) {
                req.flash('success_msg', 'The title successfully updated!');
                res.redirect('/photos');
            } else 
            {
                req.flash('success_msg', 'Nothing to update!');
                res.redirect('/photos');   
            }
                
            });
    }
});


module.exports = router;