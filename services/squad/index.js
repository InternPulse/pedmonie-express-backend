const SQUAD_BASE_URL = process.env.SQUAD_BASE_URL;
const SQUAD_SECRETE_KEY = process.env.SQUAD_SECRETE_KEY
const aioxs = require("axios");


module.exports = {
  initializePayment: async function (email, amount, currency_code) {
    try {
      const response = await aioxs.post(
        `${SQUAD_BASE_URL}/initiate`,
        {
          email: email,
          amount: amount,
          currency: currency_code,
        },

        {
          headers: {
            "Content-Type": "application/json",
            Authorization:
              `Bearer ${SQUAD_SECRETE_KEY}`,
          },
        }
      );

      const responseDetails = response.data

      return responseDetails
    } catch (error) {
      console.error(error)
    }
  },

  verifyPayment: async function (transaction_ref) {
    try {
        const response = await aioxs.get(`${SQUAD_BASE_URL}/verify/${transaction_ref}`,
           { 
            headers: {
                "Content-Type": "application/json",
                Authorization:
                  `Bearer ${SQUAD_SECRETE_KEY}`,
              }
            }
        );

        //When the request to the endpoint fails
        if(!response){
            return res.status(400).json({
                message: "Something went wronge"
            })
        }

        const transactionStatus = response.data;
        if (transactionStatus.status === 200){
            console.log(transactionStatus)
            return transactionStatus
        }
        return res.status(400).json({
          data: transactionStatus
        }  )     

    } catch (error) {
        return new Error(error)        
    }    
  }
};
