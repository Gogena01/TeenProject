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
var isTeen = false;
var isCompany = false;
var id;

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

    res.render('socialMedia');
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
        return res.render('socialMedia')
      } else {
        res.redirect('/users/main')
      }


    });


    req.session.isLoggedin = true;
    sessions = req.session;
    sessions.username = results[0].username;
    console.log(req.session);

    req.session.save()
    authorized = true
  })



});


router.get('/index', function (req, res, next) {
  if (req.session.isLoggedin = true && sessions != undefined) {
    res.render('index', { title: `Welcome ${sessions.username}` })
  } else {
    res.redirect('/users/socialMedia')
  }

});



router.get('/logout', function (req, res, next) {
  authorized = false;
  isCompany = false;
  isTeen = false
  sessions = undefined;
  req.session.destroy((err) => {
    res.clearCookie('connect.sid');
    // Don't redirect, just print text
    console.log(req.session);
    res.redirect('/users/main');
  });
});



router.get('/main', function (req, res, next) {
  var connection = getMySQLConnection();
  connection.connect();
  connection.query('select count(*) as count from users as u join company_profile as cp on cp.companyId = u.id where username = ?', [req.session.username], async function (error, results, fields) {
    if (results[0].count > 0) {
      isCompany = true;
      res.render('main', { authorized: authorized, isCompany: isCompany });
    } else {
      isTeen = true;
      res.render('main', { authorized: authorized, isTeen: isTeen });
    }

  });

});



router.get('/teen', function (req, res, next) {
  res.render('teen', { isTeen: isTeen })
});

router.post('/teen', async (req, res, next) => {
  let name = req.body.username;
  let email = req.body.email;
  let trypassword = req.body.password;
  let firstName = req.body.firstName;
  let age = req.body.age;


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

    connection.query(`INSERT into users(username, email, password) VALUES(?, ?, ?)`, [name, email, password], async function (error, results, fields) {
      if (error) throw error;
      console.log(results)
      connection.query('INSERT into teen_profile( name, age, userId) VALUES(?, ?, ?)', [firstName, age, results.insertId]),
        function (err, results) {
          if (err) console.log(err);
          console.log(results);
        };
    });

    isTeen = true;
    res.render('login');
    console.log(output)

  } catch {
    res.status(500).send()
  }

  /*let firstName = req.body.firstName;
  let age = req.body.age;


  var connection = getMySQLConnection();
  connection.connect();

  connection.query(`SELECT id FROM users ORDER BY id DESC LIMIT 1`, async function (error, results, fields) {
    if (error) throw error;
    connection.query('INSERT into teen_profile( name, age, userId) VALUES(?, ?, ?)',[firstName, age, results[0].id])
  })

  isTeen = true;
  res.render('main')*/
});



router.get('/company', function (req, res, next) {
  res.render('company', { isCompany: isCompany })
});

router.post('/company', async (req, res, next) => {
  let company = req.body.companyName;
  let experience = req.body.experience;
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

    connection.query(`INSERT into users(username, email, password) VALUES(?, ?, ?)`, [name, email, password], async function (error, results, fields) {
      if (error) throw error;
      console.log(results)
      connection.query('INSERT into company_profile( company, experience, companyId) VALUES(?, ?, ?)', [company, experience, results.insertId]),
        function (err, results) {
          if (err) console.log(err);
          console.log(results);
        };
    });

    isCompany = true;
    res.render('login');
    console.log(output)

  } catch {
    res.status(500).send()
  }
});


router.get('/walkingDogs', function (req, res, next) {
  res.render('walkingDogs')
});

router.get('/babysitter', function (req, res, next) {
  res.render('babysitter')
});

router.get('/socialMedia', function (req, res, next) {
  res.render('socialMedia')
});

router.get('/offers', function (req, res, next) {
  var connection = getMySQLConnection();
  connection.connect();
  connection.query('SELECT * FROM offers', async function (error, results, fields) {
    if (error) throw error;
    //result.push({id:results[0].id, title:results[0].title, description:results[0].description})
    res.render('offers', {data:results})
    console.log(results[0].insertId)
  })
 
});

router.get('/single-offer/:id', function(req, res){
  let offerId = req.params.id

  var connection = getMySQLConnection();
  connection.connect();
  connection.query('SELECT * FROM offers where id = ?',[offerId], async function (error, results, fields) {
    if (error) throw error; 
    //result.push({id:results[0].id, title:results[0].title, description:results[0].description})
    res.render('single-offer', {data:results});
    console.log(results)    
  })
});


router.post('/addOffer', function (req, res, next) {
  const title = req.body.title;
  const description = req.body.description;
  const phone = req.body.phone
  var connection = getMySQLConnection();
  connection.connect();
  connection.query('INSERT into offers(title, description) VALUES(?, ?)', [title, description], async function (error, results, fields) {
    if (error) throw error;
    res.redirect('/users/offers')
    return;

  });

 
});



module.exports = router;


