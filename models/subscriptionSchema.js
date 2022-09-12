const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({ 
    userId:{
        type:String,
    },
    sessionId:{
        type:String,
    },
    totalAmount:{
        type:Number,
        //required:true
    },
    name:{
        type:String,
    },
    interval:{
        type:String,
    },
    subscriptionId:{
        type:String,
    },
    paymentStatus:{
        type:String,
    },
    customer:{
        type:String,
    },
    timeStamp:{
        type:Number
    }
})

const Subscription = mongoose.model('SUBSCRIPTION', subscriptionSchema);
module.exports = Subscription;