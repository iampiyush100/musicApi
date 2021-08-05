const jwt = require("jsonwebtoken");
const token_key = process.env.TOKEN_KEY;
const User = require("../models/userSchema");

function verifyToken(req, res, next) {
  //read jwt token from http header
  const token = req.headers["x-access-token"];

  //check token is empty or not
  if (!token) {
    return res.status(404).json({
      status: false,
      message: "token not found",
    });
  }
  jwt.verify(token, token_key, (error, decoded) => {
    if (error) {
      return res.status(401).json({
        status: false,
        message: "jwt not decoded",
        error: error,
      });
    }
    User.findById(decoded.id, { password: 0, createdAt: 0, updatedAt: 0, profile_pic:0 })
      .then((user) => {
          if(!user){
            return res.status(401).json({
                status: false,
                message: "user not exist",
              });
          }

          //set user obj in req obj
          req.user={
              id: user._id,
              email: user.email,
              username: user.username
          };
          return next();
      })
      .catch((error) => {
        return res.status(501).json({
            status: false,
            message: "DB error",
          });
      });
  });
}

module.exports = verifyToken;
