const initializeTransaction = async (email, amount, currency) => {

    const url = process.env.INITIALIZE_PAYMENT
    const secretKey = process.env.SECRET_KEY

    const data = {
        email: email,
        amount: amount * 100,
        currency: currency
        //the above will convert the amount to naira because paystack accept in kobo
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${secretKey}`,
                "Content-Type": "application/json"
                },
            body: JSON.stringify(data)
            });


    const responseData = await response.json()

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    
    return responseData
    } catch (error) {

        return null
    }
}

const verifyTransaction = async (reference) => {

    const url = `${process.env.VERIFY_PAYMENT}${reference}`
    const secretKey = process.env.SECRET_KEY

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${secretKey}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        // console.log('data from verify function',data);
        return {
            status: data.status,
            id: data.data.id,
            transaction_status: data.data.status,
            reference: data.data.reference,
            payment_channel: data.data.channel,
            currency: data.data.currency,
            amount: data.data.amount / 100 //converting to naira
        }
    } catch (error) {

        return null
    }
};

const getTransaction = async (id) => {

    const url = `${process.env.GET_TRANSACTION}${id}`
    const secretKey = process.env.SECRET_KEY

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${secretKey}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        // console.log(data);
        return data
    } catch (error) {

        return null
    }
};

module.exports = {
    initializeTransaction,
    verifyTransaction,
    getTransaction
}

