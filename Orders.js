const mongoose=require('mongoose');
const Orderschema=mongoose.Schema({
    price:Number,
    products:Array,
    email:String,
    address:Object,
});
module.exports=mongoose.model("Orders",Orderschema)