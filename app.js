const express = require('express');
const app = express();
const nedb = require('nedb-promise');
const { checkBody } = require('./middleware');
const beansDb = new nedb({ filename: 'beans.db', autoload: true });
const usersDb = new nedb({ filename: 'users.db', autoload: true });
const cartDb = new nedb({ filename: 'cart.db', autoload: true });


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
app.post('/api/signup', checkBody, async (request, response) => {
    const newUser = request.body;
    const existingUser = await usersDb.findOne({ $or: [{ username: newUser.username }, { email: newUser.email }] });

    if (existingUser && existingUser.username === newUser.username) {
        response.status(400).json({ success: false, message: "Username already exists, please try to login or request new password" });

     } else if (existingUser && existingUser.email === newUser.email) {
        response.status(400).json({ success: false, message: "Email already exists, please try to login or request new password" });
    } else {
        await usersDb.insert(newUser);
        response.send({ success: true, user: newUser});
    }
});

//Login user
app.post('/api/login', async (request, response) => {
    const user = request.body;
    const existingUser = await usersDb.findOne({ $or: [{ username: user.username }]});
    if (existingUser) {
        response.send({ success: true,Message: "Welcome to beans", User: existingUser});
    } else {
        response.status(400).json({ success: false, message: "Wrong username or password, please try again!" });
    }
})

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

app.put('/api/cart/sendorder', async (request, response) => {
    const userId = request.body._id
    const user = await usersDb.findOne({_id: userId})
    console.log(user)
    
    // const orderMade = new Date();
    // let productsInCartWithDate = {...productsInCart, orderMade}

    let productsInCart = await cartDb.find({})
    await usersDb.update({_id: userId}, {$push: {orders: productsInCart}}, {})
    await cartDb.remove({}, {multi: true})
    response.json({success: true})
})

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

app.put('/api/cart/sendguestorder', async (request, response) => {
    const userId = request.body._id
    const user = await usersDb.findOne({_id: userId})
    console.log(user)
    console.log( "Hej ")
    const productsInCart = await cartDb.find({})
    await usersDb.update({_id: userId}, {$push: {orders: productsInCart}}, {})
    await cartDb.remove({}, {multi: true})
    response.json({success: true})
})

app.listen(8000, () =>{
    console.log('App started on port 8000!!');
});