const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://Usell:uTixBkqxpicAC48N@cluster0-swdpb.mongodb.net/grocery-project?retryWrites=true")
.then(() => {
  console.log("Connected to database!");
}).catch(() => {
  console.log("connection failed");
});