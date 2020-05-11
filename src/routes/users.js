const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');

//Login page
router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login', (req, res, next) => {
    var errors = [];

    if (!req.body.email)
        errors.push({ textError: 'Email required' });

    if (!req.body.password)
        errors.push({ textError: 'Password required' });


    if (errors.length > 0) 
    {
        res.render("users/login",
            {
                errors: errors,
                email: req.body.email
            })
    }
    else
    {
        passport.authenticate('local', { 
            successRedirect: '/posts',
            failureRedirect: '/users/login',
            failureFlash: true
        })(req, res, next)
    }
});

require('../models/Users');
const Users = mongoose.model('users');

//Register page
router.get('/register', (req, res) => res.render("users/register"));

router.post('/register', (req, res) => 
{
    var errors = [];

    if (!req.body.name)
        errors.push({ textError: 'Name required' });

    if (!req.body.email)
        errors.push({ textError: 'Email required' });

    if (!req.body.password)
        errors.push({ textError: 'Password required' });

    if (req.body.password.length < 4)
        errors.push({ textError: 'Password must be more than 4 characters' });

    if (!req.body.confirm_password)
        errors.push({ textError: 'Password confirmation required' });

    if (req.body.password !== req.body.confirm_password)
        errors.push({ textError: 'Passwords do not match' });


    if (errors.length > 0) {
        res.render("users/register",
            {
                errors: errors,
                input_data: req.body
            })
    }
    else {
        Users.findOne({ email: req.body.email })
            .then((user) => 
            {
                if (user) 
                    {
                        req.flash("error_msg", "Email with this e-mail already exists");
                        res.redirect('/users/register')
                    } 
                else 
                    {
                        var salt = bcrypt.genSaltSync(10);
                        var hash = bcrypt.hashSync(req.body.password, salt);
                
                        const newUser = new Users({
                            name: req.body.name,
                            email: req.body.email,
                            password: hash
                        })
                
                        new Users(newUser).save().then(() => 
                        {
                            res.redirect('/users/login');
                        });

                    }
            })
            .catch(err => console.log(err))
        


    }
});

router.get('/logout', (req, res) => 
{
    req.logout();
    req.flash('success_msg', "You've logged out, see you soon ;)")
    res.redirect('/posts');
})

module.exports = router;