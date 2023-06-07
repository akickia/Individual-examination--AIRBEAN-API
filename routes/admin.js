const { Router } = require('express');
const router = Router();
const jwt = require('jsonwebtoken');
const { checkBodyLogin, checkBodyAddProduct, checkAdminToken,checkBodyProductId, checkBodyAddCampaign, checkCampaignProducts } = require('../modules/middleware');
const { menuDb, usersDb, campaignsDb } = require('../modules/db');
const moment = require('moment');
const { checkHashedPassword } = require('../modules/bcrypt');
let timeStamp = moment();

//Login admin
//Expected input in body:
//{ username: username, password: password }
//Middleware to check input in body
//Check if username, role and (hashed) password is correct, add json webtoken for a limited time
router.post('/login', checkBodyLogin, async (req, res) => {
  const admin = req.body;
  const existingUser = await usersDb.findOne({
    username: admin.username,
    role: 'admin',
  });
  if (existingUser) {
    const correctPassword = await checkHashedPassword(admin.password, existingUser.password)
    if (correctPassword) {
      const token = jwt.sign({ role: existingUser.role }, 'admin', {
        expiresIn: 3000,
      });
      res.send({ success: true, message: 'Welcome to AirBean! You are logged in as admin', token: token });
    } else {
      res.status(401).send({ success: false, error: 'Wrong password, please try again' });
    }
  } else {
    res.status(401).send({ success: false, error: 'User does not exist or does not have admin access, please try again' });
  }
});

//Get all users
//Middleware to check if token is valid
router.get('/users', checkAdminToken, async (req, res) => {
  const getUsers = await usersDb.find({});
  if (getUsers.length > 0) {
    res.json({ success: true, users: getUsers });
  } else {
    res.status(404).send({ success: false, error: 'No users found, please try again' });
  }
});

//Get all admins
//Middleware to check if token is valid
router.get('/admins', checkAdminToken, async (req, res) => {
  const getAdmin = await usersDb.find({ role: 'admin' });
  if (getAdmin.length > 0) {
    res.json({ success: true, users: getAdmin });
  } else {
    res.status(404).send({ success: false, error: 'No admins found, please try again' });
  }
});

//Add product to menu
//Expected input in body: 
//{ id: id, title: title, desc: desc, price: price }
//Middleware to check input in body + if token is valid
//Add new product to menu database along with date when created
router.post('/addproduct', checkAdminToken, checkBodyAddProduct, (req, res) => {
  const product = req.body;
  const newProduct = {
    id: product.id,
    title: product.title,
    desc: product.desc,
    price: product.price,
    createdAt: timeStamp.format(),
  };
  menuDb.insert(newProduct);
  res.json({ success: true, message: 'Product added', newProduct });
});

//Update product in menu
//Expected input in body: 
//{ id: id, title: title, desc: desc, price: price }
//Middleware to check input in body + if token is valid
//Check if product exist
//Update product to menu database along with date when modified
router.put('/updateproduct', checkAdminToken, checkBodyAddProduct, async (req, res) => {
    const product = req.body;
    const findProduct = await menuDb.findOne({ id: product.id });
    timeStamp = moment();
    if (findProduct) {
      const updatedProduct = {
        id: product.id,
        title: product.title,
        desc: product.desc,
        price: product.price,
        createdAt: findProduct.createdAt,
        modifiedAt: timeStamp.format(),
      };
      await menuDb.update({ id: product.id }, updatedProduct);
      res.json({ success: true, message: 'The product has been updated', updatedProduct });
    } else {
      res.status(404).send({ success: false, error: 'No such product, please try again' });
    }
  }
);

//Delete product in menu
//Expected input in body: 
//{ id: id }
//Middleware to check input in body + if token is valid
//Check if product exist
//Delete product from menu database
router.delete('/removeproduct', checkAdminToken, checkBodyProductId, async (req, res) => {
    const productId = req.body.id;
    const product = await menuDb.findOne({ id: productId });
    if (product) {
      menuDb.remove({ id: productId });
      res.send({ success: true, message: `Product ${product.title} has been removed from the menu` });
    } else {
      res.status(404).send({ success: false, error: 'No such product, please try again' });
    }
  }
);

//Get campaigns
//Middleware to check if token is valid
router.get('/campaigns', checkAdminToken, async (req, res) => {
  const campaigns = await campaignsDb.find({});
  if (campaigns.length > 0) {
    res.json({ success: true, campaigns });
  } else {
    res.status(404).send({ success: false, error: 'No campaigns found' });
  }
});

//Add new campaign
//Expected input in body: 
//{ name: name, products: [product.title, product.title], price: price }
//Middleware to check input in body + if token is valid
//Add new campaign to menu database along with dates that the campaign is valid
router.post('/campaigns/add', checkAdminToken, checkBodyAddCampaign, checkCampaignProducts, async (req, res) => {
    const campaign = req.body;
    const newCampaign = {
      name: campaign.name,
      products: campaign.products,
      price: campaign.price,
      valid: timeStamp.calendar() + ' to ' + timeStamp.add(30, 'days').calendar(),
    };
    await campaignsDb.insert(newCampaign);
    res.json({ success: true, newCampaign });
  }
);

//Delete campaign
//Expected input in body: 
//{ _id: id }
//Middleware to check if token is valid
//Delete product from menu database
router.delete('/campaigns/remove', checkAdminToken, async (req, res) => {
  const campaignId = req.body._id;
  const findCampaign = await campaignsDb.find({ _id: campaignId })
  console.log(findCampaign)
  if (findCampaign.length > 0) {
    await campaignsDb.remove({ _id: campaignId });
    res.send({ success: true, message: 'The campaign has been removed' });
  } else {
    res.status(404).send({ success: false, error: 'Something went wrong, please try again' });
  }
});

module.exports = router;
