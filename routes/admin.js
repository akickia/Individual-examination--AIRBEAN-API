const { Router } = require('express')
const router = Router()
const jwt = require('jsonwebtoken')
const { checkBodyLogin, checkBodyAddProduct, checkAdminToken, checkBodyProductId } = require('../modules/middleware')
const { menuDb, usersDb, campaignsDb } = require('../modules/db')
const moment = require('moment')
let timeStamp = moment();

router.post('/login', checkBodyLogin, async (request, response) => {
  const admin = request.body;
  const existingUser = await usersDb.findOne({ username: admin.username, role: "admin" });
  if (existingUser) {
      if (existingUser.password === admin.password) {
          const token = jwt.sign({ id: existingUser._id }, 'admin', {
              expiresIn: 3000
          })
          response.send({ success: true, message: "Welcome to AirBean! You are logged in as admin", token: token })
      }
      else {
          response.status(400).send({ success: false, message: "Wrong password, please try again" })
      }
  } else {
      response.status(400).send({ success: false, error: "User does not exist, please try again" });
  }
})

//Get a list of all users
router.get('/users', checkAdminToken, async (request, response) => {
  const getUsers = await usersDb.find({});
  if (getUsers.length > 0) {
    response.json({ success: true, users: getUsers });
  } else {
    response.status(400).send({ success: false, error: "No users found, please try again"})
  }
});

router.get('/admins', checkAdminToken, async (request, response) => {
  const getAdmin = await usersDb.find({role: "admin"})
  if(getAdmin.length > 0) {
    response.json({success: true, users: getAdmin})
  } else {
    response.status(400).send({ success: false, message: "No admins found, please try again"})
  }
})


router.post('/addproduct', checkAdminToken, checkBodyAddProduct, (req, res) => {
  const product = req.body;
  const newProduct = {
    id: product.id,
    title: product.title,
    desc: product.desc,
    price: product.price,
    createdAt: timeStamp.format()
  } 
  menuDb.insert(newProduct)
  res.json({ success: true, message: "Product added", newProduct})
})

router.put('/updateproduct', checkAdminToken, checkBodyAddProduct, async (request, response) => {
  const product = request.body
  const findProduct = await menuDb.findOne({ id: product.id });
  timeStamp = moment();
  if (findProduct) {
      const updatedProduct = {
        id: product.id,
        title: product.title,
        desc: product.desc,
        price: product.price,
        modifiedAt: timeStamp.format()
      }
        await menuDb.update({ id: product.id }, updatedProduct )
        response.json({ success: true, message: "The product has been updated", updatedProduct })
      } else {
          response.status(400).send({ success: false, error: "No such product, please try again" })
      }
})


router.delete('/remove', checkAdminToken, checkBodyProductId, async (req, res) => {
  const productId = req.body.id
  const product = await menuDb.findOne({ id: productId })
  console.log(product)
  if (product) {
    menuDb.remove({ id: productId })
    res.send({ success: true, message: `Product ${product.title} has been removed from the menu` })
  } else {
    res.status(400).send({ success: false, error: "No such product, please try again"})
  }
})

router.get('/campaigns', checkAdminToken, (req, res) => {
  const campaigns = campaignsDb.find({})
  if (campaigns.length > 0) {
    res.json({ success: true, campaigns})
  } else {
    res.status(404).send({ success: false, error: "No campaigns found"})
  }
})

router.post('/campaigns/add', async (req, res) => {
  const campaign = req.body

  await campaignsDb.insert(campaign)
  res.send({ success: true})
} )

router.delete('/campaigns/remove', async (req, res) => {
  const campaignId = req.body._id

  await campaignsDb.remove({_id: campaignId})
  res.send({ success: true })
} )

module.exports = router