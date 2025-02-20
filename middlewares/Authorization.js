const { messages } = require('../messages/index.js')

const authorization =(role)=>{
    return async (req, res, next)=>{

        try {

        const {user} = req.user

        if(!user) throw new Error(messages.USER_NOT_FOUND , 401)

        //check if the user's role matches the required role
        if(!role.includes(user.role)) throw new Error( messages.UNAUTHORIZED , 403 )

        next()
        } catch (error) {
            res.status(500).json({
                message: error.message,
                status: 'error'

            })
        }


    }
}

module.exports = authorization;