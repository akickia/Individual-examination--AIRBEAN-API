const express = require('express');
const app = express();
const { usersDb, menuDb } = require('./modules/db')



const moment = require('moment')

app.use(express.json());

const adminRouter = require("./routes/admin")
app.use("/api/admin", adminRouter)
const userRouter = require("./routes/user")
app.use("/api/user", userRouter)
const cartRouter = require("./routes/cart")
app.use("/api/cart", cartRouter)

//Get a list of all items in menu
app.get('/api/beans', async (request, response) => {
    const getBeans = await menuDb.find({});
    response.json({ success: true, beans: getBeans });
});


















  
//Start server at port 8000
app.listen(8000, () => {
    console.log('App started on port 8000!');
});
