const { Router } = require('express')
const router = Router()
const { usersDb, guestOrdersDb, cartDb } = require('../modules/db');
const { checkToken, checkBodyUserId, checkBodyGuestOrder, checkBodyProductId } = require('../modules/middleware');
const moment = require('moment')

//Add to cart
//Expected input in body: 
//{ id: productid }
//Middleware to check input in body 
//Check if product exist, then add to cart database
//Add date as product id to avoid conflicts with same id
router.post('/add', checkBodyProductId, async (request, response) => {
  const product = request.body;
  const findProduct = await menuDb.findOne({ id: product.id })
  if (findProduct) {
      const newCartItem = { ...findProduct, _id: new Date().getTime().toString() };
      cartDb.insert(newCartItem);
      response.send({ success: true, message: "Product added to cart" })
  } else {
      response.status(400).send({ success: false, error: "Product does not exist, please try again" })
  }
})

//Send user order
//Expected input in body: 
//{ id: user id }
//Add token in header as authorization
//Middleware to check input in body 
//Middleware to check if token is valid
//If token is valid - check if user id exist and there is products in cart
//If all is correct, add products in cart to user together with date and total sum of order
//Empty cart and return when order will arrive + order value
router.put('/sendorder', checkToken, checkBodyUserId, async (request, response) => {
  const userId = request.body._id;
  const user = await usersDb.findOne({ _id: userId });
  let productsInCart = await cartDb.find({});
  timeStamp = moment();
  if (user) {
      if (productsInCart.length > 0) {
          const totalSum = productsInCart.reduce((sum, product) => {
              return sum + product.price;
          }, 0);
          await usersDb.update({ _id: userId }, { $push: { orders: { items: productsInCart, date: timeStamp.format(), totalPricePerOrder: totalSum, isDelivered: false } } }, {})
          await cartDb.remove({}, { multi: true })
          response.json({ success: true, message: "You order will be delivered " + timeStamp.add(30, 'minutes').calendar() + " and the price will be: " + totalSum + " kr" })
      } else {
          response.status(400).send({ success: false, error: "No products in cart, please try again" })
      }
  } else {
      response.status(400).send({ success: false, message: "The user does not exist. Please try again!" });
  }
})




//Send guest order
//Expected input in body: 
//{
// name: name,
// email: email,
// adress: {
//streetname: streetName,
//zip code: zipCode,
// city: city
//}
//Middleware to check input in body 
//Check if there are products in cart
//If all is correct, add products in cart to guestorder database together with date and total sum of order
//Empty cart and return when order will arrive + order value
router.post('/sendguestorder', checkBodyGuestOrder, async (request, response) => {
  const guestOrder = request.body
  const productsInCart = await cartDb.find({})
  timeStamp = moment();

  if (productsInCart.length > 0) {
      const overallSum = productsInCart.reduce((sum, order) => {
          return sum + order.price;
      }, 0);
      const newOrder = {
          guestUser: guestOrder,
          products: productsInCart,
          date: timeStamp.format(),
          totalSum: overallSum
      }
      await guestOrdersDb.insert(newOrder)
      await cartDb.remove({}, { multi: true })
      response.json({ success: true, newOrder: newOrder, message: "You order will be delivered " + timeStamp.add(30, "minutes").calendar() + " and the price will be: " + overallSum + " kr" })
  } else {
      response.status(400).send({ success: false, error: "No products in cart, please try again" })
  }
})



module.exports = router