const jwt = require('jsonwebtoken');
const jwt_secret = "dance123";
const fetchuser=(req,res,next)=>{
    //Get the user from the jwt token and add id to the req object
    const token=req.header('auth-token');
    if(!token){
        res.status(401).send({error:"please authenticate using the valid token"})
    }
    try {
        const data=jwt.verify(token, jwt_secret);
        req.user=data.user;
        next();
    } catch (error) {
        res.status(401).send({error:"please authenticate using the valid token"})
    }
}
module.exports=fetchuser;