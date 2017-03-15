const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const should = chai.should();

chai.use(chaiHttp);

describe('Blog API', function() {   
    
    before(function() {
        return runServer();
    });

    after(function() {
        return closeServer();
    });

    it('should list all blog posts on GET', function() {
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
        });
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

    it('should show edited post on PUT', function() {
        const testBlogPost = {
            title: 'A PUT Test',
            content: 'Here is a test for editing blog post.',
            author: 'PUT'
        };

        return chai.request(app)
            .get('/blog-posts')
            .then(function(res) {
                testBlogPost.id = res.body[0].id;
                return chai.request(app)
                    .put(`/blog-posts/${testBlogPost.id}`)
                    .send(testBlogPost);
            })
            .then(function(res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.deep.equal(Object.assign(testBlogPost, {publishDate: res.body.publishDate}));
            });
    });

    it('should disappear on DELETE', function() {
        return chai.request(app)
            .get('/blog-posts')
            .then(function(res) {
                return chai.request(app) 
                .delete(`/blog-posts/${res.body[0].id}`);
            })
            .then(function(res) {
                res.should.have.status(204);
            });
    });
});