const { v4:uuidv4 }= require('uuid');

const getAccessToken = async ()=>{

    const clientId = process.env.CLIENT_ID
    const clientSecret = process.env.CLIENT_SECRET;

    const response = await fetch(`${process.env.PAYPAL_BASE_URL}v1/oauth2/token`, {
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

const createOrder = async (currency_code, value)=>{

    const paypalRequestId = uuidv4()
    const PAYPAL_API = `${process.env.PAYPAL_BASE_URL}v2/checkout/orders`
    const accessToken = await getAccessToken()
    const PAYPAL_AUTH_TOKEN = `Bearer ${accessToken}` 
    const currencyCode = currency_code.toUpperCase()

    const response = await fetch(PAYPAL_API, {
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
                items:[
                    {
                        "name": "nodejs course",
                        "quantity": "1",
                        "description": "DIGITAL_GOODS",
                        "unit_amount": {
                            "currency_code": String(currencyCode),
                            "value": String(value),
                        }
                    
                    }
                ],
                "amount": {
                    "currency_code": "USD",
                    "value": "2000.00",
                    breakdown: {
                        "item_total": {
                            "currency_code": String(currencyCode),
                            "value": String(value),
                        }
                    }
                }
            }
        ],
        "application_context": {
            "return_url": `${process.env.BASE_URL}orders`,
            "cancel_url": `${process.env.BASE_URL}cancel`,
            "shipping_preference": "NO_SHIPPING",
            "user_action": "PAY_NOW",
            "brand_name": "Profbass"
            }
        })
    });
    const data = response.json()
    // console.log(response);
    if(!response.ok){
        return null
    }

    return data
}

const captureOrder = async (order_id)=>{
    
    const paypalRequestId = uuidv4()
    const accessToken = await getAccessToken()
    const PAYPAL_AUTH_TOKEN = `Bearer ${accessToken}` 

    const response = fetch(`${process.env.PAYPAL_BASE_URL}v2/checkout/orders/${order_id}/capture`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'PayPal-Request-Id': paypalRequestId,
            'Authorization': PAYPAL_AUTH_TOKEN,
            },
            body: JSON.stringify({})
            });

            return response;

}



module.exports = {
    createOrder,
    captureOrder,

}




    
    

