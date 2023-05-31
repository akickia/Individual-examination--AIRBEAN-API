const express = require('express');
const app = express();
const {usersDb, beansDb, cartDb, guestOrdersDb} = require('./modules/db')
const { checkBody, existingUser, checkToken } = require('./middleware');
const { createToken } = require('./modules/auth')
const jwt = require('jsonwebtoken')

const moment = require('moment')
const orderMade = moment();


app.use(express.json());

app.get('/api/beans', async (request, response) => {
    const getBeans = await beansDb.find({});
    console.log(getBeans);
    response.send({ success: true, beans: getBeans });
});

app.get('/api/users', async (request, response) =>{
    const getUsers = await usersDb.find({});
    response.send({success: true, users: getUsers});
});

// newUser = {
// username: username,
// email: email,
// password: password,
// adress: {
    //streetname: streetName,
    //zip code: zipCode,
    // city: city
    //}
    // orders: {
        //23489238
    //}
//}

//Sign up new user
app.post('/api/signup', checkBody, existingUser, async (request, response) => {
const newUser = request.body;
await usersDb.insert(newUser);
      response.send({ success: true, user: newUser});
});

//Login user
app.post('/api/login', async (request, response) => {
    const user = request.body;
    const existingUser = await usersDb.findOne({ username: user.username });
    if (existingUser) {
        if (existingUser.password === user.password) {
            const token = jwt.sign({id: existingUser._id}, 'a1b1c1', {
            expiresIn: 300 
            })
            response.json({success: true, message: "Welcome to AirBean!", token: token })
        }
        else {
            response.status(400).json({success: false, message: "Wrong password, try again"})
        }
    } else {
        response.status(400).json({ success: false, message: "User does not exist"});
    }
})
//Ev flytta till middleware senare efter vi lagt till token? 

//Add to cart
app.post('/api/cart/add', async (request, response) => {
    const product = request.body;
    const findProduct = await beansDb.findOne({id: product.id})
    console.log(findProduct.title, findProduct.price)
    //Check if findproduct.hasProperty("price") ? Kolla på handledning om nödvändigt.
    if (findProduct) {
        const newCartItem = {...findProduct, _id: new Date().getTime().toString()};
        cartDb.insert(newCartItem);
        response.send({success: true, message: "Product added to cart"})
    } else {
        response.status(400).send({success: false, message: "Something went wrong, please try again"})
    }
})

//AUT
app.put('/api/cart/sendorder', checkToken, async (request, response) => {
    const userId = request.body._id
    let productsInCart = await cartDb.find({})
    console.log(productsInCart)
    if (productsInCart.length > 0) { 
        await usersDb.update({_id: userId}, {$push: {orders: {items: productsInCart, date: orderMade.format()}}}, {})
        await cartDb.remove({}, {multi: true})
        response.json({success: true, message: "You order will be delivered " + orderMade.add(30, 'minutes').calendar() })
    } else {
        response.status(400).send({success: false, message: "No products in cart"})
    }
})

//AUT
app.get('/api/user/orderhistory', checkToken, async (request, response) => {
    const userId = request.body._id;
    const user = await usersDb.findOne({_id: userId});
    response.send({ success: true, orders: user.orders });
});

// newGuestUser = {
// name: name,
//lastname: lastName,
// email: email,
// password: password,
// adress: {
    //streetname: streetName,
    //zip code: zipCode,
    // city: city
    //}
    // orders: {
        //23489238
    //}
//}

app.post('/api/cart/sendguestorder', async (request, response) => {
    const guestOrder = request.body
    const productsInCart = await cartDb.find({})
    const newOrder = {
        guestUser: guestOrder,
        products: productsInCart,
        date: orderMade.format()
    }
    await guestOrdersDb.insert(newOrder)
    await cartDb.remove({}, {multi: true})
    response.json({success: true, newOrder: newOrder, message: "You order will be delivered " + orderMade.add(30, 'minutes').calendar()})
})

app.listen(8000, () =>{
    console.log('App started on port 8000!!');
});


