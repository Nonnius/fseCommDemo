import React from 'react'
import Title from '/src/components/Title.jsx'
import {assets} from '/src/assets/assets.js'
import NewsLetterBox from '/src/components/NewsLetterBox.jsx'

const About = () => {
  return (
    <div>
      <div className='text-2xl text-center pt-8 border-t'>
        <Title text1={'ABOUT'} text2={'US'}/>        
      </div>
      <div className='my-10 flex flex-col lg:flex-row gap-16'>
        <img className='aboutImg w-full md:mx-auto md:max-w-[600px] md:max-h-[450px] lg:max-w-[450px]' src={assets.about_img} alt=''/>
        <div className='flex flex-col justify-center gap-6 text-gray-600'>
          <p>Forever was born out of a passion for innovation and a desire to revolutionize the way
          people shop online. Our journey began with a simple idea: to provide a platform where
          customers can easily discover, and purchase a wide range of products from the comfort of
          their homes.
          </p>
          <p>Since our inception, we've worked tirelessly to curate a diverse selection of high-quality
          products that cater to every taste and preference. From fashion and beauty to electronics
          and home essentials, we offer an extensive collection sourced from trusted brands and suppliers.
          </p>
          <b className='text-gray-800 underline'>Our Mission</b>
          <p>Our mission at Forever is to empower customers with choice, convenience, and confidence.
          We're dedicated to providing a seamless shopping experience that exceeds expectations from
          browsing and ordering and beyond.
          </p>
        </div>
      </div>
      <div className='text-xl py-4'>
        <Title text1={'WHY'} text2={'CHOOSE US'}/>
      </div>
      <div className='flex flex-col md:flex-row text-sm mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Quality Assurance</b>
          <p className='text-gray-600'>
            We maticulously select and vet each product to ensure it meets our stringent
            quality standards.
          </p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Convenience:</b>
          <p className='text-gray-600'>
            With our user-friendly interface and hassle-free ordering process, shopping
            has never been easier.
          </p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Exceptional Customer Service:</b>
          <p className='text-gray-600'>
            Our team of dedicated professionals are here to assist you along the way,
            ensuring with the top priority that every customer is satisfied.
          </p>
        </div>
      </div>
      <NewsLetterBox/>
    </div>
  )
}

export default About