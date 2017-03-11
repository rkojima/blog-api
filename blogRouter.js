const express = require('express');
const router = express.Router();

//To parse POST requests
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {BlogPosts} = require('./models');
//because the function require is returning an object, 
//we destructure it with this constant name BlogPosts 
//so that it matches with the key name in the object

//What we can do instead of this is to 
//const blog = require('./models').BlogPosts  
//which will return the same thing

router.get('/:id', (req, res) => {
    res.json(BlogPosts.get(req.params.id));
});

router.get('/', (req, res) => {
    res.json(BlogPosts.get());
});

router.post('/', jsonParser, (req, res) => {
    const requiredFields = ['title', 'content', 'author'];
    requiredFields.forEach(field => {
        if(!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    });
    const item = BlogPosts.create(req.body.title, req.body.content, req.body.author, req.body.publishDate);
    res.status(201).json(item);
});

router.delete('/:id', (req, res) => {
    BlogPosts.delete(req.params.id);
    console.log(`Deleted blog post ${req.params.title}`);
    res.status(204).end();
});

router.put('/:id', jsonParser, (req, res) => {
    const requiredFields = ['id', 'title', 'content', 'author'];
    requiredFields.forEach(field => {
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    });
    if (req.params.id != req.body.id) {
        const message = (
            `Request path id (${req.params.id}) and request body id ` + 
            `(${req.body.id}) must match`);
        console.error(message);
        return res.status(400).send(message);
    }
    const newPost = BlogPosts.update({
        'title': req.body.title,
        'content': req.body.content,
        'author': req.body.author,
        'id': req.params.id
    });
    res.status(200).json(newPost);
});

module.exports = router;