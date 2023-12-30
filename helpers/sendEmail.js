const nodemailer = require("nodemailer");
require("dotenv").config();

const { META_PASSWORD } = process.env;

const transport = nodemailer.createTransport({
  service: "smtp.meta.ua",
  auth: {
    apiKey: META_PASSWORD,
  },
});

const sendEmail = async (data) => {
  const email = { ...data, from: "vuqar5qasimov@gmail.com" };
  await transport.sendMail(email);
  return true;
};

module.exports = sendEmail;
