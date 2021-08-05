const mongoose = require("mongoose");
const db_url = process.env.DB_URL;
mongoose
  .connect(db_url , {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false, //Always it should be false
  })
  .then(() => {
    console.log("connection estabilished succesfully ");
  })
  .catch((err) => {
    console.log(`connection not estabilished ${err}`);
  });
