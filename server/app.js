require("dotenv").config();
const express = require('express');
const app = express();
require("./db/conn");
const router = require("./routers/usersRouters");
const bodyParser = require('body-parser');


const port = process.env.PORT;




//url encoded data parsing
//app.use(bodyParser.urlencoded({extended: true}))
app.use(express.urlencoded({extended: true}))
//it is use of JSON parsing
//app.use(bodyParser.json());  //it is use for old version of express so now it is deprecated
app.use(express.json()); //now we use it
app.use("/api/user", router);
app.use(express.static('../public'));


app.listen(port, ()=>{
console.log(`Server Running on ${port} port`);
})