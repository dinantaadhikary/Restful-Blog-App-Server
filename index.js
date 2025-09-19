import express from 'express';
import connectDB from './Utils/db.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';

dotenv.config();
const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//importing routea
import userRoutes from './Routes/userRoutes.js';
import blogRoutes from './Routes/blogRoutes.js';

const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.send("Hello World");
});

connectDB()
.then(()=>{
    app.listen(PORT , ()=>{
        console.log('Server is running on port ', PORT);
        
    })
})
.catch((error)=>{
    console.log('Connection failed',error);
})

app.use('/api/users', userRoutes);
app.use('/api/blogs', blogRoutes);