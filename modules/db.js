//Create databases

const nedb = require('nedb-promise');
const beansDb = new nedb({ filename: 'beans.db', autoload: true });
const usersDb = new nedb({ filename: 'users.db', autoload: true });
const cartDb = new nedb({ filename: 'cart.db', autoload: true });
const guestOrdersDb = new nedb({ filename: 'guestorders.db', autoload: true })

module.exports = {usersDb, beansDb, cartDb, guestOrdersDb}