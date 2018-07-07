

var mongoose = require("mongoose");
//const schema = mongoose.Schema;
// creating sceham
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  firstname:String,
  lastname: String,
  email:String,
  phone: Number,
  location: String
});

mongoose.model('users', userSchema);

const msgSchema = new mongoose.Schema({
        recipient : String,
        recipient_img : String,
        sender : String,
        sender_img : String,
        title : String,
        description : String,
        created_at : String,
        important : String,
        favorite : {
          type:Boolean,
          default:false
        },
        replys:[String]
},{collection: 'msg'});

mongoose.model('msg', msgSchema);