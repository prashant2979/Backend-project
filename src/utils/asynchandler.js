const asynchandler =(requesthandler) =>{
    (req,res,next)=>{
        Promise.resolve(requesthandler(req,res,next)).catch((err)=>next(err))
    }
}




export{asynchandler}



// const asynchandler=()=>{}
// const asynchandler=(func)



// const asyncHandler = (fn) => async (req, res, next) => {
//   try {
//     await fn(req, res, next);   // run the passed function
//   } catch (error) {
//     res.status(error.code || 500).json({
//       success: false,
//       message: error.message || "Internal Server Error"
//     });
//   }
// };

// export { asyncHandler };
