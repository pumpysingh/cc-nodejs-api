var nodeMailer = require("nodemailer");
var ejs = require('ejs');
const Email = require('email-templates');
const fs = require('fs');

var transporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'prestosolvo@gmail.com',
        pass: 'sculptsoft'
    }
});

const DISPAYEMAIL = "no-reply@prestosolvo.com";

module.exports.pslfInvite = (emailaddress, locals, success, failure) => {
    var template = fs.readFileSync('./emails/pslf/html.ejs', { encoding: 'utf-8' });
    var subjecttemp = fs.readFileSync('./emails/pslf/subject.ejs', { encoding: 'utf-8' });
    var html = ejs.render(template, locals);
    var subject = ejs.render(subjecttemp, locals);
    const email = new Email({
        message: {
            from: DISPAYEMAIL,
            html: html,
            subject: subject
        },
        // uncomment below to send emails in development/test env:
        send: true,
        preview: false,
        transport: transporter
    });


    email
        .send({
            message: {
                to: emailaddress
            }
        })
        .then(res => {
            success(res);
        })
        .catch(err => {
            failure(err);
        });

};