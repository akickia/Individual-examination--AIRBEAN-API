const {usersDb} = require('./db');
const moment = require('moment')

async function estimatedDelivery(userId) {
  let currentTime = moment();
  const user = await usersDb.findOne({ _id: userId });
  if (user.orders) {
      for(const [index, element] of user.orders.entries()) {
          let deliveredTime = element.date;
          console.log(deliveredTime)
          let result =  currentTime.diff(deliveredTime, 'minutes');
          console.log(result);
          if (result >= 1 && !element.isDelivered) {
              await usersDb.update({ _id: userId }, { $set: { [`orders.${index}.isDelivered`]: true } });
          } 
      };
  }
}


module.exports =  { estimatedDelivery }