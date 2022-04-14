const mail_library = require('../mail_library');
const config = require('../cong.js') 
const sendemail = (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  const name = req.query.name;
  const email = req.query.email;
  const url = config.clienturl;
  const myemail = "prestosolvo@gmail.com";
  if(!name || !email){
    return res.status(500).send({err : 'Please provide name and email id.'});
  }
  else{
    options = { name: name, link: url, myemail:myemail};
    mail_library.pslfInvite(email, options, (response) => {
        return res.status(200).send({status : "mail sent"});
        // console.log(res);
    }, (err) => {
        return res.status(500).send({status : "mail not sent"});
        // console.log(err);
    });
  }
}

module.exports.sendemail = sendemail;