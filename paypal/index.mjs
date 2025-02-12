


const getAccessToken = async ()=>{

    const clientId = process.env.CLIENT_ID
    const clientSecret = process.env.CLIENT_SECRET;

    const response = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
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

    return response.json()
    

}