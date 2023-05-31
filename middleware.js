const {usersDb} = require('./modules/db');
const jwt = require('jsonwebtoken')

function checkBody(request, response, next) {
  const newUser = request.body;
  if (
    newUser.hasOwnProperty("username") &&
    newUser.hasOwnProperty("email") &&
    newUser.hasOwnProperty("password") &&
    newUser.adress.hasOwnProperty("streetname") &&
    newUser.adress.hasOwnProperty("zipcode") &&
    newUser.adress.hasOwnProperty("city") 
  ) {
    next();
  } else {
    response.status(400).json({ success: false, error: 'Please enter the missing value/s' });
  }
}


async function existingUser (request, response, next) {
  const { username, email } = request.body
  const existingUser = await usersDb.findOne({ $or: [{ username: username }, { email: email }] });
  if (existingUser && existingUser.username === username) {
      response.status(400).json({ success: false, message: "Username already exists, please try to login or request new password" });
   } else if (existingUser && existingUser.email === email) {
      response.status(400).json({ success: false, message: "Email already exists, please try to login or request new password" });
  } else {
      next();
  }
}

function checkToken (request, response, next) {
  const token = request.headers.authorization
  try {
    const data = jwt.verify(token, 'a1b1c1')
    console.log(data)
    next()
  } catch (error) {
    response.json({success: false, error: 'Invalid token'})
  }
}


module.exports = { checkBody, existingUser, checkToken }