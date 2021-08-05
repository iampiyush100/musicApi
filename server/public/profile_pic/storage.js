const multer = require("multer");
const randomString = require("randomstring");
const path = require("path");

//this function use to accept only image (validate image file type)
function checkFileType(file, cb) {
  //allowed file extension
  const allowedType = /jpeg|png|jpg|gif/;
  //match file extention
  const isMatchExt = allowedType.test((path.extname(file.orignalname)).toLowerCase());
  //match mime type
  const isMimeMatch = allowedType.test(file.mimetype);
  if (isMatchExt && isMimeMatch) {
    cb(null, true);
  } else {
    cb(null, false);
  }
}
function getProfilePicUpload() {
  let storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/profile_pic");
    },
  });
  return multer({
    storage: storage,
    limits: {
      fileSize: 2500000,
    },
    filename: function (req, file, cb) {
      let part1 = randomString.generate(5); // here 5 is the size of dynamically generated filename
      let part2 = randomString.generate(5);
      let ext = (path.extname(file.orignalname)).toLowerCase();
      cb(null, part1 + "_" + part2 + ext);
    },
    fileFilter: function (req, file, cb) {
      checkFileType(file, cb);
    },
  }).single("profile_pic");
}

module.exports = { getProfilePicUpload };
