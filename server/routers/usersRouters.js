const express = require("express");
const router = new express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const multer = require("multer");
const bodyParser = require("body-parser");
const { check, validationResult } = require("express-validator");
const User = require("../models/userSchema");

const database = require("../db/conn");
const { response } = require("express");
const storage = require("../public/profile_pic/storage");
const verifyToken = require("../middleware/verify_token");
const token_key = process.env.TOKEN_KEY;

//default route
//Access: public
//url: http://localhost:9000/api/users/

router.get("/", (req, res) => {
  // res.send("welcome to my music api");
  return res.status(200).json({
    status: true,
    message: "user default router",
  });
});

//Api for User Registration
router.post(
  "/register",
  [
    //check empty field
    check("username").not().isEmpty().trim().escape(),
    check("password").not().isEmpty().trim().escape(),
    //check email
    check("email").isEmail().normalizeEmail(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    //check error is not empty
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: false,
        error: errors.array(),
      });
    }

    const hashPass = bcrypt.hashSync(req.body.password, 12);
    console.log(hashPass);
    //console.log(req.body);
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (user) {
          return res.status(409).json({
            status: false,
            error: "Email already exist",
          });
        } else {
          const newUser = new User({
            email: req.body.email,
            username: req.body.username,
            password: hashPass,
          });
          console.log(newUser);
          newUser
            .save()
            .then((result) => {
              return res.status(200).json({
                status: true,
                error: result,
              });
            })
            .catch((error) => {
              return res.status(409).json({
                status: false,
                error: error,
              });
            });
        }
      })
      .catch((error) => {
        return res.status(409).json({
          status: false,
          error: error,
        });
      });
  }
);

// //Api for upload image
// router.post("/uploadProfilePic", (req, res) => {
//   let upload = storage.getProfilePicUpload();
//   upload(req, res, (error) => {
//     if (!req.file) {
//       return res.status(400).json({
//         status: false,
//         message: "Please upload profile pic",
//       });
//     }

//     if (error) {
//       return res.status(400).json({
//         status: false,
//         error: error,
//         message: "File not uploaded",
//       });
//     }

//     //store new profile pic name in user document
//     let temp = {
//       profile_pic: req.file.filename,
//      updatedAt:
//        moment().format("DD/MM/YYYY") + ";" + moment().format("hh:mm:ss"),
//     };
//     User.findOneAndUpdate({_id: req.user.id }, { $set: temp })
//       .then((user) => {
//         return res.status(400).json({
//           status: false,
//           error: error,
//           message: "File uploaded success",
//           profile_pic: "http://localhost:9000/profile_pic/" + user.profile_pic,
//         });
//       })
//       .catch((error) => {
//         return res.status(400).json({
//           status: false,
//           error: error,
//           message: "File not uploaded",
//         });
//       });
//     return res.status(200).json({
//       status: false,
//       error: error,
//       message: "File uploaded",
//     });
//   });
// });

//Login Api
router.post(
  "/login",
  [
    //check empty field
    check("email").not().isEmpty().trim().escape(),
    check("password").not().isEmpty().trim().escape(),
    //check email
    check("email").isEmail().normalizeEmail(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(409).json({
        status: false,
        error: errors.array(),
      });
    } else {
      User.findOne({
        email: req.body.email,
      })
        .then((user) => {
          if (!user) {
            return res.status(402).json({
              status: false,
              error: "User Not Found ",
            });
          } else {
            let passCoversion = bcrypt.compareSync(
              req.body.password,
              user.password
            );
            // console.log(passCoversion);
            if (!passCoversion) {
              return res.status(400).json({
                status: false,
                error: "User Not Exist",
              });
            }
            //generating JWT after login succesfully
            console.log(token_key);
            let token = jwt.sign(
              {
                id: user._id,
                email: user.email,
              },
              token_key,
              {
                expiresIn: 3600000, //1 hours
              }
            );

            return res.status(200).json({
              status: true,
              message: "User Login Succesefully",
              token: token,
              user: user,
            });
          }
        })
        .catch((error) => {
          return res.status(502).json({
            status: false,
            error: error,
          });
        });
    }
  }
);

//api for verify token
router.get("/testjwt", verifyToken, (req, res) => {
  console.log(req.user);
  return res.status(200).json({
    status: true,
    message: "json web token working",
  });
});

//api for change password
//Access Private
//method Put
router.put("/changepassword", verifyToken, async (req, res) => {
  const { oldPassword, newPassword, newPassword2 } = req.body;

  if (!oldPassword || !newPassword || !newPassword2) {
    return res.status(400).json({
      status: false,
      message: "Please fill the all field",
    });
  }
  if(newPassword != newPassword2){
    
    return res.status(400).json({
      status: false,
      message: "password and repassword are not matched",
    });
  }
  if(newPassword == oldPassword){
    
    return res.status(400).json({
      status: false,
      message: "New Password would not be same as old password",
    });
  }
  try{
  const isUserExist =await User.findOne({_id: req.user.id,});
 if(isUserExist){
   try{
  const isPassword = await bcrypt.compare(oldPassword, isUserExist.password);
  console.log(isPassword);
  if(isPassword){
   const newPassHash =await bcrypt.hashSync(newPassword, 12);
   const newData = {
     password: newPassHash,
     updatedAt:  moment().format("DD/MM/YYYY") + ";" + moment().format("hh:mm:ss"),
   } 
  await User.findOneAndUpdate({ _id: req.user.id}, {$set: newData}, {new: true});

  }else{
    res.status(404).json({"message": "old wrong pass"});
  
  }
   }catch(err){
     res.status(404).json({"message": "old wrong pass"});
     console.log(err);
   }

}

  }catch(err){
    console.log(err);
  }
  
});

module.exports = router;
