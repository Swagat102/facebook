const express = require("express");
const passport = require("passport");
const router = express.Router();
const userModal = require("./users");
const postModal = require("./post");

const { body, validationResult } = require("express-validator");

const data = new userModal()
const localStrategy = require("passport-local");
passport.use(new localStrategy(userModal.authenticate()));

router.get("/", function(req,res){
  res.render("index",{errors:false});
});

router.post("/reg", body('password').isLength({ min: 5 }).withMessage("Password should a minimum of 5 characters"),function(req,res){
  const errors = validationResult(req);
  if (!errors.isEmpty()){
    res.render("index",errors)
  }

  const details = new userModal({
 name: req.body.name,
 username: req.body.username,
 email: req.body.email,
  });

  userModal.register(details, req.body.password).then(function(registeredUser){
    passport.authenticate("local")(req,res, function(){
      res.redirect("/profile");
    });
  });
});

router.get("/login", function (req,res){
  res.render("login");
})

router.post("/login",passport.authenticate("local",{
  successredirect: "/profile",
  failureRedirect: "/login",
}),
function(req,res){}
);

router.get("/logout", function(req,res){
  req.logOut();
  res.redirect("/");
});

function isLoggedIn(req,res,next){
  if (req.isAuthenticated()){
    return next();
  } else{
    res.redirect("/login");
  }
}

router.get("/timeline", function(req,res){
  userModal.findOne({username:req.session.passport.user}).populate('posts')
  .then(function(foundUser){
    res.render("timeline",{foundUser});
  })
});

router.post('/post', function(req,res){
  userModal.findOne({ username: req.session.passport.user})
  .then(function(foundUser){
    postModel.create({
      posttext: req.body.post,
      user: foundUser
    }).then(function (newlyCreatedPost){
      foundUser.posts.push(newlyCreatedPost);
      foundUser.save().then(function(){
        res.redirect('/timeline');
      })
    })
  })
});

module.exports = router;