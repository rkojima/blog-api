const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {Blog} = require('./models');

const app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());

app.get('/blog-posts', (req, res) => {

  Blog
    .find()
    .exec()
    .then(blogs => {
      res.json({
        blogs: blogs.map(
          (blog) => blog.apiRepr())
      });
      console.log('Here');
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: "Internal server error"});
      });
});

app.get('/blog-posts/:id', (req, res) => {
  Blog
    .findById(req.params.id)
    .exec()
    .then(blogPost => res.json(blogPost.apiRepr()))
    .catch(err => {
      console.log(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

app.post('/blog-posts', (req, res) => {
  
  const requiredFields = ['title', 'content', 'author'];
  requiredFields.forEach(field => {
    if(!(field in req.body)) {
      const message = `Missing ${field} in body`;
      console.error(message);
      return res.status(400).send(message);
    }
  });
  Blog.create({
    title: req.body.title,
    content: req.body.content,
    author: req.body.author
  })
  .then(
    blog => res.status(201).json(blog.apiRepr()))
  .catch(err => {
    res.status(500).json({message: 'Internal server error'});
  });
});

app.put('/blog-posts/:id', (req, res) => {
  if(req.params.id != req.body.id) {
    const message = `IDs are not matching`;
    console.error(message);
    return res.status(400).send(message);
  }

  const toUpdate = {};
  const updateableFields = ['title', 'content', 'author'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  Blog
  .findByIdAndUpdate(req.params.id, {$set: toUpdate})
  .exec()
  .then(blog => {
    if(blog === null) {
      const message = "Could not find blog post matching the ID";
      return res.status(404).send(message);
    }
    res.status(204).end();
  })
  .catch(err => res.status(500).json({
    message: 'Internal server error',
    description: err
  }));
});

app.delete('/blog-posts/:id', (req, res) => {
  Blog.findById(req.params.id).remove()
  .then(
    res.status(204).end()
    );
});

let server;

function runServer(databaseUrl = DATABASE_URL, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
});
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log(`Closing server`);
      server.close((err) => {
        if(err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

// like `runServer`, this function also needs to return a promise.
// `server.close` does not return a promise on its own, so we manually
// create one.

if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};