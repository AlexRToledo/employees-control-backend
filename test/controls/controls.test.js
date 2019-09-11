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
});