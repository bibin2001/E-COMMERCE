const User=require('../../Model/user/userModel')
const Product=require('../../Model/admin/productModel')
const { product } = require('../admin/adminController')
const { default: mongoose } = require('mongoose')

const addTOCart=async(req,res)=>{
    try {
        const userId=req.session.user
        const id=req.query.id
        const productExist = await User.findOne({_id:userId,"cart.items":{$elemMatch:{productId:id}}})
        const product= await Product.findById(id)
        if(productExist){
            // await User.updateOne({_id:userId,"cart.items": {$elemMatch : {productId:id}}},{$inc:{"cart.items.$.qty":1, "cart.items.$.price": product.price }})
            await User.updateOne({_id:userId,"cart.items": {$elemMatch : {productId:id}}},{$inc:{"cart.items.$.qty":1,"cart.items.$.price": product.price,"cart.totalPrice": product.price }})   //true
            res.redirect('/cart')
        }else{
            // await User.updateOne({_id:userId},{$push:{"cart.items":{productId:id, price: product.price }}},{totalPrice:product.price})
            await User.updateOne({_id:userId},{$push:{"cart.items":{productId:id, price: product.price }}})
            // await User.updateOne({_id:userId},{$set:{"cart.totalPrice":product.price }})
            await User.updateOne({_id:userId},{$inc:{"cart.totalPrice":product.price}},{$set:{"cart.totalPrice":product.price }}) //true
            res.redirect('/cart')
        }
    } catch (error) {
        console.log(error);
    }
}

const viewCart=async(req,res)=>{
    try {
        existUser=req.session.user
        const userId=req.session.user
        const userData=await User.findById(userId)
    const cart= await User.findOne({_id:userId}).populate("cart.items.productId")
    const cartLenght=await User.aggregate([{$match:{_id:mongoose.Types.ObjectId(userId)}},{$unwind:"$cart.items"},{$group:{_id:"$cart.items"}}])
    const price= await User.findOne({_id:userId}).populate("cart.items.price")
    const total= await User.findOne({_id:userId}).populate("cart.totalPrice")
    // const price=await User.aggregate([{$match:{_id:mongoose.Types.ObjectId(userId)}},{$unwind:"$cart.items"},{$group:{_id:"$cart.itmes",totalPrice:{$sum:"$cart.items.price"}}}])
    // console.log(price[0].totalPrice,'&&&&&&&&');
    const cartData=cart.cart.items
    res.render('../Views/user/cart.ejs',{cartData,price,existUser,cartLenght,userData,total})
    } catch (error) {
        console.log(error);
    }
}

const incQty=async(req,res)=>{
    try {
        const userId=req.session.user
        const id=req.body.id
        const product=await Product.findById(id)
        // const updateCount =await User.updateOne({_id:userId,"cart.items": {$elemMatch : {productId:id}}},{$inc:{"cart.items.$.qty":1, "cart.items.$.price": product.price }})
        const updateCount =await User.updateOne({_id:userId,"cart.items": {$elemMatch : {productId:id}}},{$inc:{"cart.items.$.qty":1, "cart.items.$.price": product.price,"cart.totalPrice":product.price }})  //true
        const user=await User.findById(userId)
        const cartArray=user.cart.items
        const existProduct=cartArray.find((el,i)=>{
            if(el.productId.valueOf()==req.body.id){
                return el
            }
        })
         res.json({
            data:{existProduct:existProduct}
         })
    } catch (error) {
        console.log(error);
    }
}

const decQty=async(req,res)=>{
    try {
        const userId=req.session.user
        const id =req.body.id
        const product=await Product.findById(id)
        // await User.updateOne({_id:userId,"cart.items": {$elemMatch : {productId:id}}},{$inc:{"cart.items.$.qty":-1,"cart.items.$.price":-product.price}})
        await User.updateOne({_id:userId,"cart.items": {$elemMatch : {productId:id}}},{$inc:{"cart.items.$.qty":-1,"cart.items.$.price":-product.price,"cart.totalPrice":-product.price}})
        const user=await User.findById(userId)
        const cartArray=user.cart.items
        const existProduct=cartArray.find((el,i)=>{
            if(el.productId.valueOf()==req.body.id){
                return el
            }
        })
        res.json({
            data:{existProduct:existProduct}
        })
        console.log(existProduct.qty);
        // if(existProduct.qty>=2){
        //     await User.updateOne({_id:userId,"cart.items": {$elemMatch : {productId:id}}},{$inc:{"cart.items.$.qty":-1,"cart.items.$.price":-product.price,"cart.totalPrice":-product.price}})
        //     console.log("^^^^^^^^^^^^^^^");
        // // }else{
        //     await User.updateOne({_id:userId},{$pull:{"cart.items":{productId:id}}})
        //     console.log('***********');
        //     res.redirect('/cart')
        // }
    } catch (error) {
        console.log(error);
    }
}

const deleteCart=async(req,res)=>{
    try {
        const userId=req.session.user
        const id =req.query.id
        const product=await Product.findById(id)
        const cart=await User.updateOne({_id:userId},{$pull:{"cart.items":{_id:id}}})
        const price=await User.aggregate([{$match:{_id:mongoose.Types.ObjectId(userId)}},{$unwind:"$cart.items"},{$group:{_id:"$cart.itmes",totalPrice:{$sum:"$cart.items.price"}}}])
        console.log(price[0].totalPrice,'&&&&&&&&');
        await User.updateOne({_id:userId},{$set:{"cart.totalPrice":price[0].totalPrice}})
        // if()
    // await User.updateOne({_id:userId,"cart.items": {$elemMatch : {productId:id}}},{$inc:{"cart.items.$.qty":-1,"cart.items.$.price":-product.price,"cart.totalPrice":-product.price}})
    // const itemId=req.query.id
    // await User.updateOne({_id:userId,"cart.items":{$elemMatch:{_id:itemId}}},{$inc:{"cart.totalPrice":-"cart.items.price"}})
    res.redirect('/cart')
    } catch (error) {
        console.log(error);
    }
}

module.exports={
    addTOCart,
    viewCart,
    deleteCart,
    incQty,
    decQty
}