import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './routes/userRoute.js'
import productRouter from './routes/productRoute.js'
import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'


//App Config
const app = express()
const port = process.env.PORT || 4000

try{
 connectDB();
} catch (err){
    console.error("DB connection failed:", err.message);
    process.exit(1);
}
connectCloudinary()

//Middleware
app.use(express.json())
app.use(cors())

//API endpoints
app.use('/api/user', userRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)

app.get('/',(req, res)=>{
    res.send("API Working")
})


//Express initializer
app.listen(port, ()=> console.log('Server started on PORT : '+ port)) //enter npm run server in terminal
                                    //open new browser: localhost:4000 window should display API Working