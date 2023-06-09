const { Router } = require('express');
const router = Router();
const { usersDb, guestOrdersDb, cartDb, menuDb } = require('../modules/db');
const { checkToken, checkBodyUserId, checkBodyGuestOrder, checkBodyProductId } = require('../modules/middleware');
const moment = require('moment');

//Get items in cart
router.get('/order', async (req, res) => {
  const seCart = await cartDb.find({})
  if (seCart) {
    res.json({ success: true, cart: seCart })
  } else {
    res.status(404).send({ success: false, error: "No items in cart" })
  }
})

//Add to cart
//Expected input in body:
//{ id: productid }
//Middleware to check input in body
//Check if product exist, then add to cart database
//Add date as product id to avoid conflicts with same id when ordering same item more than once
router.post('/add', checkBodyProductId, async (req, res) => {
  const product = req.body;
  const findProduct = await menuDb.findOne({ id: product.id });
  if (findProduct) {
    const newCartItem = {
      ...findProduct,
      _id: new Date().getTime().toString(),
    };
    cartDb.insert(newCartItem);
    res.send({ success: true, message: `${findProduct.title} added to cart` });
  } else {
    res.status(404).send({ success: false, error: 'Product does not exist, please try again' });
  }
});

//Remove product from cart
//Expected input in body:
//{ id: productid }
//Middleware to check input in body
//Check if product exist, then remove from cart database
router.delete('/remove', checkBodyProductId, async (req, res) => {
  const product = req.body;
  const findProduct = await cartDb.findOne({ id: product.id });
  if (findProduct) {
    cartDb.remove({ id: product.id });
    res.send({ success: true, message: `Product ${product.title} has been removed from the cart` });
  } else {
    res.status(404).send({ success: false, error: 'No such product, please try again' });
  }
}
);

//Send user order
//Expected input in body:
//{ id: user id }
//Add token in header as authorization
//Middleware to check input in body + if token is valid 
//Check if user id exist and if there are any products in cart
//Add products in cart to user together with date and total sum of order
//Empty cart and return when order will arrive + order value
router.put('/sendorder', checkToken, checkBodyUserId, async (req, res) => {
  const userId = req.body._id;
  const user = await usersDb.findOne({ _id: userId });
  let productsInCart = await cartDb.find({});
  timeStamp = moment();
  if (user) {
    if (productsInCart.length > 0) {
      const totalSum = productsInCart.reduce((sum, product) => {
        return sum + product.price;
      }, 0);
      await usersDb.update({ _id: userId }, { $push: {
            orders: {
              items: productsInCart,
              date: timeStamp.format(),
              totalPricePerOrder: totalSum,
              isDelivered: false,
            },
          },}, {});
      await cartDb.remove({}, { multi: true });
      res.json({ success: true, message: 'You order will be delivered ' + timeStamp.add(30, 'minutes').calendar() + ' and the price will be: ' + totalSum + ' kr' });
    } else {
      res.status(404).send({ success: false, error: 'No products in cart, please try again' });
    }
  } else {
    res.status(401).send({ success: false, error: 'The user does not exist. Please try again!' });
  }
});

//Send guest order
//Expected input in body:
//{ name: name, email: email, adress: { streetname: streetName, zipcode: zipCode, city: city } }
//Middleware to check input in body
//Check if there are any products in cart
//Add products in cart and guestuser to guestorder database together with date and total sum of order
//Empty cart and return when order will arrive + order value
router.post('/sendguestorder', checkBodyGuestOrder, async (req, res) => {
  const guestOrder = req.body;
  const productsInCart = await cartDb.find({});
  timeStamp = moment();
  if (productsInCart.length > 0) {
    const overallSum = productsInCart.reduce((sum, order) => {
      return sum + order.price;
    }, 0);
    const newOrder = {
      guestUser: guestOrder,
      products: productsInCart,
      date: timeStamp.format(),
      totalSum: overallSum,
    };
    await guestOrdersDb.insert(newOrder);
    await cartDb.remove({}, { multi: true });
    res.json({ success: true, newOrder: newOrder, message: 'You order will be delivered ' + timeStamp.add(30, 'minutes').calendar() + ' and the price will be: ' + overallSum + ' kr' });
  } else {
    res.status(404).send({ success: false, error: 'No products in cart, please try again' });
  }
});

module.exports = router;
