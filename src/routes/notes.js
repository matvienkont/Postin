const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ensureAuthenticated } = require('../../helpers/auth');

//Load note model
require('../models/noteSchema');
const NoteModel = mongoose.model('note');

// View notes page
router.get('/', ensureAuthenticated, (req, res) => {
    NoteModel.find({ user: req.user.id })
    .then((notes) => {
        notes = notes.sort((a, b) => b.date - a.date);
        return res.render('notes/viewNotes', {
            notes: notes
        });
    });
});

// Add note
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('notes/add');
});

// Edit note
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    NoteModel.findOne({ _id: req.params.id }).then((note) => {
        if (note.user != req.user.id) 
        {
            req.flash('error_msg', 'Sorry, not authenticated :(');
            res.redirect('/notes')
        } else 
        {
            res.render('notes/edit', {
                note: note
            });
        }
    });
});

// Update note
router.put('/:id', ensureAuthenticated, (req, res) => {
    /* 
        note didn't change logic needed
     */
    NoteModel.findOne({ _id: req.params.id }).then((note) => 
    {
        note.title = req.body.title;
        note.details = req.body.details;
        note.save(); 
    })
    .then(() => {
            req.flash('success_msg', 'Note successfully updated!');
            res.redirect('/notes')
        });
});

//Delete note
router.delete('/:id', ensureAuthenticated, (req, res) => {
    NoteModel.deleteOne({ _id: req.params.id }).then(() => {
        req.flash('success_msg', 'Note successfully deleted!');
        res.redirect('/notes');
    })
});

//Process form
router.post('/', ensureAuthenticated, (req, res) => {
    let errors = [];
    if (!req.body.title) errors.push({ textError: 'Required title field is empty' });
    if (!req.body.details) errors.push({ textError: 'Required details field is empty' });

    if (errors.length > 0) {
        res.render('notes/add', {
            errors: errors,
            title: req.body.title,
            details: req.body.details
        });
    } else {
        const newNote = {
            title: req.body.title,
            details: req.body.details,
            user: req.user.id
        };
        new NoteModel(newNote).save().then(() => {
            req.flash('success_msg', 'Note successfully added!');
            res.redirect('/notes');
        });
    }
});

module.exports = router;