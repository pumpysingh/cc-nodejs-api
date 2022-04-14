var express = require('express');
var app = express();
const routes = require('./Routes')
const bodyParser = require('body-parser')
const config = require('./cong')
const jwt = require('jsonwebtoken');
const router = express.Router()

routes.Not_Authenticate(router)
var cors = require('cors')
app.use(cors())
app.use(bodyParser.json())
app.use('/api', router)

router.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.headers['authorization'];
  // decode token
  if (token) {

      console.log("Token ", token);
      // verifies secret and checks exp
      jwt.verify(token, config.token_secret, function(err, decoded) {
          if (err) {
              console.log("Token error ", err.name);
              if(err.name == "TokenExpiredError"){
                  // refresh the token
                  return res.status(403).send({
                      success: false,
                      message: 'Failed to authenticate token.'
                  });
              }
              else{
                return res.status(403).send({
                    success: false,
                    message: 'Failed to authenticate token.'
                });
              }
          } else {
              // if everything is good, save to request for use in other routes
              req.decoded = decoded;
              next();
          }
      });

  } else {

      // if there is no token
      // return an error
      return res.status(403).send({
          success: false,
          message: 'No token provided.'
      });

  }

});

routes.Authenticate(router);
routes.ClientAuthenticate(router);

process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.log('UNHANDLED REJECTION! error...');
    process.exit(1);
});

process.on('uncaughtException', function (err) {
    console.error((new Date).toUTCString() + ' error uncaughtException:', err.message)
    console.error(err.stack)
    process.exit(1)
})

var server = app.listen(config.port, function() {

    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)

})

server.setTimeout(10 * 60 * 1000); // 10 mins
