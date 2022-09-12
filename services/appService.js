const dotenv = require('dotenv');
dotenv.config({path: '../config.env'});
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Stripe = require('stripe');
const stripe = Stripe(`${process.env.STRIPE_KEY}`);

const User = require("../models/userSchema");
const Subscription = require("../models/subscriptionSchema");
const Session = require("../models/sessionSchema");

module.exports = {
    //service to fetch all prices/subscriptions in homepage
    allPrices: async function(){
        const result = [];
        const prices = await stripe.prices.list({
            limit: 10,
        });
        const temp = prices.data;
        for(let i=0;i<temp.length;i++){
            const priceId = temp[i]["id"];
            const product = await stripe.products.retrieve(temp[i]["product"]);
            let out = {
                priceId: priceId,
                product: temp[i]["product"],
                recurring: temp[i]["recurring"]["interval"],
                amount: temp[i]["unit_amount"],
                name:product.name, 
            }
            result.push(out);
        }
        if(result.length == 0){
            return {status:209, result:result};
        }
        return {status:200, result:result};
    },
    //service to create usersession for payment using stripe
    createSession: async function(userId, priceId){
        let sub;
        await Subscription.find({userId: userId})
        .then(data => {sub = data;})
        .catch( err => {console.log(err)});
        if(sub.length != 0){
            return{status:409, message:"Subscription already exists"};
        }
        const session = await stripe.checkout.sessions.create({
            success_url: `https://rp2022-backend.herokuapp.com/order/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: 'https://rp2022-backend.herokuapp.com/allprices',
            line_items: [
            {price: priceId, quantity: 1},
            ],
            mode: 'subscription',
        });

        let data = {
            sessionId: session.id,
            userId:userId,
        } 
        const sessionDetails = await Session.create(data);
        return {status:200, session:session};
    },
    //get subscription details of a particular user
    getSubscriptionDetails: async function(userId){
        let result = [];
        await Subscription.find({userId: userId})
        .then(async (data) => {
            for(let i=0;i<data.length;i++){
            result.push(data[i]);
            }})
        .catch( err => {
            return {status:500, message:err}
        });
        if(result.length == 0){
            return{status:209, result:result};
        }

        return{status:200, result:result};
    },
    //redirect api after payment checks 
    redirectAfterPayment: async function(sessionId){
        let userId;
        await Session.findOne({sessionId:sessionId})
        .then(async (data) => {
            userId = data.userId
        })
        .catch( err => {console.log(err)});

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        let subsCheck = await stripe.subscriptions.retrieve(
            session.subscription
        );
        if(session.payment_status != 'paid'){
            return {status:424, message:"payment failed"};
        }
        else{
            const data = {
            userId:userId,
            sessionId: session.id,
            totalAmount:session.amount_total,
            name:session.customer_details.name,
            interval:subsCheck.items.data[0].plan.interval,
            subscriptionId:session.subscription,
            paymentStatus:session.payment_status,
            customer:session.customer,
            timeStamp:Date.now()
            }
        
            const subscription = await Subscription.create(data);
            return {status:200, result:data, redirect:true, url:'http://localhost:3000/'};
        }
    },
    //service to get session info from stripe
    getSessionDetails: async function(sessionId){
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        return{status:200, session:session};
    },
    //service to delete a subscription
    deleteSubscription: async function(subId){
        await Subscription.deleteOne({subscriptionId: subId})
        .then(response => response)
        .catch( err => {
            return {status:500, error:err}
        });

        const deleted = await stripe.subscriptions.del(subId);
        
        return {message:"deleted successfully", code:200, deleted:deleted};
    }
}