const { Router } = require('express');
const router = Router();
const { usersDb } = require('../modules/db');
const { checkBodySignup, checkExistingUser, checkBodyLogin, checkToken, checkBodyUserId } = require('../modules/middleware');
const jwt = require('jsonwebtoken');
const { estimatedDelivery } = require('../modules/functions');
const { createHashedPassword, checkHashedPassword } = require('../modules/bcrypt');

//Sign up new user
//Expected input in body:
//{ username: username, email: email, password: password, adress: { streetname: streetName, zipcode: zipCode, city: city }}
//Middleware to check input in body + if username and email already exists
//Hash password and add user to user database
router.post('/signup', checkBodySignup, checkExistingUser, async (req, res) => {
  const userInput = req.body;
  const hashed = await createHashedPassword(userInput.password)
  const newUser = {
    username: userInput.username,
    email: userInput.email,
    password: hashed,
    adress: {
      streetname: userInput.adress.streetname,
      zipcode: userInput.adress.zipcod400e,
      city: userInput.adress.city,
    },
  };
  await usersDb.insert(newUser);
  res.json({ success: true, user: newUser });
});

//Login user
//Expected input in body:
//{ username: username, password: password }
//Middleware to check input in body
//Check if username and (hashed) password is correct, add json webtoken for a limited time
router.post('/login', checkBodyLogin, async (req, res) => {
  const user = req.body;
  const existingUser = await usersDb.findOne({ username: user.username });
  if (existingUser) {
    const correctPassword = await checkHashedPassword(user.password, existingUser.password)
    if (correctPassword) {
      const token = jwt.sign({ id: existingUser._id }, 'a1b1c1', {
        expiresIn: 300, //Seconds
      });
      res.send({ success: true, message: 'Welcome to AirBean! You are logged in', token: token, id: existingUser._id, username: existingUser.username, usermail: existingUser.email });
    } else {
      res.status(401).send({ success: false, error: 'Wrong password, please try again' });
    }
  } else {
    res.status(401).send({ success: false, error: 'User does not exist, please try again' });
  }
});

//Check token when page reloads
router.post('/checktoken', async (req, res) => {
  const userId = req.body._id;
  const existingUser = await usersDb.findOne({ _id: userId });
  const token = req.headers.authorization;
  try {
    const data = jwt.verify(token, 'a1b1c1');
    if (data.id === existingUser._id) {
      res.send({success: true, message: 'User logged in'})
    } else {
      res.json({ success: false, error: 'Invalid token for this user' });
    }
  } catch (error) {
    res.json({ success: false, error: 'Invalid token' });
  }
})

//See order history
//Expected input in body:
//{ id: user id }
//Add token in header as authorization
//Middleware to check input in body + if token is valid
//Check if user exist
//Check if order is delivered
//Return list of orders and total sum of all orders
router.post('/orderhistory', checkToken, checkBodyUserId, async (req, res) => {
  const userId = req.body._id;
  await estimatedDelivery(userId);
  const updatedUser = await usersDb.findOne({ _id: userId });
  if (updatedUser) {
    if (updatedUser.orders) {
      const overallSum = updatedUser.orders.reduce((sum, order) => {
        return sum + order.totalPricePerOrder;
      }, 0);
      res.json({ success: true, orders: updatedUser.orders, overallSum: overallSum, message: 'Totalsumma:  ' + overallSum + ' kr' });
    } else {
      res.status(404).send({ success: false, message: 'Inga ordrar gjorda ännu' });
    }
  } else {
    res.status(401).send({ success: false, error: 'The user does not exist, please try again!' });
  }
});

module.exports = router;
