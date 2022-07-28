const UserModel = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const idGeneration = require("nanoid");

const dotenv = require("dotenv");
dotenv.config();
const { PASSWORD_KEY } = process.env;
const PORT = process.env.PORT;

class User {
  async addNewUser(req, res, next) {
    const { email, password } = req.body;
    const avatarRandom = gravatar.url(email);
    try {
      const duplicateEmail = await UserModel.findOne({ email: email });
      if (duplicateEmail) {
        return res
          .status(400)
          .json({ message: "User not created, Email is dublicate", response: null });
      }
      const hashPassword = await bcrypt.hash(password, 12);
      const verificationToken = idGeneration();
      const user = new UserModel({
        email: email,
        password: hashPassword,
        avatarURL: avatarRandom,
        verificationToken: verificationToken,
      });
      await user.save();
      const massageVerify = {
        to: email,
        subject: "Подтвердите ваш emeil для регистрации на нашем сервере",
        html: `<a target='_blank' href='${PORT}/api/auth/verify/${verificationToken}'>Нажмите для подтверждения регистрации на нашем сайте: ${PORT}</a>`,
      };
      await sendEmail(massageVerify);
      return res.status(200).json({ message: "Verification send to email", response: user });
    } catch (error) {
      return res
        .status(404)
        .json({ message: "User not created, i am sorry try again", response: null, error: error });
    }
  }

  async userLogin(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await UserModel.findOne({ email: email });
      if (!user) {
        return res.status(400).json({ message: `User ${email} not found`, response: null });
      }
      if (!user.verify) {
        return res.status(400).json({ message: `User ${email} not verify`, response: null });
      }
      const isPassword = await bcrypt.compare(password, user.password);
      if (!isPassword) {
        return res.status(400).json({ message: `User ${email} not found`, response: null });
      }
      const token = jwt.sign({ id: user._id }, PASSWORD_KEY, { expiresIn: "30d" });
      const loginSuccesfull = await UserModel.findOneAndUpdate(
        { email: email },
        { token: token },
        { new: true }
      );
      return res.status(200).json({ message: "status 200", response: loginSuccesfull });
    } catch (error) {
      return res
        .status(404)
        .json({ message: `User ${req.body.email} not found`, response: null, error: error });
    }
  }

  async getCurentUser(req, res, next) {
    try {
      const user = await UserModel.findById({ _id: req.userId });
      if (!user) {
        return res.status(404).json({ message: `User not found`, response: null });
      }
      return res.status(200).json({ message: "status 200", response: user });
    } catch (error) {
      return res.status(404).json({ message: `User not found`, response: null, error: error });
    }
  }

  async logOutUser(req, res, next) {
    try {
      const user = await UserModel.findByIdAndUpdate(
        { _id: req.userId },
        { token: "" },
        { new: true }
      );
      if (!user) {
        return res.status(404).json({ message: `User not found`, response: null });
      }
      return res.status(200).json({ message: "status 200", response: user });
    } catch (error) {
      return res.status(404).json({ message: `User not found`, response: null, error: error });
    }
  }

  async verifyUser(req, res, next) {
    try {
      //   const user = await UserModel.findOne({ verificationToken: req.params.verificationToken });
      //   if (!user) {
      //     return res.status(404).json({ message: `User not found`, response: null });
      //   }
      //   const token = jwt.sign({ id: user._id }, PASSWORD_KEY, { expiresIn: "30d" }); // в качестве ключа возьму id юзера
      //   const userVerification = await UserModel.findOneAndUpdate(
      //     { verificationToken: req.params.verificationToken },
      //     { verify: true, token: token },
      //     { new: true }
      //   );
      return res.status(200).json({ message: "Verification success", response: userVerification });
    } catch (error) {
      return res.status(404).json({ message: `User not found`, response: null, error: error });
    }
  }

  async dubleVerifyUser(req, res, next) {
    try {
      //   const { email } = req.body;
      //   const user = await UserModel.findOne({ email: email });
      //   if (!user) {
      //     return res.status(404).json({ message: `User not found`, response: null });
      //   }
      //   if (user.verify) {
      //     return res
      //       .status(404)
      //       .json({ message: `Verification has already been passed`, response: null });
      //   }
      //   const massageVerify = {
      //     to: email,
      //     subject: "Подтвердите ваш emeil для регистрации на нашем сервере",
      //     html: `<a target='_blank' href='${PORT}/api/auth/verify/${user.verificationToken}'>Нажмите для подтверждения регистрации на нашем сайте: ${PORT}</a>`,
      //   };
      //   await sendEmail(massageVerify);
      return res
        .status(200)
        .json({ message: "Verification send to email", response: massageVerify });
    } catch (error) {
      return res.status(404).json({ message: `User not found`, response: null, error: error });
    }
  }
}

module.exports = new User();
