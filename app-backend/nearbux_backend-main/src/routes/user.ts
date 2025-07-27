
import express from 'express';
const app = express();
app.use(express.json());
import 'dotenv/config'
import jwt from "jsonwebtoken";

import {prisma} from '../index';
import { boolean, promise, z } from "zod";
import { authMiddleware } from '../authMiddleware';
import bcrypt from 'bcrypt';



export const userRouter =  express.Router();


userRouter.post("/signup", async (req , res) : Promise <any>  =>{
   console.log("request arrived");
    const {name , username , password , phoneNumber} = req.body;
    const user = z.object({
    name :z.string().min(3).max(100),
    username : z.string(),
    password : z.string().min(5).max(16)

      
});
const bul = user.safeParse(req.body);
if(!bul.success){
  // bul.error.errors
  return res.status(400).json({ message : "invalid input"  });
};
    console.log("before try");

try {
  const already =  await  prisma.user.findFirst({
    where : {
      phone : phoneNumber
    }
  });

  if(already){
    return res.status(400).json({message : "phone number already registered"});

  }
} catch(e){
  console.error("error " + e);
};

try {
  const already = await prisma.user.findFirst({
    where : {
      username 
    }
  })
  if(already){
    return res.status(400).json({message : "username already taken "});
  }
} catch(e){
  console.error("error " + e);
}




try{
 const hashedpass =   await bcrypt.hash(password , 3);
  await prisma.user.create({
  data  : {
    name : name,
    username : username, 
    password : hashedpass, 
    phone : phoneNumber, 
  
  }
 }
 )
 console.log("user signed up")    ;
    


  res.status(200).json({
      message : "you are succesfully signed up ",
  })
}
catch(e){
  res.json({
      message : "an error while hashing the password ",
  });
}

     
    
    console.log(username ,  name , password , phoneNumber)  ; 
    console.log(typeof(username), typeof(name), typeof(password), typeof(phoneNumber));
    
   


 });


 userRouter.get("/signup", async (req, res)=>{
    console.log("request arrived");
    res.status(400).json({message : "hiihi"})
 });


 userRouter.post("/validate",  async (req, res) : Promise <any>=>{
    const { 
      username,
      phoneNumber
    
    }  = req.body;
     

    try {
        
    const alreadyUsername = await prisma.user.findFirst({where : {
      username 
    }});
    if(alreadyUsername){
      
      return res.status(200).json({usernameExists : true, phoneExists: false});
    }

    const alreadyPhone = await prisma.user.findFirst({
      where : {
        phone : phoneNumber
      }
    });
    if(alreadyPhone){
      return res.status(200).json({usernameExists: false, phoneExists:true});

    }

    return res.status(200).json({usernameExists: false, phoneExists:false});
    


    }catch(e){
      return res.status(400).json({message  : "error while validating"});

    }
     
    
    

 })

 userRouter.post("/info", async (req, res) : Promise <any> => {
  const { phoneNumber, area, pinCode } = req.body;

 if(!phoneNumber || !area || !pinCode) {
  return res.status(400).json({message : "invalid request"});
 }


  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        phone: phoneNumber,
      },
    });

    if (!existingUser) {
      return res.status(400).json({ message: "User not found with this phone number." });
    }

    const updatedUser = await prisma.user.update({
      where: {
        phone: phoneNumber,
      },
      data: {
        local_area: area,
        pin: pinCode,
      },
    });

    res.status(200).json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Something went wrong", error });
  }
});

let c = 0;


userRouter.post("/signin", async (req, res): Promise <any>=> { // Removed incorrect type annotation
  try {
    c = c + 1;
    console.log('hit ' + c + " times");
    
    const { userInput, password } = req.body;
    
    // Log the input for debugging
    console.log("Received:", userInput, password);
    
    if (!userInput || !password) {
      return res.status(400).json({ message: "Missing username/phone or password" });
    }
    
    let foundUser = null;
    
    // Query based on input length
    if (userInput.length < 9) {
      foundUser = await prisma.user.findFirst({
        where: {
          username: userInput
        }
      });
      console.log("Queried by username:", foundUser ? "Found" : "Not found");
    } else {
      foundUser = await prisma.user.findFirst({
        where: {
          phone: userInput
        }
      });
      console.log("Queried by phone:", foundUser ? "Found" : "Not found");
    }
    
    if (!foundUser) {
      console.log("User not found for input:", userInput);
      return res.status(404).json({ message: "User not found" });
    }
    
    const validPass = await bcrypt.compare(password, foundUser.password);
    
    if (!validPass) {
      console.log("Invalid password for user:", userInput);
      return res.status(401).json({ message: "Invalid password" });
    }
    
    const jwt_pass = process.env.user_secret;
    
    if (!jwt_pass) {
      console.log("Missing JWT secret in environment variables");
      return res.status(500).json({ message: "Server configuration error" });
    }
    
    const token = jwt.sign({ phone: foundUser.phone }, jwt_pass);
    console.log("Login successful for user:", userInput);
    return res.status(200).json({ 
      token, 
      username: foundUser.username,
      userId: foundUser.id
    });
    
  } catch (error) {
    console.error("Signin error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
});


userRouter.post("/logout", async (req, res):Promise <any> => {
  try {
    // No need for authMiddleware — this just confirms logout
    console.log("Logout requested");
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Server error during logout" });
  }
});

