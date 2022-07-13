const User = require('../models/Users')
const jwt = require('jsonwebtoken');
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: '', password: '' };

  
/*   //duplicate username
  if (err.index === 'username_1') {
    errors.username = 'This username is already taken';
    return errors;
  } */  
      // duplicate email error
      if (err.code === 11000) {
        errors.email = 'This email is already registered';
        return errors;
      } 
      
  // validation errors
  if (err.message.includes('user validation failed')) {
    // console.log(err);
    Object.values(err.errors).forEach(({ properties }) => {
      // console.log(val);
      //  console.log(properties);
      errors[properties.path] = properties.message;
    });
  }

  return errors;
}
// create json web token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, 'aeghprs secret key', {
    expiresIn: maxAge
  });
};

module.exports.signup_get = (req, res) => {
    res.render('signup');
  }
  
  module.exports.login_get = (req, res) => {
    res.render('login');
  }
  
  module.exports.signup_post = async (req, res) => {
    const {username,email,password}=req.body;
    try {
      const user = await User.create({ username,  email, password });
      const token = createToken(user._id)
      res.cookie('cookie',token,{httpOnly:true,maxAge:maxAge*1000})
      res.status(201).json(user);
      // console.log('user created')
    }
    
    catch(err) {
      const errors = handleErrors(err);
      res.status(400).json({ errors });
    }
  }
  
  module.exports.login_post = async (req, res) => {

    const { email, password } = req.body;

    try {
      const user = await User.login(email, password);
      const token = createToken(user._id);
      res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
      res.status(200).json({ user: user._id });
    } 
    catch (err) {
      const errors = handleErrors(err);
      res.status(400).json({ errors });
    }
  }
  module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
  }