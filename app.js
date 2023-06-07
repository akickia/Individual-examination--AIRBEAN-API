const express = require('express');
const app = express();
const { menuDb } = require('./modules/db');
const cors = require('cors')
app.use(express.json());
app.use(cors({origin: "*"}))

//Adding routes
const adminRouter = require('./routes/admin');
app.use('/api/admin', adminRouter);
const userRouter = require('./routes/user');
app.use('/api/user', userRouter);
const cartRouter = require('./routes/cart');
app.use('/api/cart', cartRouter);

//Get a list of all items in menu
app.get('/api/beans', async (req, res) => {
  const getBeans = await menuDb.find({});
  if (getBeans.length > 0) {
    res.json({ success: true, beans: getBeans });
  } else {
    res.status(404).send({ success: false, error: 'No menu found, please try again' });
  }
});

//Start server at port 8000
app.listen(8000, () => {
  console.log('App started on port 8000');
});
