const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const jwt_secret = "dance123"
const fetchuser=require('../middleware/fetchusers')
const { body, validationResult } = require('express-validator');
//Route-1 create a user:using POST-"/api/auth/createuser"-No login required
router.post(
  '/createuser',
  [
    body('name', 'Enter a valid name').isLength({ min: 2 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password').isLength({ min: 5 }),
  ],
  async (req, res) => { // Make handler async
    let success=false;
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
    //check whether the user with the same email id is there or not
    try {
      let user = await User.findOne({ email: req.body.email }); // Use await
      if (user) {
        return res.status(400).json({ success, error: 'Sorry, a user with this email already exists' });
      }
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);
      //create new user
      user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
      });
      const data = {
        user: {
          id: user.id
        }
      }
      const authtoken = jwt.sign(data, jwt_secret);
      success=true
      res.json({ success, authtoken });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success, error: 'Internal Server Error' });
    }
  })
//Route-2 Authenticate a user:using POST-"/api/auth/createuser"-No login required
router.post(
  '/login',
  [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'password cannot be blank').exists(),
  ],
  async (req, res) => { // Make handler async
    const result = validationResult(req);
    let success=false;
    if (!result.isEmpty()) {
      return res.status(400).json({success, errors: result.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email })
      if (!user) {
        return res.status(400).json({ success, error: "please try to login with correct credentials" });
      }
      const passwordcompare =await bcrypt.compare(password, user.password);
      if (!passwordcompare) {
        return res.status(400).json({ success, error: "please try to login with correct credentials" });
      }
      const data = {
        user: {
          id: user.id
        }
      }
      const authtoken = jwt.sign(data, jwt_secret);
      success=true;
      res.json({ success, authtoken });
    } catch (error) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  //Route-3 Get user detail:using POST-"/api/auth/getuser"-Login required
  router.post(
    '/getuser',fetchuser,async (req, res) => { // Make handler async
      try {
        userId=req.user.id;
        const user=await User.findById(userId).select("-password")
        res.send(user)
      } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
module.exports = router;
