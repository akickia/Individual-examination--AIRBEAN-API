const { Router } = require('express')
const router = Router()
const jwt = require('jsonwebtoken')
const { checkBodyLogin, checkBodyAddProduct, checkAdminToken } = require('../modules/middleware')
const { menuDb, usersDb } = require('../modules/db')
const moment = require('moment')
let timeStamp = moment();

router.get('/users', async (request, response) => {
  const getAdmin = await usersDb.find({role: "admin"})
  if(getAdmin.length > 0) {
    response.json({success: true, users: getAdmin})
  } else {
    response.status(400).send({ success: false, message: "Something went wrong, please try again"})
  }
})

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

router.get('/seeproducts', async (req, res) => {
  res.send ({ success: true })
})

module.exports = router