const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const router = require("./routes/brands");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();

mongoose.Promise = global.Promise;
mongoose.connect(process.env.DATABASE);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

//Models
const { User } = require("./models/user");

//Middleware
const { auth } = require("./middleware/auth");

app.get("/api/users/auth", auth, (req, res) => {
  res.status(200).json({
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    cart: req.user.cart,
    history: req.user.history
  });
});

//users
app.post("/api/users/register", (req, res) => {
  const user = new User(req.body);
  user.save((err, doc) => {
    if (err) return res.json({ success: false, err });

    res.status(200).json({ success: true });
  });

  res.status(200);
});

app.post("/api/users/login", async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user)
    return res.json({
      loginSuccess: false,
      message: "Auth failed,email not found"
    });
  user.comparePassword(req.body.password, (err, isMatch) => {
    if (!isMatch)
      return res.json({ loginSuccess: false, message: "wrong password" });

    user.generateToken((err, user) => {
      if (err) return res.status(400).send(err);
      res
        .cookie("w_auth", user.token)
        .status(200)
        .json({
          loginSuccess: true
        });
    });
  });
});

app.get("/api/user/logout", auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, doc) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
      success: true
    });
  });
});

app.use("/api/products/brands", router);

const port = process.env.PORT || 3002;

app.listen(port, () => {
  console.log(`Server running at ${port}`);
});
