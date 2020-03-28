var nodemailer = require('nodemailer');
var crypto = require('crypto');

function token(email) {
    var secret = email.split("@");
    secret = secret[0] + Date.now();
    var hash = crypto.createHmac('sha256', secret)
        .update(secret[1])
        .digest('hex');
    return hash = hash.substr(20, 40);
}

function sendMail(mailOptions) {
    return new Promise(function (resolve, reject) {
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return reject(error);
            }
            return resolve(info);
        });
    });
}