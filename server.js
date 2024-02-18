const express=require('express')
const cors=require('cors')
const mongoose=require('mongoose')
const Products = require('./Products')
const Orders=require('./Orders')
const app=express()
const Users = require("./Users");
const bcrypt = require("bcryptjs");
const port=4000
app.use(express.json())
app.use(cors())
const stripe = require("stripe")(
  "sk_test_51LmDIZSBt9ti9pRDkSoKiULj2GTPjMnBEHZGa0P1wSOROEwwMX5qbqF1Chn4H3IuD10pTo16I3nimHA5f7BEq2gC00B5xv5doT"
);

//connection url
const connectionurl="mongodb+srv://mandaakash6:mandaakash6@cluster0.0uosz.mongodb.net/?retryWrites=true&w=majority"
mongoose.connect(connectionurl,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
}).then(()=>{
  console.log("Connected successfully")
})
.catch(()=>{
  console.log("Not connected")
})
//Api
app.get('/',(req,res)=>res.status(200).send("Hello World"));
//add Product Api
app.post('/products/add',(req,res)=>{
    const productDetail=req.body
    Products.create(productDetail,(err,data)=>{
        if (err) {
            res.status(500).send(err.message);
            console.log(err);
          } else {
            res.status(201).send(data);
          }
    })
})
//get product
app.get("/products/get", async(req, res) => {
    try{
    const products= await Products.find({})
    res.status(200).send(products)
    }
    catch(err){
      res.status(500).send(err)
    }
  });
//api for payments
app.post("/payment/create", async (req, res) => {
  const total = req.body.amount;
  console.log("Payment Request recieved for this ruppess", total);

  const payment = await stripe.paymentIntents.create({
    amount: total * 100,
    currency: "inr",
  });

  res.status(201).send({
    clientSecret: payment.client_secret,
  });
});
// API for SIGNUP

app.post("/auth/signup", async (req, res) => {
  const { email, password, fullName } = req.body;

  const encrypt_password = await bcrypt.hash(password, 10);

  const userDetail = {
    email: email,
    password: encrypt_password,
    fullName: fullName,
  };
  console.log(userDetail)
  const user_exist = await Users.findOne({ email: email });

  if (user_exist) {
    res.send({ message: "The Email is already in use !" });
  } else {
    Users.create(userDetail, (err, result) => {
      if (err) {
        res.status(500).send({ message: err.message });
      } else {
        res.send({ message: "User Created Succesfully" });
      }
    });
  }
});

// API for LOGIN

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
   if(email==undefined)
   {
    console.log("Error")
   }
   else{
  const userDetail = await Users.findOne({ email: email });

  if (userDetail) {
    if (await bcrypt.compare(password, userDetail.password)) {
      res.send(userDetail);
    } else {
      res.send({ error: "invaild Password" });
    }
  } else {
    res.send({ error: "user is not exist" });
  }
}
});

//api for orders
app.post('/orders/add',(req,res)=>{
  const products=req.body.basket;
  const price=req.body.price;
  const email=req.body.email;
  const address=req.body.address;
  const orderdetail={
    products:products,
    price:price,
    address:address,
    email:email,
  }
  Orders.create(orderdetail,(err,result)=>{
    if(err)
    {
      console.log(err);
    }
    else{
      console.log("Order added to database",result)
    }
  })
})
app.post("/orders/get",(req,res)=>{
  const email=req.body.email
  Orders.find((err,result)=>{
    if(err)
    {
      console.log("Error");
    }
    else{
      const userOrders=result.filter((Order)=>Order.email===email)
      res.send(userOrders)
    }
  })
})
app.listen(port,()=>console.log("Listening on port ",port)) 