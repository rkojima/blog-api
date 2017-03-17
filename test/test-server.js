const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');
const {BlogPosts} = require('../models');

const should = chai.should();

chai.use(chaiHttp);

describe('Blog API', function() {   
    
    before(function() {
        return runServer();
    });

    beforeEach(function() {
        BlogPosts.posts = [];
    });

    after(function() {
        return closeServer();
    });

    it('should show new post on POST', function() {
        const testBlogPost = {
            title: 'A Test',
            content: 'Here is a test for blog posting.',
            author: 'test'
        };

        return chai.request(app)
        .post('/blog-posts')
        .send(testBlogPost)
        .then(function(res) {
            res.should.have.status(201);
            res.should.be.json;
            res.body.should.be.a('object');
            res.body.should.include.keys('id', 'title', 'content', 'author');
            res.body.id.should.not.be.null;
            res.body.should.deep.equal(Object.assign(testBlogPost, {id: res.body.id}, {publishDate: res.body.publishDate}));
        });
    });

    it('should list all blog posts on GET', function() {
        //using BlogPost model instead of router to test routers 
        BlogPosts.create('GET TEST', 'Testing GET router', 'Tester');
        return chai.request(app)
        .get('/blog-posts')
        .then(function(res) {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('array');
            const expectedKeys = ['id', 'title', 'content', 'author'];
            res.body.forEach(function(item) {
                item.should.be.a('object');
                item.should.include.keys(expectedKeys);
            });
            console.log('There are this many posts: ' + BlogPosts.posts.length);
        });
    });

    it('should show edited post on PUT', function() {
        const post = BlogPosts.create('PUT TEST', 'Testing PUT router', 'Tester');
            return chai.request(app)
                .put(`/blog-posts/${post.id}`)
                // .send used to send a modified post, something different that what's at top
                .send({
                    id: post.id,
                    title: 'PUT TEST MODIFIED',
                    content: 'Test if PUT actually modified a post',
                    author: post.author,
                })
            .then(function(res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.deep.equal({
                    "author": "Tester",
                    "content": "Test if PUT actually modified a post",
                    "id": post.id,
                    "publishDate": post.publishDate,
                    "title": "PUT TEST MODIFIED"
                });
            });
    });

    it('should disappear on DELETE', function() {
        const post = BlogPosts.create('DELETE TEST', 'Testing DELETE router', 'Tester');
        return chai.request(app)
            .delete(`/blog-posts/${post.id}`)
            .then(function(res) {
                res.should.have.status(204);
            });
    });
});