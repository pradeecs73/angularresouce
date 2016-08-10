'use strict';

var config = require('meanio').loadConfig(),
	nodemailer = require('nodemailer'),
	Mailgen = require('mailgen');

var mailGenerator = new Mailgen({
	theme: 'salted',
	product: {
		name: 'Actsec Security Services',
		link: 'https://www.actsec.se/'
		// logo: 'https://mailgen.js/img/logo.png'
	}
});

function sendMail(mailOptions) {
	var transport = nodemailer.createTransport(config.mailer);
	transport.sendMail(mailOptions, function(err, response) {
		if (err) console.log( err);
	});
}

/**
 * Function to send mail automatically.
 * @param {string} body Mail body
 * @param {string} sendTo Reciever mail id
 */
module.exports = {
	mailService: function(body, sendTo) {
		var emailBody = mailGenerator.generate(body);
		var mailOptions = {
			to: sendTo,
			from: config.emailFrom,
			subject: body.subject,
			html: emailBody,
			createTextFromHtml: true
		};
		sendMail(mailOptions);
	}
};