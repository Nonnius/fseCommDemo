import React, { useState } from 'react'
import axios from 'axios'
import hero_img from '../assets/hero_img.png'
import { assets } from '../assets/assets'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'


const Login = ({setToken}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    //API/Backend Merger
    const onSubmitHandler = async (e) => {
        try {
            e.preventDefault(); //prevents page re-render
            const response = await axios.post(backendUrl + '/api/user/admin',{email, password})
            //console.log(response); only for testing
            if(response.data.success){
                setToken(response.data.token)
            } else{
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message)
        }
    }


  return (
    <div className='w-full h-screen bg-cover bg-center flex  overflow-hidden'
      style={{backgroundImage:`url(${hero_img})`}}>
        <div className='relative h-screen w-full'>
        <img  className='absolute top-6 left-6' src={assets.logo} alt=''/>
            <div className='flex items-center justify-center h-full'>
                <div className=" top-[15rem] bg-pink-500/10 backdrop-blur-md rounded-lg px-8 py-6 max-w-md border-1 
                border-pink-400 shadow-lg items-center justify-center mx-auto">
                    <h1 className='font-bold mb-2 text-2xl'>Admin Panel</h1>
                    <form onSubmit={onSubmitHandler}>
                        <div className='mb-3 min-w-72'>
                            <p className='text-sm font-medium text-gray-700 mb-2'>Email Address</p>
                            <input onChange={(e) =>setEmail(e.target.value)} value={email}
                            className='rounded-md w-full px-3 py-2 border text-gray-500 border-pink-800 outline-none' 
                            type='email' placeholder='your@email.com' req/>
                        </div>
                        <div className='mb-3 min-w-72'>
                            <p className='text-sm font-medium text-gray-700 mb-2'>Password</p>
                            <input onChange={(e) =>setPassword(e.target.value)} value={password}
                            className='rounded-md w-full px-3 py-2 border text-gray-500 border-pink-800 outline-none' 
                            type='password' placeholder='Enter your password' req/>
                        </div>
                        <button className='mt-2 w-full py-2 px-4 rounded-md text-white bg-black 
                        border-1 border-pink-800 hover:bg-gray-900' type='submit'>Login</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Login