const mongoose=require('mongoose');

const Orderschema= new mongoose.Schema({
    userid:{ 
        type:String
    },
    VenderEmail:{
        type:String
    },
    venderId:{
        type:String
    },
    CustomerEmail:{
        type:String
    },
    CustomerPhone:{
        type:Number
    },
    CustomerAddress:{
        type:String
    },
    CustomerName:{
        type:String
    },
    Price:{
        type:Number
    }

})

const Order=mongoose.model('Order',Orderschema)
module.exports=Order;