const { v4:uuidv4 }= require('uuid');
const {messages} = require('../../messages')


const getAccessToken = async ()=>{

    const clientId = process.env.CLIENT_ID
    const clientSecret = process.env.CLIENT_SECRET;

    const response = await fetch(`${process.env.TOKEN_URL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
        },
        body: new URLSearchParams({ grant_type: 'client_credentials' })
    });

    if(!response.ok){
        return null
    }

    const data = await response.json()
    return data.access_token
}

const createOrder = async (currency_code, value, orderID)=>{

    const paypalRequestId = uuidv4()
    const accessToken = await getAccessToken()
    const PAYPAL_AUTH_TOKEN = `Bearer ${accessToken}` 
    const currencyCode = currency_code.toUpperCase()

    const response = await fetch(`${process.env.PAYPAL_BASE_URL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'PayPal-Request-Id': paypalRequestId,
            'Authorization': PAYPAL_AUTH_TOKEN,
        },
        body: JSON.stringify({
            "intent": "CAPTURE",
            "purchase_units": [
            {
                "amount": {
                    "currency_code": String(currencyCode),
                    "value": String(value),
                    breakdown: {
                        "item_total": {
                            "currency_code": String(currencyCode),
                            "value": String(value),
                        }
                    }
                },
                "custom_id" : orderID
            }
        ],
        "application_context": {
            "return_url": `${process.env.BASE_URL}orders`,
            "cancel_url": `${process.env.BASE_URL}cancelorders`,
            "shipping_preference": "NO_SHIPPING",
            "user_action": "PAY_NOW",
            "brand_name": "Profbass"
            }
        })
    });
    const data = await response.json()
    if(!response.ok){
        return null
    }

    return data
}

const captureOrder = async (order_id)=>{
    
    const paypalRequestId = uuidv4()
    const accessToken = await getAccessToken()
    const PAYPAL_AUTH_TOKEN = `Bearer ${accessToken}` 

    const response =await fetch(`${process.env.PAYPAL_BASE_URL}${order_id}/capture`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'PayPal-Request-Id': paypalRequestId,
            'Authorization': PAYPAL_AUTH_TOKEN,
            },
            body: JSON.stringify({})
            });

    const data = await response.json()

    return data

}

const getOrder = async (orderID)=>{

    const accessToken = await getAccessToken()
    const PAYPAL_AUTH_TOKEN = `Bearer ${accessToken}` 

    const paypalResponse = await fetch(`${process.env.PAYPAL_BASE_URL}${orderID}`,
        {
            method: 'GET',
            headers: {
            Authorization: PAYPAL_AUTH_TOKEN,
            'Content-Type': 'application/json',
            },
        }
    );

    if(!paypalResponse.ok){
        return null
    }

    const data = paypalResponse.json()

    return data
}

const conversionsOfCurrencies = async (currency)=> {

    const response = await fetch(`https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_APIKEY}/latest/${currency}`)

    const data = await response.json()
    console.log(data)
    if(data.result == 'error'){
        return null
    }
    if(data.result == 'success'){
        return data.conversion_rates
    }
}

module.exports = {
    createOrder,
    captureOrder,
    getOrder,
    conversionsOfCurrencies
}




    
    

