const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const uuid = require("uuid");

const { User } = require("../models/user");

const { CustomError, ctrlWrapper, sendEmail } = require("../helpers");

const { SECRET_KEY, BASE_URL } = process.env;

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const signup = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw CustomError(409, "This email already exists");
  }
  const hashedPassword = await bcrypt.hash(password, 11);
  const avatarUrl = gravatar.url(email);

  const verificationToken = uuid.v4();

  const newUser = await User.create({
    ...req.body,
    password: hashedPassword,
    avatarUrl,
    verificationToken,
  });

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${verificationToken}" >Click verify email</a>`,
  };

  await sendEmail(verifyEmail);

  res.status(201).json({
    email: newUser.email,
    name: newUser.name,
  });
};

const verifyEmail = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });
  if (!user) {
    throw CustomError(404, "Invalid code or expired link");
  }
  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: "",
  });
  res.json({
    message: "Email verification was successful.",
  });
};

const resendVerifyEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw CustomError(404, "Email not found");
  }
  if (user.verify) {
    throw CustomError(403, "This account has already been verified");
  }
  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${user.verificationToken}" >Click verify email</a>`,
  };
  await sendEmail(verifyEmail);
  res.status(204).json({
    message: "Verification of email was successful",
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw CustomError(401, "You email or password is invalid.");
  }

  if (!user.verify) {
    throw CustomError(401, "Email is not verified");
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw CustomError(401, "You email or password is invalid.");
  }
  const payload = {
    id: user._id,
  };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "11h" });
  await User.findByIdAndUpdate(user._id, { token });
  res.json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
      name: user.name,
    },
  });
};

const getCurrent = async (req, res) => {
  const { email, name, subscription, updatedAt } = req.user;
  res.json({
    email,
    name,
    subscription,
    updatedAt,
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  const user = await User.findByIdAndUpdate(_id, { token: null });
  if (!user) {
    throw CustomError(404, "User not found");
  }
  res.json({ message: "Logout successful" });
};

const updateSubscription = async (req, res) => {
  const { _id: userId } = req.user;
  const { subscription: newSubscription } = req.body;
  const validSubscriptions = ["starter", "pro", "business"];
  if (!validSubscriptions.includes(newSubscription)) {
    return res.status(400).json({ message: "Invalid subscription type" });
  }
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { subscription: newSubscription },
    { new: true }
  );
  if (!updatedUser) {
    throw CustomError(404, "User not found");
  }
  const { name, email, subscription, avatarUrl, token, updatedAt } =
    updatedUser;
  res.json({
    message: "Subscription updated successfully",
    user: { name, email, subscription, avatarUrl, token, updatedAt },
  });
};

const updateAvatar = async (req, res) => {
  const { _id, name, email, subscription, updatedAt } = req.user;
  const { path: tempUpload, originalname } = req.file;
  const filename = `${_id}_${originalname}`;
  const resultUpload = path.join(avatarsDir, filename);
  await fs.rename(tempUpload, resultUpload);
  const avatarUrl = path.join("avatars", filename);
  const updatedUser = await User.findByIdAndUpdate(_id, { avatarUrl });
  if (!updatedUser) {
    throw CustomError(404, "User not found");
  }
  res.json({
    message: "Avatar downloaded successfully",
    user: { name, email, subscription, avatarUrl, updatedAt },
  });
};

module.exports = {
  signup: ctrlWrapper(signup),
  verifyEmail: ctrlWrapper(verifyEmail),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  updateSubscription: ctrlWrapper(updateSubscription),
  updateAvatar: ctrlWrapper(updateAvatar),
};
