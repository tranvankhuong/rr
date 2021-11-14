const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const randomString = require("randomstring");
const userModel = require("../models/user.model");
const authServices = require("../services/auth.services");

const STATUS_VERIFY = process.env.STATUS_VERIFY || "verify";
const STATUS_ACTIVE = process.env.STATUS_ACTIVE || "active";
const STATUS_UPDATE = process.env.STATUS_UPDATE || "update";
const STATUS_DISABLED = process.env.STATUS_DISABLED ||"disabled"

const SECRET_KEY = process.env.SECRET_KEY || "HCMUSWEBNC";

const ROLE_LEARNER = process.env.ROLE_LEARNER || "learner";
const ROLE_LECTURER = process.env.ROLE_LECTURER || "lecturer";
const ROLE_ADMIN = process.env.ROLE_ADMIN || "admin";

router.get("/", (req, res) => {
  res.json({ hello: "hello from auth services" });
});
const loginSchema  = require('../schemas/login.schema.json')
router.post("/login",require('../middlewares/validate.mdw')(loginSchema), async (req, res) => {
  const user = await userModel.isExistByUsername(req.body.username);
  if (user === null) {
    return res.status(200).json({
      authenticated: "fail",
      message: "Username not exist! Try again",
    });
  }
  if (user.user_status === STATUS_DISABLED) {
    return res.status(200).json({
      authenticated: "disabled",
      message: "Your account is disabled by Admin. Contact them via Webnncq2017@gmail.com",
    });
  }
  if (!bcrypt.compareSync(req.body.password, user.user_password)) {
    return res.status(200).json({
      authenticated: "fail",
      message: "Wrong password! Try again",
    });
  }
  if (user.user_status === STATUS_VERIFY) {
    return res.status(200).json({
      authenticated: "verify",
      message: "Please verify your account! Try again",
    });
  }
 
  const payload = {
    user_id: user.user_id,
    user_username: user.user_username,
    user_email: user.user_email,
    user_role: user.user_role,
  };
  const opts = {
    expiresIn: 5 * 60,
  };
  const accessToken = jwt.sign(payload, SECRET_KEY, opts);
  const refreshToken = randomString.generate(128);
  await userModel.addRFTokenToDB(user.user_id, refreshToken);
  res.status(200).json({
    authenticated: "success",
    accessToken,
    refreshToken,
  });
});
router.post("/admin/login",require('../middlewares/validate.mdw')(loginSchema), async (req, res) => {
  const user = await userModel.isExistByUsername(req.body.username);
  if (user === null) {
    return res.status(200).json({
      authenticated: "fail",
      message: "Username not exist! Try again",
    });
  }
  if (!bcrypt.compareSync(req.body.password, user.user_password)) {
    return res.status(200).json({
      authenticated: "fail",
      message: "Wrong password! Try again",
    });
  }
  if (user.user_role !== ROLE_ADMIN) {
    return res.status(200).json({
      authenticated: "fail",
      message: "Your account is not admin account",
    });
  }

  const payload = {
    user_id: user.user_id,
    user_username: user.user_username,
    user_email: user.user_email,
    user_role: user.user_role,
  };
  const opts = {
    expiresIn: 5 * 60,
  };
  const accessToken = jwt.sign(payload, SECRET_KEY, opts);
  const refreshToken = randomString.generate(128);
  await userModel.addRFTokenToDB(user.user_id, refreshToken);
  res.status(200).json({
    authenticated: "success",
    accessToken,
    refreshToken,
  });
});
const registerSchema  = require('../schemas/register.schema.json')
router.post("/register",require('../middlewares/validate.mdw')(registerSchema), async (req, res) => {
  const user = req.body;
  console.log(user);
  const isExistUsername = await userModel.isExistByUsername(
    req.body.user_username
  );
  if (isExistUsername !== null) {
    return res.status(200).json({
      message: "username is created! try another username",
    });
  }
  const isExistEmail = await userModel.isExistByEmail(req.body.user_email);
  if (isExistEmail !== null) {
    return res.status(200).json({
      message: "email is exist! try another email",
    });
  }

  user.user_status = STATUS_VERIFY;
  user.user_role = ROLE_LEARNER;

  const otpCode = authServices.generateOTPCode();
  const otpToken = authServices.generateOTPToken(otpCode);
  //console.log(otpCode,otpToken,authServices.checkOTPValid(otpCode,otpToken));
  const result = await authServices.sendMail(req.body.user_email, otpCode);
  //console.log(result);
  user.user_accessotp = otpToken;
  user.user_password = bcrypt.hashSync(user.user_password, 10);
  const ret = await userModel.addNewUser(user);

  user.user_id = ret[0];
  delete user.user_password;
  delete user.user_accessotp;
  delete user.user_status;
  res.status(201).json({
    message: "Please verify your account",
    user: user,
  });
});
router.post("/lecturer-register", async (req, res) => {
  const user = req.body;
  //console.log(user);
  const isExistUsername = await userModel.isExistByUsername(
    req.body.user_username
  );
  if (isExistUsername !== null) {
    return res.status(200).json({
      message: "username is created! try another username",
    });
  }
  const isExistEmail = await userModel.isExistByEmail(req.body.user_email);
  if (isExistEmail !== null) {
    return res.status(200).json({
      message: "email is exist! try another email",
    });
  }

  user.user_status = STATUS_ACTIVE;
  user.user_role = ROLE_LECTURER;

  //console.log(result);
  user.user_password = bcrypt.hashSync(user.user_password, 10);
  const ret = await userModel.addNewUser(user);

  user.user_id = ret[0];
  delete user.user_password;
  delete user.user_status;
  res.status(201).json(user);
});
router.post("/admin-register", async (req, res) => {
  const user = req.body;
  //console.log(user);
  const isExistUsername = await userModel.isExistByUsername(
    req.body.user_username
  );
  if (isExistUsername !== null) {
    return res.status(200).json({
      message: "username is created! try another username",
    });
  }
  const isExistEmail = await userModel.isExistByEmail(req.body.user_email);
  if (isExistEmail !== null) {
    return res.status(200).json({
      message: "email is exist! try another email",
    });
  }

  user.user_status = STATUS_ACTIVE;
  user.user_role = ROLE_ADMIN;

  user.user_password = bcrypt.hashSync(user.user_password, 10);
  const ret = await userModel.addNewUser(user);

  user.user_id = ret[0];
  delete user.user_password;
  delete user.user_accessotp;
  delete user.user_status;
  res.status(201).json(user);
});
router.post("/verify", async (req, res) => {
  const { user_username, user_otp } = req.body;
  const user = await userModel.isExistByUsername(user_username);
  if (user === null) {
    return res.status(200).json({
      message: "User isn't exist in our services, pls register first",
    });
  }
  if (
    user.user_status !== STATUS_VERIFY &&
    user.user_status !== STATUS_UPDATE
  ) {
    return res.status(200).json({
      message: "Email was activated",
    });
  }
  if (!authServices.checkOTPValid(user_otp, user.user_accessotp)) {
    return res
      .status(200)
      .json({ message: "OTP expired/wrong, resend/check OTP again" });
  }
  await userModel.updateUserStatus(user.user_email, STATUS_ACTIVE);
  res
    .status(201)
    .json({ message: `Verifying ${user.user_email} successfully` });
});
router.post("/resend", async (req, res) => {
  const { user_username } = req.body;
  const user = await userModel.isExistByUsername(user_username);
  if (user === null) {
    return res.status(200).json({
      message: "User isn't exist in our services, pls register first",
    });
  }
  if (
    user.user_status !== STATUS_VERIFY &&
    user.user_status !== STATUS_UPDATE
  ) {
    return res.status(200).json({
      message: "Email had been activated",
    });
  }
  const otpCode = authServices.generateOTPCode();
  const otpToken = authServices.generateOTPToken(otpCode);
  //console.log(otpCode,otpToken,authServices.checkOTPValid(otpCode,otpToken));
  await userModel.addOTPTokenToDB(user.user_email, otpToken);
  const result = await authServices.sendMail(user.user_email, otpCode);
  res.status(201).json({ message: "OTP 's sent to your email! Check" });
});
router.post("/refresh", async (req, res) => {
  const { accessToken, refreshToken } = req.body;
  const decodedData = jwt.verify(accessToken, SECRET_KEY, {
    ignoreExpiration: true,
  });
  //console.log(decodedData.user_id);
  const ret = await userModel.isValidRFToken(decodedData.user_id, refreshToken);
  //console.log(ret);
  if (ret === true) {
    const payload = {
      user_id: decodedData.user_id,
      user_username: decodedData.user_username,
      user_email: decodedData.user_email,
      user_role: decodedData.user_role,
    };
    const newAccessToken = jwt.sign(payload, SECRET_KEY, {
      expiresIn: 5 * 60,
    });
    return res.json({
      accessToken: newAccessToken,
    });
  }

  return res.status(400).json({
    message: "Refresh token is revoked!",
  });
});
module.exports = router;
