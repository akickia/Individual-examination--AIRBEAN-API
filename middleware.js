const {usersDb} = require('./modules/db');
const jwt = require('jsonwebtoken')

function checkBody(request, response, next) {
  const newUser = request.body;
  if (
    (newUser.hasOwnProperty("username") && newUser.username.length !== 0) &&
    (newUser.hasOwnProperty("email") && newUser.email.length !== 0) &&
    (newUser.hasOwnProperty("password") && newUser.password.length !== 0) &&
    (newUser.adress.hasOwnProperty("streetname") && newUser.adress.streetname.length !== 0) &&
    (newUser.adress.hasOwnProperty("zipcode") && newUser.adress.zipcode.length !== 0) &&
    (newUser.adress.hasOwnProperty("city") && newUser.adress.city.length !== 0)  
  ) {
    next();
  } else {
    response.status(400).json({ success: false, error: 'Please enter the missing value/s' });
  }
}
function checkGuestBody(request, response, next) {
  const newUser = request.body;
  if (
    (newUser.hasOwnProperty("name") && newUser.name.length !== 0) &&
    (newUser.hasOwnProperty("email") && newUser.email.length !== 0) &&
    (newUser.adress.hasOwnProperty("streetname") && newUser.adress.streetname.length !== 0) &&
    (newUser.adress.hasOwnProperty("zipcode") && newUser.adress.zipcode.length !== 0) &&
    (newUser.adress.hasOwnProperty("city") && newUser.adress.city.length !== 0)  
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


module.exports = { checkBody, existingUser, checkToken, checkGuestBody }