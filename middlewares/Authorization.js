const { messages } = require('../messages/index.js')

const authorization =(role)=>{
    return async (req, res, next)=>{

        try {

        const user = req.user
        // console.log('auth',user)

        if(!user){
            return res.status(401).json({
                status: false,
                message: messages.USER_NOT_FOUND,
            })
        }

        //check if the user's role matches the required role
        if(!role.includes(user.role)){
            return res.status(403).json({
                status: false,
                message: messages.UNAUTHORIZED
            })
        }

        next()
        } catch (error) {
            res.status(500).json({
                message: error.message,
                status: false

            })
        }


    }
}

module.exports = authorization;