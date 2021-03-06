"use strict";

const server = require('..');
const request = require('co-request');

var User = require('../libs/user');

function getURL(path){
    return `http://localhost:3000${path}`;
};

describe("User REST API", function(){

    let existingUserData = {
        email: "john@test.ru"
    };
    let newUserData = {
        email: "alice@test.ru"
    };
	let existingUser;

    beforeEach(function* (){
        // load fixtures
        yield User.remove({});
        existingUser = yield User.create(existingUserData);
    });

    describe("POST /users", function() {

        it("throws if email already exists", function*() {
            let response = yield request({
                method: 'post',
                url: getURL('/users'),
                json: true,
                body: existingUserData
            });
            response.statusCode.should.eql(400);
        });
        
        it("creates a user", function* (){
            let response = yield request({
                method: 'post',
                url: getURL('/users'),
                json: true,
                body: newUserData
            });
            response.body.email.should.exist;
        });

		it("throws if email not valid", function*() {
            let response = yield request({
                method: 'post',
                url: getURL('/users'),
                json: true,
                body: {email: "invalid"}
            });
            response.statusCode.should.eql(400);
        });

    });
	
	describe("GET /user/:userById", function() {
        it("gets the user by id", function* (){
            let response = yield request({
                method: 'get',
                getURL('/users/' + existingUser._id),
                json: true
            });
			response.body.email.should.exist;
			response.statusCode.should.eql(200);
			response.headers['content-type'].should.match(/application\/json/);
        });

        it("returns 404 if user does not exist", function*() {
            let response = yield request.get( getURL('/users/55b693486e02c26010ef0000') );
            response.statusCode.should.eql(404);
        });

        it("returns 404 if invalid id", function*() {
			let response = yield request.get( getURL('/users/kkkkk') );
            response.statusCode.should.eql(404);
        });
    });
	
	describe("DELETE /user/:userById", function() {
        it("removes user", function* (){
            let response = yield request.del( getURL('/users/' + existingUser._id) );
			response.statusCode.should.eql(200);
			let users = yield User.find({}).exec();
			users.length.should.eql(0);
        });

        it("returns 404 if the user does not exist", function*() {
            let response = yield request.del( getURL('/users/55b693486e02c26010ef0000') );
            response.statusCode.should.eql(404);
        });
    });
	
	it("GET /users gets all users", function* (){
		 let response = yield request.get( getURL('/users') );
		 response.statusCode.should.eql(200);
		 response.headers['content-type'].should.match(/application\/json/);
		 JSON.parse(response.body).length.should.eql(1);
    });
});