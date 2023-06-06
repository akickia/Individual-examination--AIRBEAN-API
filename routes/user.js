const { Router } = require('express')
const router = Router()
const { usersDb } = require('../modules/db');
const { checkBodySignup, checkExistingUser, checkBodyLogin, checkToken, checkBodyUserId } = require('../modules/middleware');
const jwt = require('jsonwebtoken')
const { estimatedDelivery } = require('../modules/functions')

//Sign up new user 
//Expected input in body: 
//{
// username: username,
// email: email,
// password: password,
// adress: {
//streetname: streetName,
//zip code: zipCode,
// city: city
//}
//Middleware to check input in body + if username and email already exists
//if not - add user to user database
router.post('/signup', checkBodySignup, checkExistingUser, async (request, response) => {
  const userInput = request.body;
  const newUser = {
    username: userInput.username,
    email: userInput.email,
    password: userInput.password,
    adress: {
      streetname: userInput.adress.streetname,
      zipcode: userInput.adress.zipcode,
      city: userInput.adress.city    
    }
  }
  await usersDb.insert(newUser);
  response.json({ success: true, user: newUser });
});

//Login user
//Expected input in body: 
//{
// username: username,
// password: password
//}
//Middleware to check input in body 
//Check if username and password is correct, if so add json webtoken for a limited time
router.post('/login', checkBodyLogin, async (request, response) => {
  const user = request.body;
  const existingUser = await usersDb.findOne({ username: user.username });
  if (existingUser) {
      if (existingUser.password === user.password) {
          const token = jwt.sign({ id: existingUser._id }, 'a1b1c1', {
              expiresIn: 3000
          })
          response.send({ success: true, message: "Welcome to AirBean! You are logged in", token: token })
      }
      else {
          response.status(400).send({ success: false, message: "Wrong password, please try again" })
      }
  } else {
      response.status(400).send({ success: false, error: "User does not exist, please try again" });
  }
})

//See order history
//Expected input in body: 
//{ id: user id }
//Add token in header as authorization
//Middleware to check input in body 
//Middleware to check if token is valid
//Check if user exist
//Check if order is delivered
//Return list of orders and total sum of all orders 
router.get('/orderhistory', checkToken, checkBodyUserId, async (request, response) => {
  const userId = request.body._id;
  await estimatedDelivery(userId);
  const updatedUser = await usersDb.findOne({ _id: userId });
  if (updatedUser) {
      if (updatedUser.orders) {
          const overallSum = updatedUser.orders.reduce((sum, order) => {
              return sum + order.totalPricePerOrder;
          }, 0);
          response.json({ success: true, orders: updatedUser.orders, message: "The total price of all orders are: " + overallSum + " kr" });
      } else {
          response.status(400).send({ success: false, error: "No orders made yet!" });
      }
  } else {
      response.status(400).send({ success: false, error: "The user does not exist, please try again!" });
  }
});

module.exports = router