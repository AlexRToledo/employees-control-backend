const chai = require('chai'),
chaiHttp = require('chai-http'),
app = require('../../Bootstrapper');

// Configure chai
chai.use(chaiHttp);
chai.should();

describe("Login API", () => {
    describe("Login User", () => {    
        it("should make success auth login", (done) => {
             chai.request(app)
                 .post('/api/v1/auth/login')
                 .type('json')
                 .send({                    
                    'email': 'admin@control.com',
                    'password': 'root'
                  })
                 .end((err, res) => {                     
                     res.should.have.status(200);
                     res.body.should.be.a('object').have.property('error').to.equal(false);
                     done();
                  });
         });        
                 
        it("should make fail auth login", (done) => {
            chai.request(app)
                .post('/api/v1/auth/login')
                .type('json')
                .send({                    
                   'email': 'whatever@gmail.com',
                   'password': 'qwe'
                 })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object').have.property('error').to.equal(true);
                    done();
                 });
        }); 
    });
});