const chai = require('chai'),
chaiHttp = require('chai-http'),
app = require('../../Bootstrapper');

// Configure chai
chai.use(chaiHttp);
chai.should();

describe("Controls API", () => {
    describe("GET Controls", () => {    
        it("should make success get all controls", (done) => {
             chai.request(app)
                 .post('/api/v1/auth/login')
                 .type('json')
                 .send({                    
                    'email': 'admin@control.com',
                    'password': 'root'
                  })
                 .end((err, res) => {                                                                           
                     chai.request(app)
                        .get('/api/v1/controls')
                        .set('Authorization', 'Bearer ' + res.body.data.token)                        
                        .end((err, res) => {                                            
                            res.should.have.status(200);
                            res.body.should.be.a('object').have.property('error').to.equal(false);
                            res.body.should.be.a('object').have.property('data').have.property('controls').to.be.an.instanceof(Array);
                            done();
                        });                     
                  });
         });
        
         it("should make fail with bad token get all controls", (done) => {
            chai.request(app)
                .post('/api/v1/auth/login')
                .type('json')
                .send({                    
                   'email': 'admin@control.com',
                   'password': 'root'
                 })
                .end((err, res) => {                                                                           
                    chai.request(app)
                       .get('/api/v1/controls')
                       .set('Authorization', 'Bearer ' + 'res.body.data.token')                        
                       .end((err, res) => {                                            
                           res.should.have.status(403);
                           res.body.should.be.a('object').have.property('error').to.equal(true);                           
                           done();
                       });                     
                 });
        });
    });

    describe("POST Controls", () => {    
        it("should make success create control", (done) => {
             chai.request(app)
                 .post('/api/v1/auth/login')
                 .type('json')
                 .send({                    
                    'email': 'admin@control.com',
                    'password': 'root'
                  })
                 .end((err, res) => {                                                                           
                     chai.request(app)
                        .post('/api/v1/controls/create')
                        .set('Authorization', 'Bearer ' + res.body.data.token)
                        .send({                    
                            'day': new Date(),
                            'arrivals': new Date(),
                            'departures': new Date(),
                            'users_id': 1,
                          })                        
                        .end((err, res) => {                                            
                            res.should.have.status(200);
                            res.body.should.be.a('object').have.property('error').to.equal(false);
                            res.body.should.be.a('object').have.property('message').to.equal("The record was created succesful.");
                            done();
                        });                     
                  });
         });
        
         it("should make fails without param in body create control", (done) => {
            chai.request(app)
                .post('/api/v1/auth/login')
                .type('json')
                .send({                    
                   'email': 'admin@control.com',
                   'password': 'root'
                 })
                .end((err, res) => {                                                                           
                    chai.request(app)
                       .post('/api/v1/controls/create')
                       .set('Authorization', 'Bearer ' + res.body.data.token) 
                       .send({                    
                            'day': new Date(),
                            'arrivals': new Date(),
                            'departures': new Date(),                            
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
    describe("Edit Controls", () => {    
        it("should make success edit control", (done) => {
             chai.request(app)
                 .post('/api/v1/auth/login')
                 .type('json')
                 .send({                    
                    'email': 'admin@control.com',
                    'password': 'root'
                  })
                 .end((err, res) => {                                                                           
                     chai.request(app)
                        .put('/api/v1/controls/edit/1')
                        .set('Authorization', 'Bearer ' + res.body.data.token)
                        .send({                                                
                            'arrivals': new Date(),
                            'departures': new Date(),                            
                          })                        
                        .end((err, res) => {                                            
                            res.should.have.status(200);
                            res.body.should.be.a('object').have.property('error').to.equal(false);
                            res.body.should.be.a('object').have.property('message').to.equal("The record was updated succesful.");
                            done();
                        });                     
                  });
         });
        
         it("should make fails without param id in url edit control", (done) => {
            chai.request(app)
                .post('/api/v1/auth/login')
                .type('json')
                .send({                    
                   'email': 'admin@control.com',
                   'password': 'root'
                 })
                .end((err, res) => {                                                                           
                    chai.request(app)
                       .put('/api/v1/controls/edit')
                       .set('Authorization', 'Bearer ' + res.body.data.token) 
                       .send({                                                
                            'arrivals': new Date(),
                            'departures': new Date(),                            
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
                       .put('/api/v1/controls/edit/100')
                       .set('Authorization', 'Bearer ' + res.body.data.token) 
                       .send({                                                
                            'arrivals': new Date(),
                            'departures': new Date(),                            
                        })                        
                       .end((err, res) => {              
                           console.log(res.body)                              
                           res.should.have.status(200);  
                           res.body.should.be.a('object').have.property('error').to.equal(false);
                           res.body.should.be.a('object').have.property('data');                                                                               
                           done();
                       });                     
                 });
        });
    });
    describe("DELETE Controls", () => {    
        it("should make success delete control", (done) => {
             chai.request(app)
                 .post('/api/v1/auth/login')
                 .type('json')
                 .send({                    
                    'email': 'admin@control.com',
                    'password': 'root'
                  })
                 .end((err, res) => {                                                                           
                     chai.request(app)
                        .delete('/api/v1/controls/remove')
                        .set('Authorization', 'Bearer ' + res.body.data.token)
                        .send({                                                
                            'id': 1,
                          })                        
                        .end((err, res) => {                                            
                            res.should.have.status(200);
                            res.body.should.be.a('object').have.property('error').to.equal(false);
                            res.body.should.be.a('object').have.property('message').to.equal("The record was removed succesful.");
                            done();
                        });                     
                  });
         });
        
         it("should make fails without param id in body delete control", (done) => {
            chai.request(app)
                .post('/api/v1/auth/login')
                .type('json')
                .send({                    
                   'email': 'admin@control.com',
                   'password': 'root'
                 })
                .end((err, res) => {                                                                           
                    chai.request(app)
                       .delete('/api/v1/controls/remove')
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