const mongoose = require("mongoose");
const express = require("express");
const Schema = mongoose.Schema;
const moment = require("moment");

//Use for track the moment of user
//createdAt:{
//     type:  String,
//     default: moment().format("DD/MM/YYYY")+ ";"+ moment().format("hh:mm:ss")

// },
//updatedAt:{
//     type:  String,
//     default: moment().format("DD/MM/YYYY")+ ";"+ moment().format("hh:mm:ss")

// },

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {  
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profile_pic: {
    type: String, //for img url
    default: "empty-avatar.jpg"
  },
  createdAt: {
    type: String,
    default: moment().format("DD/MM/YYYY") + ";" + moment().format("hh:mm:ss"),
  },
  updatedAt: {
    type: String,
    default: moment().format("DD/MM/YYYY") + ";" + moment().format("hh:mm:ss"),
  },
});

//create model
mongoose.model("users", userSchema);

//export users model

module.exports = mongoose.model("users");
