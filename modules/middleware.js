const { usersDb, menuDb } = require('./db');
const jwt = require('jsonwebtoken');

// ---------- TOKENS ----------
//Check if token is valid (user)
function checkToken(req, res, next) {
  const userId = req.body._id;
  const token = req.headers.authorization;
  try {
    const data = jwt.verify(token, 'a1b1c1');
    if (data.id === userId) {
      next();
    } else {
      res.status(401).json({ success: false, error: 'Invalid token for this user' });
    }
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
}

//Check if token is valid (admin)
function checkAdminToken(req, res, next) {
  const adminToken = req.headers.authorization;
  try {
    const data = jwt.verify(adminToken, 'admin');
    if (data) {
      next();
    } else {
      res.status(401).send({ success: false, error: 'Invalid token' });
    }
  } catch (error) {
    res.status(401).send({ success: false, error: 'Invalid token' });
  }
}

// ---------- BODY INPUT ----------
//Check if input in body is correct (add new user)
function checkBodySignup(req, res, next) {
  const newUser = req.body;
  const checkLength = Object.keys(newUser).length === 4;
  if (checkLength) {
    if (
      newUser.hasOwnProperty('username') &&
      newUser.username.length !== 0 &&
      newUser.hasOwnProperty('email') &&
      newUser.email.length !== 0 &&
      newUser.hasOwnProperty('password') &&
      newUser.password.length !== 0 &&
      newUser.adress.hasOwnProperty('streetname') &&
      newUser.adress.streetname.length !== 0 &&
      newUser.adress.hasOwnProperty('zipcode') &&
      newUser.adress.zipcode.length !== 0 &&
      newUser.adress.hasOwnProperty('city') &&
      newUser.adress.city.length !== 0
      ) {
        next();
    } else {
        res.status(400).send({ success: false, error: 'Wrong input, please try again' });
    }  
  } else {
    res.status(400).send({ success: false, error: 'Wrong input, please try again' });
  }
}

//Check if input in body is correct (user)
function checkBodyLogin(req, res, next) {
  const user = req.body;
  if (
    user.hasOwnProperty('username') &&
    user.username.length !== 0 &&
    user.hasOwnProperty('password') &&
    user.password.length !== 0
  ) {
    next();
  } else {
    res.status(400).send({ success: false, error: 'Wrong input, please try again' });
  }
}

//Check if input in body is correct (product id)
function checkBodyProductId(req, res, next) {
  const product = req.body;
  if (product.hasOwnProperty('id') && product.id.length !== 0) {
    next();
  } else {
    res.status(400).send({ success: false, error: 'Wrong input, please try again' });
  }
}

//Check if input in body is correct (user id)
function checkBodyUserId(req, res, next) {
  const user = req.body;
  if (user.hasOwnProperty('_id') && user._id.length !== 0) {
    next();
  } else {
    res.status(400).send({ success: false, error: 'Wrong input, please try again' });
  }
}

//Check if input in body is correct (add guest order)
function checkBodyGuestOrder(req, res, next) {
  const newUser = req.body;
  const checkLength = Object.keys(newUser).length === 3;
  if (checkLength) {
    if (
      newUser.hasOwnProperty('name') &&
      newUser.name.length !== 0 &&
      newUser.hasOwnProperty('email') &&
      newUser.email.length !== 0 &&
      newUser.adress.hasOwnProperty('streetname') &&
      newUser.adress.streetname.length !== 0 &&
      newUser.adress.hasOwnProperty('zipcode') &&
      newUser.adress.zipcode.length !== 0 &&
      newUser.adress.hasOwnProperty('city') &&
      newUser.adress.city.length !== 0
      ) {
        next();
    } else {
      res.status(400).send({ success: false, error: 'Wrong input, please try again' });
    }
  } else {
    res.status(400).send({ success: false, error: 'Wrong input, please try again' });
  }
}

//ADMIN - Check if input in body is correct (add product)
function checkBodyAddProduct(req, res, next) {
  const newProduct = req.body;
  const checkLength = Object.keys(newProduct).length === 4;
  if (checkLength) {
    if (
      newProduct.hasOwnProperty('id') &&
      newProduct.id.length !== 0 &&
      newProduct.hasOwnProperty('title') &&
      newProduct.title.length !== 0 &&
      newProduct.hasOwnProperty('desc') &&
      newProduct.desc.length !== 0 &&
      newProduct.hasOwnProperty('price') &&
      newProduct.price.length !== 0
    ) {
      next();
    } else {
      res.status(400).send({ success: false, error: 'Wrong input, please try again' });
    }
  } else {
      res.status(400).send({ success: false, error: 'Wrong input, please try again' });
  }
}

//ADMIN - Check if input in body is correct (add campaign)
function checkBodyAddCampaign(req, res, next) {
  const newCampaign = req.body;
  const checkLength = Object.keys(newCampaign).length === 3;
  if (checkLength) {
    if (
      newCampaign.hasOwnProperty('name') &&
      newCampaign.name.length !== 0 &&
      newCampaign.hasOwnProperty('products') &&
      newCampaign.products.length !== 0 &&
      newCampaign.hasOwnProperty('price') &&
      newCampaign.price.length !== 0
      ) {
        next();
    } else {
      res.status(400).send({ success: false, error: 'Wrong input, please try again' });
    }
  } else {
    res.status(400).send({ success: false, error: 'Wrong input, please try again' });
  }
}


// ---------- CHECK EXISTING  ----------
//Check if username and email exist in db
async function checkExistingUser(req, res, next) {
  const { username, email } = req.body;
  const existingUser = await usersDb.findOne({ $or: [{ username: username }, { email: email }] });
  if (existingUser && existingUser.username === username) {
    res.status(400).send({ success: false, error: 'Username already exists, please try to login or require new password' });
  } else if (existingUser && existingUser.email === email) {
    res.status(400).send({ success: false, error: 'Email already exists, please try to login or require new password' });
  } else {
    next();
  }
}

//ADMIN - Check if products exist in db
async function checkCampaignProducts(req, res, next) {
  const products = req.body.products;
  let allProductsInDb = true;
  if (products && products.length >= 2) {
    for (const item of products) {
      let foundItem = await menuDb.findOne({ title: item });
      if (!foundItem) {
        allProductsInDb = false;
      }}
    if (allProductsInDb) {
      next();
    } else
      res.status(400).send({ success: false, error: 'At least one of your products does not exist in the menu, check your input and try again' });
  } else {
    res.status(400).send({ success: false, error: 'Add at least two products from menu, check your input and try again' });
  }
}


module.exports = {
  checkToken, checkAdminToken,
  checkBodySignup, checkBodyLogin, checkBodyProductId, checkBodyUserId, checkBodyGuestOrder,
  checkBodyAddProduct, checkBodyAddCampaign,
  checkExistingUser, checkCampaignProducts,
};
