


function createToken(user) {
  let result = {
    success: false
}  
  
}



// router.post('/login', async (req, res) => {
//   const { username, password } = req.body;
//   //hitta användaren
//   const user = await findUser(username)
//   console.log(user)
//   const correctPassword = await comparePassword(password, user.password)
//   let result = {
//     success: false
//   }

//   if (correctPassword) {
//     result.success = true
//     //Create webtoken (jwt)
//     const token = jwt.sign({id: user._id}, 'a1b1c1', {
//       expiresIn: 60
//       //sekunder = 1 min, kan också använda typ 2d eller 3h
//     })
//     result.token = token
//   } else {
//     result.message = "Fel lösenord, försök igen!"
//   }

//   res.json(result)
// })

// router.post('/signup', async (req, res) => {
//   const { username, password } = req.body;
//   console.log(req.body)
//   const hashed = await hashPassword(password)
//   saveUser(username, hashed)
//   console.log(username, password)
//   res.json({success: true})
// })

// //verifiera token
// router.get('/verify', (req, res) => {
//   const token = req.headers.authorization
//   try {
//     const data = jwt.verify(token, 'a1b1c1')
//     console.log(data)
//     res.json({success: true})
//   } catch (error) {
//     res.json({success: false, error: 'Invalid token'})
//   }
// })


module.exports = { createToken }