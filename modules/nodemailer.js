import nodemailer from 'nodemailer';

let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_LOGIN,
        pass: process.env.EMAIL_PASSWORD
    }
});

export default transporter;
