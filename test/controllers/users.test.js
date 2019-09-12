const chai = require('chai'),
chaiHttp = require('chai-http'),
app = require('../../Bootstrapper');

// Configure chai
chai.use(chaiHttp);
chai.should();

describe("Users API", () => {
    describe("GET Users", () => {    
        it("should make success get all users", (done) => {
             chai.request(app)
                 .post('/api/v1/auth/login')
                 .type('json')
                 .send({                    
                    'email': 'admin@control.com',
                    'password': 'root'
                  })
                 .end((err, res) => {                                                                           
                     chai.request(app)
                        .get('/api/v1/users')
                        .set('Authorization', 'Bearer ' + res.body.data.token)                        
                        .end((err, res) => {                                            
                            res.should.have.status(200);
                            res.body.should.be.a('object').have.property('error').to.equal(false);
                            res.body.should.be.a('object').have.property('data').have.property('users').to.be.an.instanceof(Array);
                            done();
                        });                     
                  });
         });

         it("should make fail with bad token get all users", (done) => {
            chai.request(app)
                .post('/api/v1/auth/login')
                .type('json')
                .send({                    
                   'email': 'admin@control.com',
                   'password': 'root'
                 })
                .end((err, res) => {                                                                           
                    chai.request(app)
                       .get('/api/v1/users')
                       .set('Authorization', 'Bearer ' + 'res.body.data.token')                        
                       .end((err, res) => {                                            
                           res.should.have.status(403);
                           res.body.should.be.a('object').have.property('error').to.equal(true);                           
                           done();
                       });                     
                 });
        });
    });
    describe("POST users", () => {    
        it("should make success create user", (done) => {
             chai.request(app)
                 .post('/api/v1/auth/login')
                 .type('json')
                 .send({                    
                    'email': 'admin@control.com',
                    'password': 'root'
                  })
                 .end((err, res) => {                                                                           
                     chai.request(app)
                        .post('/api/v1/users/create')
                        .set('Authorization', 'Bearer ' + res.body.data.token)
                        .send({                    
                            'username': 'test',
                            'email': 'test@test.com',
                            'isadmin': false,
                            'password': 'root',
                            'passwordConfirm': 'root',
                          })                        
                        .end((err, res) => {        
                            console.log(res.body)                                    
                            res.should.have.status(200);
                            res.body.should.be.a('object').have.property('error').to.equal(false);
                            res.body.should.be.a('object').have.property('message').to.equal("The record was created succesful.");
                            done();
                        });                     
                  });
         });
        
         it("should make fails without param in body create user", (done) => {
            chai.request(app)
                .post('/api/v1/auth/login')
                .type('json')
                .send({                    
                   'email': 'admin@control.com',
                   'password': 'root'
                 })
                .end((err, res) => {                                                                           
                    chai.request(app)
                       .post('/api/v1/users/create')
                       .set('Authorization', 'Bearer ' + res.body.data.token) 
                       .send({                    
                        'email': 'test@test.com',
                        'isadmin': false,
                        'password': 'root'                        
                      })                        
                       .end((err, res) => {                                                                    
                           res.should.have.status(422);
                           res.body.should.be.a('object').have.property('error').to.equal(true);
                           res.body.should.be.a('object').have.property('msg').to.be.an.instanceof(Array);                           
                           done();
                       });                     
                 });
        });
    });
    describe("Edit Users", () => {    
        it("should make success edit user", (done) => {
             chai.request(app)
                 .post('/api/v1/auth/login')
                 .type('json')
                 .send({                    
                    'email': 'admin@control.com',
                    'password': 'root'
                  })
                 .end((err, res) => {                                                                           
                     chai.request(app)
                        .put('/api/v1/users/edit/2')
                        .set('Authorization', 'Bearer ' + res.body.data.token)
                        .send({                                                
                            'email': 'test2@test.com',                                                        
                          })                        
                        .end((err, res) => {                                            
                            res.should.have.status(200);
                            res.body.should.be.a('object').have.property('error').to.equal(false);
                            res.body.should.be.a('object').have.property('message').to.equal("The record was updated succesful.");
                            done();
                        });                     
                  });
         });
        
         it("should make fails without param id in url edit user", (done) => {
            chai.request(app)
                .post('/api/v1/auth/login')
                .type('json')
                .send({                    
                   'email': 'admin@control.com',
                   'password': 'root'
                 })
                .end((err, res) => {                                                                           
                    chai.request(app)
                       .put('/api/v1/users/edit')
                       .set('Authorization', 'Bearer ' + res.body.data.token) 
                       .send({                                                
                            'email': 'test2@test.com',                            
                        })                        
                       .end((err, res) => {                                                                     
                           res.should.have.status(404);                                                      
                           done();
                       });                     
                 });
        });

        it("should make fails without param existing id in db edit control", (done) => {
            chai.request(app)
                .post('/api/v1/auth/login')
                .type('json')
                .send({                    
                   'email': 'admin@control.com',
                   'password': 'root'
                 })
                .end((err, res) => {                                                                           
                    chai.request(app)
                       .put('/api/v1/users/edit/100')
                       .set('Authorization', 'Bearer ' + res.body.data.token) 
                       .send({                                                
                        'email': 'test2@test.com',                            
                    })                        
                       .end((err, res) => {                                                                      
                           res.should.have.status(200);  
                           res.body.should.be.a('object').have.property('error').to.equal(false);
                           res.body.should.be.a('object').have.property('data');                                                                               
                           done();
                       });                     
                 });
        });
    });
    describe("DELETE Users", () => {    
        it("should make success delete user", (done) => {
             chai.request(app)
                 .post('/api/v1/auth/login')
                 .type('json')
                 .send({                    
                    'email': 'admin@control.com',
                    'password': 'root'
                  })
                 .end((err, res) => {                                                                           
                     chai.request(app)
                        .delete('/api/v1/users/remove')
                        .set('Authorization', 'Bearer ' + res.body.data.token)
                        .send({                                                
                            'id': 2,
                          })                        
                        .end((err, res) => {                                            
                            res.should.have.status(200);
                            res.body.should.be.a('object').have.property('error').to.equal(false);
                            res.body.should.be.a('object').have.property('message').to.equal("The record was removed succesful.");
                            done();
                        });                     
                  });
         });
        
         it("should make fails without param id in body delete user", (done) => {
            chai.request(app)
                .post('/api/v1/auth/login')
                .type('json')
                .send({                    
                   'email': 'admin@control.com',
                   'password': 'root'
                 })
                .end((err, res) => {                                                                           
                    chai.request(app)
                       .delete('/api/v1/users/remove')
                       .set('Authorization', 'Bearer ' + res.body.data.token) 
                       .send({                    
                                                        
                        })                        
                       .end((err, res) => {                                                                    
                           res.should.have.status(422);
                           res.body.should.be.a('object').have.property('error').to.equal(true);
                           res.body.should.be.a('object').have.property('msg').to.be.an.instanceof(Array);                           
                           done();
                       });                     
                 });
        });
    });
});