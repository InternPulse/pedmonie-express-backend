require('dotenv').config()

const convertCurrency = async (currency) => {
  try {
    const apiKey = process.env.EXCHANGE_RATES_API_KEY

    const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/${currency}`)
    if (!response.ok) {
      return { status: 500, message: `HTTP error! Status: ${response.status}` }
    }

    const data = await response.json()
    return data.conversion_rates 
  } catch (error) {
    return {
      status: 500,
      message: "Error converting currency: " + error.message,
    }
  }
}

module.exports = {
  convertCurrency
}
