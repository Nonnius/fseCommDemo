import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '/src/components/Title.jsx'
import axios from 'axios';


const Orders = () => {
  const {backendUrl, token, currency} = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);
  // local status overrides for quick UI feedback when tracking
  const [localStatuses, setLocalStatuses] = useState({});
  const loadOrderData = async () => {  //function is ran when page loads
   
    try {
      if (!token) {
        return null
      }
      // send both a Bearer Authorization header and a raw `token` header
      // to cover whichever one the backend expects
      const config = {
        headers: {
          Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
          token
        }
      };

  // correct endpoint: backend mounts order routes at '/api/order' and the route is '/userorders'
  const response = await axios.post(backendUrl + '/api/order/userorders', {}, config);
      console.log('orders response ->', response.data);

      // Normalise response and set state so UI can render orders
      if (response && response.data) {
        // backend might return orders in different keys; try common ones
        const data = response.data;
        const orders = data.orders ?? data.data ?? data;
        // if payload contains a success flag, log it for inspection
        if (typeof data.success !== 'undefined') console.log('success ->', data.success);
        // make sure we set an array (or empty array)
        setOrderData(Array.isArray(orders) ? orders : []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      // keep orderData as empty array on error
      setOrderData([]);
    }
  }   
     
    
  

  useEffect(() => {
    loadOrderData()
  }, [token])
  
  return (    
    <div className='border-t pt-16'>
      <div className='text-2xl'>
        <Title text1={'MY'} text2={'ORDERS'}/>
      </div>
      <div>
        {
          // orderData is an array of order objects; each order contains an `items` array
          orderData.map((order, orderIndex) => (
            <div key={order._id ?? orderIndex} className='py-4 border-t border-b text-gray-700'>
              {/* Order header */}
              <div className='flex items-center justify-between mb-4'>
                <div className='text-sm text-gray-600'>
                  <p>Order ID: <span className='text-gray-800 font-medium'>{order._id ?? '—'}</span></p>
                  <p className='text-xs text-gray-500'>Date: {order.date ? new Date(order.date).toLocaleString() : '—'}</p>
                  <p className='text-xs text-gray-500'>Payment: <span className='text-gray-800'>{order.paymentMethod ?? 'COD'}</span> · <span className='text-gray-800'>{order.payment ? 'Paid' : 'Unpaid'}</span></p>
                </div>
                <div className='text-sm text-right'>
                    <p className='font-medium'>{currency}{order.amount ?? '0.00'}</p>
                  </div>
              </div>

              {/* Items within the order */}
              {(order.items ?? []).map((item, idx) => (
                <div key={item._id ?? idx} 
                  className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-3'>

                  <div className='flex items-start gap-6 text-sm'>
                    <img className='w-16 sm:w-20' src={item.image?.[0] ?? '/src/assets/logo.png'} alt={item.name ?? 'product'} />
                    <div>
                      <p className='sm:text-base font-medium'>{item.name ?? item._id ?? 'Unnamed product'}</p>
                      <div className='flex items-center gap-3 mt-2 text-base text-gray-700'>
                        <p className='text-lg'>{currency}{item.price ?? '0.00'}</p>
                        <p>Quantity: {item.quantity ?? 1}</p>
                        <p>Size: {item.size ?? 'M'}</p>
                      </div>
                    </div>
                  </div>

                  <div className='md:w-1/2 flex justify-between items-center'>
                    <div className='flex items-center gap-2'>
                      <p className='min-w-2 h-2 rounded-full bg-green-500'></p>
                      {/* prefer local override if present */}
                      <p className='text-sm md:text-base'>{localStatuses[order._id ?? orderIndex] ?? order.status}</p>
                    </div>
                    <button onClick={() => {
                      const id = order._id ?? orderIndex;
                      setLocalStatuses(prev => ({...prev, [id]: 'Out delivery'}));
                    }} className='border px-4 py-2 text-sm font-medium rounded-sm'>
                      Track Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))
        }
      </div>
    </div>
  
  )
}

export default Orders