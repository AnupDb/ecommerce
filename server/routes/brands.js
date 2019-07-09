const express = require("express");
const router = express.Router();
const { Brand } = require("../models/brand");
const { auth } = require("../middleware/auth");
const { admin } = require("../middleware/admin");

router
  .route("/")
  .post(auth, admin, (req, res) => {
    const brand = new Brand(req.body);

    brand.save((err, doc) => {
      if (err) return res.json({ success: false, err });
      res.status(200).json({ success: true, brand: doc });
    });
  })
  .get((req, res) => {
    Brand.find({}, (err, brands) => {
      if (err) return res.status(400).send(err);
      res.status(200).send(brands);
    });
  });

module.exports = router;
