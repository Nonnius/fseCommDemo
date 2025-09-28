import React from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'
import { BsCardChecklist } from "react-icons/bs";
import { BiPurchaseTag } from "react-icons/bi";
import { MdOutlineAddCircleOutline } from "react-icons/md";

const Sidebar = () => {
  return (
    <div className='w-[18%] min-h-screen border-r-2'>
        <div className='flex flex-col gap-4 pt-6 pl-[20%] text-[15px]'>
            <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to='/add'>
                <MdOutlineAddCircleOutline className='text-[22px]'/>
                <p className='hidden md:block'>Add Items</p>
            </NavLink>
            <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to='/list'>
                <BsCardChecklist className='text-[22px]'/>
                <p className='hidden md:block'>List Items</p>
            </NavLink>
            <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to='/orders'>
                <BiPurchaseTag className='text-[22px]'/>
                <p className='hidden md:block'>Orders</p>
            </NavLink>
        </div>
    </div>
  )
}

export default Sidebar