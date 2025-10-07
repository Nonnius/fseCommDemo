import React, { useContext, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext';
import { Navigate, useSearchParams } from 'react-router-dom';
import {toast} from 'react-toastify'
import axios from 'axios'


const Verify = () => {
    const { navigate, token, setCartItems, backendUrl} = useContext(ShopContext);
    const [searchParams, setSearchParams] = useSearchParams();
    const success = searchParams.get('success');
    // Stripe Checkout places the session id in the URL as `session_id` when
    // using the `{CHECKOUT_SESSION_ID}` placeholder in success_url.
    const session_id = searchParams.get('session_id') || searchParams.get('orderId') || null;
    

    const verifyPayment = async (attempt = 1) => {
        try {
            // Always attempt verification on redirect. The backend `verifyStripe`
            // does not require auth and will validate the Stripe session_id server-side.
            const payload = { success }
            if (session_id) payload.session_id = session_id

            const headers = {}
            if (token) headers.token = token

            const response = await axios.post(backendUrl + '/api/order/verifyStripe', payload, { headers })
            if (response.data.success) {
                // Backend has created the order and cleared server-side cart; mirror that in client state
                setCartItems({})
                navigate('/orders')
            } else {
                navigate('/cart')
            }
        } catch (error) {
            console.log('verify attempt', attempt, 'failed:', error?.response?.data || error.message)
            // Retry a couple times for transient failures (e.g., token not yet set or network hiccup)
            if (attempt < 3) {
                setTimeout(() => verifyPayment(attempt + 1), 1500)
            } else {
                toast.error('Payment verification failed. Please check your orders or contact support.')
                navigate('/cart')
            }
        }
    }
        
    useEffect(() => {
        verifyPayment()
    }, [token])

    
  return (
    <div>

    </div>
  )
}

export default Verify;