'use strict';
var config = require('meanio').loadConfig();
module.exports = {
    forgot_password_email: function(user, req, token, mailOptions) {
        mailOptions.html = ['Hi ' + user.name + ',', 'We have received a request to reset the password for your account.', 'If you made this request, please click on the link below or paste this into your browser to complete the process:', 'http://' + req.headers.host + '/reset/' + token, 'This link will work for 1 hour or until your password is reset.', 'If you did not ask to change your password, please ignore this email and your account will remain unchanged.'].join('\n\n');
        mailOptions.subject = 'Resetting the password';
        return mailOptions;
    },
    loginMailTemplate: function(obj) {
        var email = {
            body: {
                name: obj.firstname + ' ' + obj.lastname,
                intro: 'Welcome to ActSec Security Services! We are very excited to have you on board. ' + 'Your login credentials are ' + '</br>' + '<b>' + ' Email: ' + obj.email + '</br>' + 'Password: ' + obj.confirmationToken + '</b>' + '</br>' + 'To get started, please login with credentials send to you',
                action: {
                    button: {
                        color: 'green',
                        text: 'To login Click Here',
                        link: 'http://www.google.com'
                    }
                },
                outro: 'For any support email us on link actsec.support@gmail.com',
                signature: 'Best'
            },
            subject: "Login Confirmation"
        }
        return email;
    },
    userCredentialtemplate: function(req, obj, token) {
        var email = {
            body: {
                name: obj.firstname + ' ' + obj.lastname,
                intro: 'Welcome to ActSec Security Services! We are very excited to have you on board. ' + 'Your login credential are ' + '</br>' + '<b>' + ' Email: ' + obj.email + '</br>' + 'Password: ' + token + '</b>' + '</br>' + 'To get started, please login with credential send to you',
                action: {
                    button: {
                        color: 'green',
                        text: 'To login Click Here',
                        link: config.hostname + '/login'
                    }
                },
                outro: 'For any Supprot email us on link actsec.support@gmail.com',
                signature: 'Best'
            },
            subject: "Login Confirmation"
        }
        return email;
    }
};