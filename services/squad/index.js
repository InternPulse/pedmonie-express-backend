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


        const transactionStatus = response.data;

        return transactionStatus     

    } catch (error) {
      console.error(error)    
    }    
  }
};
