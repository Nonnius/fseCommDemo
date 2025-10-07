import React from 'react'
import {assets} from '/src/assets/assets.js'

const Footer = () => {
  return (
    <>
    <hr/>
    <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-20 text-sm'>
        <div>
            <img src={assets.logo} alt='' className='mb-5 w-32'/>
            <p className='w-full md:w-2/3 text-gray-600'>Lorem ipsum dolor sit amet consectetur 
            adipisicing elit. Asperiores quaerat tempore, modi, hic deserunt pariatur numquam
            et expedita voluptatem voluptatum officia minus repellendus recusandae! 
            Magni neque iusto nesciunt nostrum quod.
            </p>
        </div>
        <div>
            <p className='text-xl font-medium mb-5'>COMPANY</p>
            <ul className='flex flex-col gap-1 text-gray-600'>
                <li>Home</li>
                <li>About Us</li>
                <li>Delivery</li>
                <li>Privacy Policy</li>
            </ul>
        </div>
        <div>
            <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
            <ul className='flex flex-col gap-1 text-gray-600'>
                <li>1-800-123-1234</li>
                <li>contact@mockemail.com</li>
            </ul>
        </div>
        
    </div>
    <div>
        <hr/>
        <p className='py-5 text-sm text-center'>
        ©2025 Derivative from GS, Developed by: O'marr Reid - All Rights Reserved
        </p>
    </div>
    </>
  )
}

export default Footer