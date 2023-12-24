/* eslint-disable import/no-extraneous-dependencies */
import nodemailer from 'nodemailer';

const email = process.env.MAIL_USERNAME;
const password = process.env.MAIL_PASSWORD;

export const transporter = nodemailer.createTransport({
  host: 'mail.privateemail.com',
  port: 587,
  auth: {
    user: email,
    pass: password,
  },
});

export const mailOptions = {
  from: email,
  to: email,
};
