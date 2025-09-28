import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import {backendUrl, currency} from '../App.jsx'
import { toast } from 'react-toastify'
import { FaShippingFast } from "react-icons/fa";



const Orders = ({token}) => {

  const [orders, setOrders] = useState([])

  // pick best date field and format it safely
  const formatOrderDate = (order) => {
    // possible fields where backend might store date
    const candidates = [order?.createdAt, order?.date, order?.address?.date]
    for (const c of candidates) {
      if (!c) continue
      // If it's already a Date instance
      if (c instanceof Date && !isNaN(c)) return c.toLocaleString()
      // Try parsing strings or numbers
      const parsed = new Date(c)
      if (!isNaN(parsed)) return parsed.toLocaleString()
    }
    return 'Date not available'
  }

  const fetchAllOrders = useCallback(async () => {
    if (!token) {
      return null
    }
    try {
    const response = await axios.post(backendUrl + '/api/order/list',{},{headers:{token}})
    //console.log(response.data) for testing only
    if (response.data.success) {
      setOrders(response.data.orders)
    } else {
      toast.error(response.data.message)
    }
    } catch (error) {
      toast.error(error.message)
    }
  }, [token])

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(backendUrl + '/api/order/status', {orderId, status: event.target.value}, {headers: {token}})
      if (response.data.success) {
        await fetchAllOrders()
      } 
    } catch (error) {
      console.log(error)
      toast.error(response.data.message)
    }
  }

  useEffect(() => {
    fetchAllOrders();
  }, [token, fetchAllOrders])


  return (
    <div>
      <h3>Order Page</h3>
      <div className='space-y-3 text-xs sm:text-sm text-gray-700'>
        {
          orders.map((order, index) => (
            <div key={index} className='grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4'>
              <div className='flex items-start space-x-3'>
                <FaShippingFast className='w-12 text-blue-800 text-2xl'/> 
              </div>
              <div>
                <div>
                  <p className='font-bold underline'>Purchase Summary:</p>
                  {Array.isArray(order.items) ? order.items.map((item, idx)=>{
                    const sep = idx === order.items.length - 1 ? '' : ', '
                    return <span className='py-0.5' key={idx}>{item.name} qty: {item.quantity} <span>{item.size}</span>{sep}</span>
                  }) : <p>No items</p>}
                </div>
                <p>{formatOrderDate(order)}</p>
                <p className='font-bold underline'>Name:</p>
                <p>{(order.address?.firstName || '') + (order.address?.lastName ? ' ' + order.address.lastName : '')}</p>
                <div>
                  <p className='font-bold underline'>Address:</p>
                  <p>{order.address?.street}</p>
                  <p>{[order.address?.city, order.address?.state, order.address?.country, order.address?.zipcode].filter(Boolean).join(', ')}</p>
                </div>
                <p className='font-bold underline'>Contact:</p>
                <p>{order.address?.phone}</p>
              </div>
              <div className='mt-4'>
                <p>Items : {Array.isArray(order.items) ? order.items.length : 0}</p>
                <p>Method : {order.paymentMethod}</p>
                <p>Payment : { order.payment ? 'Done' : 'Pending' }</p>
                <p>Date : {order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div className='flex items-center mt-4'>
                <p className='font-bold'>Total: {currency} {order.amount}</p>
              </div>
              <div className='mt-4'>
                <select onChange={(event)=>statusHandler(event, order._id)} value={order.status} className='border-2 border-pink-500 rounded-md p-1 text-[12px]'>
                  <option value="Order Placed">Order Placed</option>
                  <option value="Packing">Packing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for delivery">Out for delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default Orders