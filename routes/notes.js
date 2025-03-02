const express = require('express')
const router = express.Router()
const fetchuser = require('../middleware/fetchusers')
const Note = require('../models/Notes')
const { body, validationResult } = require('express-validator');
//Route 1 :get all the notes from the user: GET "/api/notes/fetchallnotes"
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes)

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})
//Route 2 :Add a new note using: POST "/api/notes/addnote"
router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 5 }),
    body('description', 'Enter description of atleast 5 characters').isLength({ min: 5 }),], async (req, res) => {
        try {
            const { title, description, tag } = req.body;//destructring
            const result = validationResult(req);
            if (!result.isEmpty()) {
                return res.status(400).json({ errors: result.array() });
            }
            const note = new Note({
                title, description, tag, user: req.user.id
            })
            const savedNote = await note.save()
            res.json(savedNote)

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    })
//Route 3 :update a  note using: PUT "/api/notes/updatenote"
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;

    try {
        //create a newNote object
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };
        //find the note to be update and update it
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("not found") }
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("not allowed")
        }
        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
        res.json({ note });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})
//Route 4 :Delete a  note using: DELETE "/api/notes/deletenote"
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        //find the note to be update and update it
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("not found") }
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("not allowed")
        }
        note = await Note.findByIdAndDelete(req.params.id);
        res.json({ "Success": "Note has been deleted", note: note });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }

})
module.exports = router