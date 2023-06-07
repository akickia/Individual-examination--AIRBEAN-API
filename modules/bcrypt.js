const bcrypt = require('bcrypt')

async function createHashedPassword(password) {
  const hashed = await bcrypt.hash(password, 10)
  return hashed
}

async function checkHashedPassword(password, hashed) {
  const isMatch = await bcrypt.compare(password, hashed)
  return isMatch
}

module.exports = {createHashedPassword, checkHashedPassword}