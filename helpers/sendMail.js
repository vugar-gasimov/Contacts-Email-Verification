const nodemailer = require("nodemailer");
require("dotenv").config();

const { META_PASSWORD } = process.env;
const config = {
  host: "smtp.meta.ua",
  port: 465,
  secure: true,
  auth: {
    user: "vugar5gasimov@meta.ua",
    pass: META_PASSWORD,
  },
};
const transport = nodemailer.createTransport(config);

const email = {
  to: "pedeye4623@wenkuu.com",
  from: "vugar5gasimov@meta.ua",
  subject: "Test email",
  html: "<p><strong>Test email Salam</strong> from localhost:3000</p>",
};

transport
  .sendMail(email)
  .then(() => console.log("Email send successfully"))
  .catch((error) => console.log(error.message));
