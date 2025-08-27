import {asynchandler} from '../utils/asynchandler.js';

const registeruser=asynchandler(async(req,res)=>{
   return res.status(200).json({
        message:"ok"
    })
})



export{registeruser}