var express = require('express');
var router = express.Router();
var mysql = require('mysql2');
var bcrypt = require('bcrypt');
const bodyParser = require("body-parser")
router.use(bodyParser.json());
const session = require('express-session');
const User = require('../model/user');
const { Store, Session } = require('express-session');
const MySQLStore = require('express-mysql-session');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.static(__dirname + '/public'));
var cookieSession = require('cookie-session');
var sessions;
var passport = require('passport')
router.use(passport.initialize());
router.use(passport.session());
var authorized = false
/*var options = {
  host: 'localhost',
  user: 'root',
  password: "760517Gg",
  database: "newskill",
};

var sessionStore = new MySQLStore(options);


router.use(
  cookieSession({
    name: 'session',
    keys: new keyGrip(['key1', 'key2'], 'SHA384', 'base64'),
    store: sessionStore,
    resave: false,
    saveUninitialized: false
  })
)*/





function getMySQLConnection() {
  return mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "760517Gg",
    database: "newskill"
  });
}




router.get('/register', function (req, res, next) {
  res.render('register', { title: "Registartion" });
});


router.post('/register', async (req, res, next) => {
  let name = req.body.username;
  let email = req.body.email;
  let trypassword = req.body.password;


  let regularExpressino = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;

  if (!regularExpressino.test(trypassword)) {
    return false;
  }

  try {
    const salt = await bcrypt.genSalt();

    let password = await bcrypt.hash(trypassword, salt);

    var connection = getMySQLConnection();
    connection.connect();

    let output = new User({
      "username": name,
      "email": email,
      "password": password
    });

    connection.query(
      `INSERT INTO users(username,email,password) VALUES (?,?,?)`,
      [name, email, password],

      function (err, results) {
        if (err) console.log(err);
        console.log(results);
      }
    );

    res.render('login');
    console.log(output)

  } catch {
    res.status(500).send()
  }

});

router.get('/login', function (req, res, next) {
  res.render('login', { title: "Login" });
});

router.post('/login', async (req, res, next) => {
  let email2 = req.body.email;
  let password2 = req.body.password;



  var connection = getMySQLConnection();
  connection.connect();


  connection.query("SELECT * FROM users WHERE email = ?", [email2], async function (error, results, fields) {
    if (error) throw error;

    if (results.length <= 0) {
      return res.render('login');
    }

    bcrypt.compare(password2, results[0].password, function (err, result) {
      if (!result) {
        return res.render('login')
      }else {
        res.redirect('/users/main')
      }

      


      /*var randomNumber = Math.random().toString();
      randomNumber = randomNumber.substring(2, randomNumber.length);
      res.cookie('cookieName', randomNumber, { maxAge: 900000, httpOnly: true });
      console.log('cookie created successfully');*/

    });

  
    req.session.isLoggedin = true;
    sessions = req.session;
    sessions.userid = results[0].username;
    console.log(req.session);

    req.session.save()
    authorized = true
  })
   

   
});


router.get('/index', function (req, res, next) {
  if (req.session.isLoggedin = true && sessions != undefined) {
    res.render('index', { title: `Welcome ${sessions.userid}` })
  } else {
    res.redirect('/users/login')
  }

});



router.get('/logout', function(req, res, next) {
  authorized = false;
  sessions = undefined;
  req.session.destroy((err) => {
    res.clearCookie('connect.sid');
    // Don't redirect, just print text
    console.log(req.session);
    res.redirect('/users/main');
  });
});



router.get('/main', function (req, res, next) {
  res.render('main', {authorized:authorized})
});





module.exports = router;


