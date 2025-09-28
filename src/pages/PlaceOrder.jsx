import React, { useContext, useState } from 'react'
import Title from '/src/components/Title.jsx'
import CartTotal from '../components/CartTotal'
import {assets} from '/src/assets/assets.js'
import { ShopContext } from '../context/ShopContext'
import { data } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

const PlaceOrder = () => {
  const [method, setMethod] = useState('cod');
  const{navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products} = useContext(ShopContext);

  // Backend Logic
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: ''
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setFormData(data => ({...data, [name]: value}))
  }

  const initPay = (order) => {
    if (!order) {
      console.error('initPay called with undefined order')
      toast.error('Unable to initialize payment: no order returned from server.')
      return
    }

    // The backend returns `razorpayOrder` object. Normalize to expected fields.
    const razorpayOrder = order && (order.razorpayOrder || order)

    const sanitizeKey = (raw) => {
      if (!raw) return ''
      // remove surrounding quotes/spaces if present
      return String(raw).trim().replace(/^['"]+|['"]+$/g, '')
    }

    const key = sanitizeKey(import.meta.env.VITE_RAZORPAY_KEY_ID || '')

    const options = {
      key,
      amount: (razorpayOrder && (razorpayOrder.amount || razorpayOrder.amount_due)) || 0,
      currency: (razorpayOrder && (razorpayOrder.currency || 'INR')) || 'INR',
      name: "Order Payment",
      description: "Order Payment",
      order_id: razorpayOrder && (razorpayOrder.id || razorpayOrder.order_id) || '',
      receipt: razorpayOrder && (razorpayOrder.receipt || '') || '',
      handler: async (response) => {
        console.log('Razorpay handler response', response)
        // Optionally, you may verify the payment on the backend here
        try {
          const {data} = await axios.post(backendUrl + '/api/order/verifyRazorpay',response, { headers: { token } })
          if (data.success){ 
            navigate('/orders')
            setCartItems({})
          }
        } catch (error) {
          console.log(error)
          toast.error('Payment verification failed. Please contact support if your order was charged.')
        }
      }
    }

    const openCheckout = () => {
      try {
        if (!window.Razorpay) {
          throw new Error('Razorpay SDK not loaded (window.Razorpay is undefined)')
        }
        const rzp = new window.Razorpay(options)
        rzp.open();
      } catch (err) {
        console.error('Failed to open Razorpay checkout', err)
        toast.error('Failed to open payment gateway. Please try again.')
      }
    }

    // If SDK already present open directly, otherwise dynamically load it then open
    if (typeof window !== 'undefined' && window.Razorpay) {
      openCheckout()
    } else {
      // load script dynamically as a fallback (useful in some dev setups)
      const SCRIPT_ID = 'razorpay-checkout-js'
      if (document.getElementById(SCRIPT_ID)) {
        // if script exists but didn't yet expose window.Razorpay, wait briefly
        setTimeout(() => {
          if (window.Razorpay) openCheckout()
          else toast.error('Payment SDK failed to load. Please refresh and try again.')
        }, 500)
        return
      }

      const script = document.createElement('script')
      script.id = SCRIPT_ID
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      script.onload = () => {
        if (window.Razorpay) openCheckout()
        else {
          console.error('Script loaded but window.Razorpay is still undefined')
          toast.error('Payment SDK failed to initialize. Please try again later.')
        }
      }
      script.onerror = (e) => {
        console.error('Failed to load Razorpay script', e)
        toast.error('Failed to load payment gateway. Please check your connection and try again.')
      }
      document.body.appendChild(script)
    }
  }

  
  const onSubmitHandler = async (event) => {
    event.preventDefault()
    try {
      let orderItems = []
      for(const items in cartItems){
        for(const item in cartItems[items]){
          if(cartItems[items][item] > 0){
            // 'items' is the product id key in cartItems, 'item' is the size
            const productId = items;
            const found = products.find(product => String(product._id) === String(productId));
            const itemInfo = structuredClone(found || null);

            if (itemInfo) {
              itemInfo.size = item;
              itemInfo.quantity = cartItems[items][item];
              orderItems.push(itemInfo);
            } else {
              // fallback object to ensure orderItems has necessary shape
              orderItems.push({ _id: productId, size: item, quantity: cartItems[items][item] });
            }
          }
        }
      }
      
      let orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee
      }

      // Guard: prevent placing an empty order
      if (!orderItems || orderItems.length === 0) {
        toast.error('Your cart is empty. Add items before placing an order.')
        return
      }

      // Log the order and environment to help debugging (will appear in browser console)
      console.log('Placing order', { orderData, method, backendUrl, token })

      switch (method){
        // API calls for COD
        case 'cod':
          // send explicit header key to avoid ambiguity
          const response = await axios.post(backendUrl + '/api/order/place', orderData, { headers: { token: token } })
          if (response && response.data && response.data.success){ 
            setCartItems({})
            navigate('/orders')
          } else {
            const msg = response && response.data && response.data.message ? response.data.message : 'Failed to place order'
            toast.error(msg)
            console.error('Order error response:', response)
          }
        break;

        case 'stripe':
          console.log('Initiating Stripe session', { orderData, headers: { token } })
          const responseStripe = await axios.post(backendUrl + '/api/order/stripe', orderData, { headers: { token } })
          if (responseStripe && responseStripe.data && responseStripe.data.success) {
            const { session_url } = responseStripe.data
            if (!session_url) {
              console.error('Missing session_url in Stripe response', responseStripe)
              toast.error('Payment initialization failed: missing payment URL. Please try again.')
              return
            }
            try {
              window.location.replace(session_url)
            } catch (err) {
              console.error('Failed to redirect to Stripe session_url', err)
              toast.error('Failed to open payment gateway. Please try again.')
            }
          } else{
            const msg = responseStripe && responseStripe.data && responseStripe.data.message ? responseStripe.data.message : 'Failed to initialize payment'
            toast.error(msg)
            console.error('Stripe init error response:', responseStripe)
          }
        break;

        case 'razorpay':
          const responseRazorpay = await axios.post(backendUrl + '/api/order/razorpay', orderData, { headers: { token } })
          if (responseRazorpay.data.success) {
            const order = responseRazorpay.data.razorpayOrder || responseRazorpay.data.order || null
            if (!order) {
              console.error('No razorpay order in response', responseRazorpay.data)
              toast.error('Payment initialization failed. Please try again.')
            } else {
              initPay({ razorpayOrder: order })
            }
          } else {
            const msg = responseRazorpay.data && responseRazorpay.data.message ? responseRazorpay.data.message : 'Failed to initialize Razorpay payment'
            toast.error(msg)
          }
           
        break;

        default:
          // If new payment methods are added, handle them here.
          toast.error('Unsupported payment method: ' + method)
          break;
      }

    } catch (error) {
      // Surface unexpected errors so the developer can see them in console and users get feedback
      console.error('Place order error:', error)
      const message = (error && error.response && error.response.data && error.response.data.message) || error.message || 'An unexpected error occurred while placing your order.'
      toast.error(message)
    }
  }


  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh]
    border-t'>

      {/*----Checkout Left Position & Information----*/}
      <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
        <div className='text-xl sm:text-2xl my-3'>
          <Title text1={'DELIVERY'} text2={'INFORMATION'}/>
        </div>
        <div className='flex gap-3'>
          <input required onChange={onChangeHandler} name='firstName' value={formData.firstName} 
          className='border px-2 border-gray-300 rounded py-1.5 w-full' 
          type='text' placeholder='First Name'/>
          <input required onChange={onChangeHandler} name='lastName' value={formData.lastName} 
          className='border px-2 border-gray-300 rounded py-1.5 w-full' 
          type='text' placeholder='Last Name'/>
        </div>
        <input required onChange={onChangeHandler} name='email' value={formData.email}
        className='border px-2 border-gray-300 rounded py-1.5 w-full' 
        type='email' placeholder='Email address'/>
        <input required onChange={onChangeHandler} name='street' value={formData.street}
        className='border px-2 border-gray-300 rounded py-1.5 w-full' 
        type='text' placeholder='Street address'/>
        <div className='flex gap-3'>
          <input required onChange={onChangeHandler} name='city' value={formData.city}
          className='border px-2 border-gray-300 rounded py-1.5 w-full' 
          type='text' placeholder='City'/>
          <input required onChange={onChangeHandler} name='state' value={formData.state}
          className='border px-2 border-gray-300 rounded py-1.5 w-full' 
          type='text' placeholder='State'/>
        </div>
        <div className='flex gap-3'>
          <input required onChange={onChangeHandler} name='zipcode' value={formData.zipcode}
          className='border px-2 border-gray-300 rounded py-1.5 w-full' 
          type='number' placeholder='Zipcode'/>
          <input required onChange={onChangeHandler} name='country' value={formData.country} 
          className='border px-2 border-gray-300 rounded py-1.5 w-full' 
          type='text' placeholder='Country'/>
        </div>
        <input required onChange={onChangeHandler} name='phone' value={formData.phone} 
        className='border px-2 border-gray-300 rounded py-1.5 w-full' 
        type='number' placeholder='contact number'/>
      </div>

      {/*----Checkout Right Position & Payment Information----*/}
      <div className='mt-8'>
        <div className='mt-8 min-w-80'>
          <CartTotal/>
        </div>
        <div className='mt-12'>
          <Title text1={'PAYMENT'} text2={'METHOD'}/>
          <div className='flex gap-3 flex-col lg:flex-row'>
            <div onClick={()=> setMethod('stripe')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'stripe' ? 'bg-green-400' : ''}`}></p>
              <img className='h-5 mx-4' src={assets.stripe_logo} alt=''/>
            </div>
            <div onClick={()=> setMethod('razorpay')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'razorpay' ? 'bg-green-400' : ''}`}></p>
              <img className='h-5 mx-4' src={assets.razorpay_logo} alt=''/>
            </div>
            <div onClick={()=> setMethod('cod')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
              <p className='text-gray-500 text-sm font-medium mx-4'>CASH ON DELIVERY</p>
            </div>
          </div>
          <div className='w-full text-center mt-8'>
            <button type='submit' 
            className='bg-black rounded text-white px-16 py-3 text-sm cursor-pointer'>
              PLACE ORDER
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder