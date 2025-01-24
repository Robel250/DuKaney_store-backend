//   import express, { request, response } from 'express';
//   import bcrypt from 'bcryptjs'
//   import jwt from 'jsonwebtoken'
//   import { User } from '../Models/usermodel'


//   const router=express.Router();

//   router.post('/signup',async(request,response)=>{
//     try{
//         const {user,email,password}=request.body;
//         const existingUser=await  User.findOne({$or:[{username},{email}]});
//     if(existingUser){
//         return response.status(400).json({message:`user or email already exists`});
//     }

// const hashePassword=await bcrypt.hash(password,10);
// const newUser =await  User.create({
//     username,
//     email,
//     password:hashePassword,
// });
// return response.status(201).json(newUser);
//      }catch(error){
//         console.log(error.message);
//         response.status(500).send({message:error.message});
//      }

//   });




//   router.post('/login',async(request,response)=>{
//     try{
//         const {username,password}=request.body

//         const user =await  User.findOne({username});
//         if(!user){
//             return response.status(404).json({message:'user not found'});
//         }
//             const passwordMatch=await bcrypt.compare(password,user.password);
//             if(!passwordMatch){
//                 return response.status(401).json({message:'invaid password'});
//             }
//             const token=jwt.sign({userId:user._id,isLogged:true},'your_serect_key',{expiresIn:`1h`});
//             return response.status(401).json({token,username:user.username});
        
//     } catch(error){
//         console.log(error.message);
//         response.status(500)._construct({message:error.message});
//     }
//   })





import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../Models/usermodel.js';

const router = express.Router();

router.post('/signup', async (request, response) => {
    try {
        const { username, email, password } = request.body;

      
        const existingUser = await User.findOne({
            $or: [{ username }, { email }],
        });

        if (existingUser) {
            return response.status(400).json({ message: 'User or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        return response.status(201).json(newUser);
    } catch (error) {
        console.log(error.message);
        response.status(500).json({ message: error.message });
    }
});

router.post('/login', async (request, response) => {
    try {
        const { username, password } = request.body;

        const user = await User.findOne({ username });
        if (!user) {
            return response.status(404).json({ message: 'User not found' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return response.status(401).json({ message: 'Invalid password' });
        }

        const token = jwt.sign(
            { userId: user._id, isLogged: true },
            'your_secret_key', 
            { expiresIn: '1h' }
        );

       
        return response.status(200).json({ token, username: user.username });
    } catch (error) {
        console.log(error.message);
        response.status(500).json({ message: error.message }); 
    }
});

export default router;
