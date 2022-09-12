//initialization and imports
const dotenv = require('dotenv');
const express = require('express');
var cors = require('cors')
const app = express();
dotenv.config({path: './config.env'});

require('./db/connection');
const auth = require("./middleware/auth");
app.use(express.json());
app.use(cors({
  origin: '*'
}));

const PORT = process.env.PORT ||5000;

//calling services
const authService = require('./services/authService.js')
const appService = require('./services/appService.js')

//all apis


//main api
app.get("/", auth, async (req, res) =>{
  res.send({message:"rp assignment", status:200});
});


//login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!(email && password)) {
    res.status(400).send("All input is required");
  }

  const result = await authService.login(email, password);
  res.send(result);
});


//register
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!(email && password && username)) {
    console.log("input error")
    res.status(400).send("All input is required");
  }
  const result = await authService.register(username, email, password);
  res.send(result);

});

app.get('/allprices',auth, async(req, res) => {
  const result = await appService.allPrices();
  res.send(result);
})

//create payment session
app.post("/session", auth, async (req, res) =>{
  const priceId = req.query.price;
  const userId = req.user.user_id;

  const result = await appService.createSession(userId,priceId);
  res.send(result);
});

//get subscription details
app.get('/subscription', auth, async (req, res) => {
  const userId = req.user.user_id;

  const result = await appService.getSubscriptionDetails(userId);
  res.send(result);
})


//redirect after stripe payment
app.get("/order/success", async (req, res) => {
  const sessionId = req.query.session_id;
  const result = await appService.redirectAfterPayment(sessionId);
  if(result.redirect){
    res.redirect(result.url);
  }else{
    res.redirect(result.url);
  }    
})

//get session info for a payment    
app.get("/sessiondetailsget", async (req, res) =>{
  const sessionId = req.query.session_id;
  const result = await appService.getSessionDetails(sessionId);
  res.send(result)
  
});

//delete a user subscription
app.delete("/deletesubscription",auth, async (req, res) =>{
  const subId = req.query.subId;
  
  const result = await appService.deleteSubscription(subId);
  res.send(result)
});

//404 api
app.get('*', function(req, res){
  res.send({status:404,message:'url not found'});
});

//port listener
app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${PORT}`) 
})