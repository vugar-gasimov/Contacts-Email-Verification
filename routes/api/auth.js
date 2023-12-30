const express = require("express");
const ctrl = require("../../controllers/auth");
const { validateBody, authenticator, upload } = require("../../middlewares");
const { schemas } = require("../../models/user");

const router = express.Router();

router.post("/signup", validateBody(schemas.signupSchema), ctrl.signup);

router.get("/verify/:verificationCode", ctrl.verifyEmail);

router.post(
  "/verify",
  validateBody(schemas.emailSchema),
  ctrl.resendVerifyEmail
);

router.post("/login", validateBody(schemas.loginSchema), ctrl.login);
router.get("/current", authenticator, ctrl.getCurrent);
router.post("/logout", authenticator, ctrl.logout);
router.patch("/updateSubscription", authenticator, ctrl.updateSubscription);
router.patch(
  "/avatars",
  authenticator,
  upload.single("avatar"),
  ctrl.updateAvatar
);

module.exports = router;
