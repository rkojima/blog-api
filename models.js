const mongoose = require('mongoose');

const blogSchema = mongoose.Schema({
  title: {type: String, required: true},
  content: {type: String, required: true},
  author: {
    firstName: {type: String, required: true},
    lastName: {type: String, required: true}
  },
  created: String
});

blogSchema.virtual('authorName').get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim();
});

blogSchema.methods.apiRepr = function() {
  return {
    id: this._id,
    title: this.title,
    author: this.authorName,
    content: this.content,
    created: this.created
  };
};

const Blog = mongoose.model('blogPost', blogSchema, 'blog-posts');
module.exports = {Blog};