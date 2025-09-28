import React, { useContext, useState } from 'react'
import '/src/components/navbar.css'
import {assets} from '/src/assets/assets.js'
import { Link, NavLink } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'



const Navbar = () => {
    const [visible, setVisible] = useState(false);

    const {setShowSearch, getCartCount, navigate, token, setToken, setCartItems} = useContext(ShopContext);

    //Logout function
    const logout = () =>{
        navigate('/Login')
        localStorage.removeItem('token')
        setToken('')  
        setCartItems({})          
    }
   
    

  return (
    <div className='flex items-center justify-between py-5 font-medium'>

    {/*----Logo Link to HomePage logic----*/}
        <Link to='/'>
        <img src={assets.logo} alt='' className='w-36'/></Link>
        <ul className='hidden sm:flex gap-5 text-sm text-gray-700'>
            <NavLink to='/' className='flex flex-col items-center gap-1'>
                <p>HOME</p>
                <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
            </NavLink>
             <NavLink to='/Collections' className='flex flex-col items-center gap-1'>
                <p>COLLECTION</p>
                <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
            </NavLink>
             <NavLink to='/About' className='flex flex-col items-center gap-1'>
                <p>ABOUT</p>
                <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
            </NavLink>
             <NavLink to='/Contact' className='flex flex-col items-center gap-1'>
                <p>CONTACT</p>
                <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
            </NavLink>
        </ul>

        {/*----Right Side----*/}
        <div className='flex items-center gap-6'>
            <img onClick={()=>setShowSearch(true)} src={assets.search_icon} alt='' 
            className='w-5 cursor-pointer'/>
            <div className='group relative'>
                <img onClick={()=> token ? null : navigate('/Login')} src={assets.profile_icon} alt='' className='w-5 cursor-pointer'/>

                {/*Dropdown feature */}
                {token && <div className='group-hover:block hidden absolute dropdown-menu right-0 -left-14 pt-4 -mt-2'>
                    <div className='flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-5 rounded'>
                        <p className='cursor-pointer hover:text-black hover:bg-gray-300 px-2 rounded'>My Profile</p>
                        <p onClick={()=>navigate('/Orders')} className='cursor-pointer hover:text-black hover:bg-gray-300 
                        px-2 rounded'>Orders</p>
                        <p onClick={logout}
                        className='cursor-pointer hover:text-black hover:bg-gray-300 px-2 rounded'>Logout</p>
                    </div>
                </div>}                
            </div>
            <Link to='/Cart' className='relative'>
                <img src={assets.cart_icon} alt='' className='w-5 min-w-5'/>
                <p className='absolute right-[-5px] bottom-[-5px] w-4 text-center bg-black text-white 
                rounded-full text-[8px]'>{getCartCount()}
                </p>
            </Link>
            <img onClick={()=>setVisible(true)} src={assets.menu_icon} alt='' className='w-5 cursor-pointer sm:hidden'/>
        </div>
        {/*----Mobile Menu----*/}
        <div className={`mobile absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all md:hidden lg:hidden ${visible ? 'w-full' : 'w-0'}`}>
            <div className='flex flex-col text-gray-600'>
                <div onClick={()=>setVisible(false)} className='flex items-center gap-4 p-3'>
                    <img src={assets.dropdown_icon} alt='' className='h-4 rotate-180 cursor-pointer'/>
                    <p>Back</p>
                </div>
                <div className='flex flex-col mt-6 text-[18px]'>
                    <NavLink onClick={()=>setVisible(false)} to='/' 
                    className='px-4 py-2 ease-in-out border-1 border-gray-300 hover:bg-gray-300'>
                        HOME
                    </NavLink>
                    <NavLink onClick={()=>setVisible(false)} to='/Collections' 
                    className='px-4 py-2 ease-in-out border-1 border-gray-300 hover:bg-gray-300'>
                        COLLECTION
                    </NavLink>
                    <NavLink onClick={()=>setVisible(false)} to='/About' 
                    className='px-4 py-2 ease-in-out border-1 border-gray-300 hover:bg-gray-300'>
                        ABOUT
                    </NavLink>
                    <NavLink onClick={()=>setVisible(false)} to='/Contact' 
                    className='px-4 py-2 ease-in-out border-1 border-gray-300 hover:bg-gray-300'>
                        CONTACT
                    </NavLink>
                </div>
            </div>
        </div>
    </div>

  )
}

export default Navbar