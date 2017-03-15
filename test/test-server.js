const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const should = chai.should();

chai.use(chaihttp);

describe('Blog API', function() {   
    
    before(function() {
        return runServer();
    });

    after(function() {
        return closeServer();
    });

    it('should list all blog posts on GET', function() {
        return chai.request(app)
        .get('/')
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
            auhtor: 'test'
        };

        return chai.request(app)
        .post('/')
        .send(testBlogPost)
        .then(function(res) {
            res.body.should.be.a('object');
        });
    });

    it('should show edited post on PUT', function() {
        const testBlogPost = {
            title: 'A PUT Test',
            content: 'Here is a test for editing blog post.',
            auhtor: 'PUT'
        };

        return chai.request(app)
            .get('/')
            .then(function(res) {
                testBlogPost.id = res.body[0].id;
                return chai.request(app)
                    .post(`/${testBlogPost.id}`)
                    .send(testBlogPost);
            })
            .then(function(res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.deep.equal(updateData);
            });
    });

    it('should disappear on DELETE', function() {
        return chai.request(app)
            .get('/')
            .then(function(res) {
                return chai.request(app) 
                .delete(`/${res.body[0].id}`);
            })
            .then(function(res) {
                res.should.have.status(204);
            });
    });
});