const { response } = require('express');
const express = require('express');
const app = express();
const nedb = require('nedb-promise');
const { checkBody } = require('./middleware');
const beansDb = new nedb({ filename: 'beans.db', autoload: true });
const usersDb = new nedb({ filename: 'users.db', autoload: true });

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
//}

app.post('/api/signup', checkBody, async (request, response) => {
    const newUser = request.body;
    const existingUser = await usersDb.findOne(user => user.username === newUser.username || user.email === newUser.email);

    if (existingUser) {
        console.log(existingUser);
        response.status(400).json({ success: false, message: "Username or email already exists, please try to login or request new password" });
    } else {
        await usersDb.insert(newUser);
        response.send({ success: true, user: newUser});
    }
});

app.listen(8000, () =>{
    console.log('App started on port 8000!!');
});
