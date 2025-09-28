import { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { MdStar } from "react-icons/md";
import RelatedProducts from '../components/RelatedProducts';

const Product = () => {
  const {productId} = useParams();

  //console.log(productId);  enable for trigger test only!!!
  const {products, currency, addToCart} = useContext(ShopContext);
  const [ productData, setProductData ] = useState(false);
  const [image, setImage] = useState('');
  const userId = localStorage.getItem('userId');

  //Star Rating Wiring
  const [rating, setRating] = useState(0); 

  //Star Count Logic
  const [ratingCount, setRatingCount] = useState(128);

  //Product size logic
  const [size, setSize] = useState('');

  const fetchProductData = async () => {
    products.map((item)=> {
      if(item._id ===productId){
        setProductData(item)
       //console.log(item);   --enable for trigger test only!!!
        setImage(item.image[0])
        return null;
      }
    })
  }
  
  useEffect(() =>{
    fetchProductData();
  },[productId, products])

  return productData ? (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      {/*----Single Page Product Data----*/}
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>

        {/*----Product Angle Images----*/}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between
          sm:justify-normal sm:w-[18.7%] w-full'>
            {
              productData.image.map((item,index)=>(

                //----Side image switch function
                <img onClick={()=>setImage(item)} src={item} key={index} alt='' 
                className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer'/>
              ))
            }
          </div>
          {/*----Product Main Image----*/}
          <div className='w-full sm:w-[80%]'>
            <img className='w-full h-auto' src={image} alt=''/>
          </div>
        </div>

        {/*----Product Info----*/}
        <div className='flex-1'>
          <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>

          {/*Product Star Rating Clickable Stars*/}
          <div className='flex items-center gap-1 mt-2'>
            {[...Array(5)].map((_, index)=>{
              const starValue = index + 1;
              return(
                <button
                  key={starValue}
                  type="button"
                  onClick={() => {
                    setRating(starValue);
                    setRatingCount(prev => prev + 1);
                  }}                  
                  className='focuse:outline-none'>
                     <MdStar
                        size={20}
                        className={`transition-colors duration-200 
                        ${starValue <= rating
                          ? 'text-yellow-400' : 'text-gray-300'}`}
                     />                         
                </button>                
              )
            })}
             <span className='text-sm text-gray-600'>
              {ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'}
             </span>
          </div>

          {/*----Product Price & Description*/}
          <p className='mt-5 text-3xl font-medium'>{currency}{productData.price}</p>
          <p className='mt-5 text-gray-500 md:w-4/5'>{productData.description}</p>

          {/*----Product Size----*/}
          <div className='flex flex-col gap-4 my-8'>
            <p>Select Size</p>
            <div className='flex gap-3'>
              {productData.sizes.map((item,index)=>(
                <button key={index} 
                onClick={()=>setSize(item)}
                className={`border px-2 text-[14px] bg-gray-100
                ${item === size ? 'border-pink-600 bg-gray-200' : ''}`}>
                {item}
                </button>
              ))}
            </div>
          </div>

          {/*----Add to Cart Button----*/}
          <button onClick={()=> addToCart(productData._id,size, userId)}
          className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700'>
            ADD TO CART
          </button>
          <hr className='mt-8 sm:w-4/5'/>

          {/*----Delivery Info----*/}
          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
            <p>100% Original product.</p>
            <p>Cash on delivery is available on this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/*----Description & Review Section----*/}
      <div className='mt-20'>
        <div className='flex'>
          <b className='border px-5 py-3 text-sm'>Description</b>
          <p className='border px-5 py-3 text-sm'>Reviews (128)</p>
        </div>
        <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500'>
          <p>An e-commerce website is an obline platform that facilitates the buying and selling of products or services over the internet.
          It serves as a virtual marketplace where businesses and indivduals can showcase their products, interact with customers, and conduct
          transactions without the need for a physical presence. E-commerce websites have gained immense popularity due to their convenience,
          accessibility, and the global reach they offer.
          </p>
          <p>E-commerce websites typically display products or services along with detailed descriptions, images, prices, and any available
          variation (e.g., sizes, colors). Each product usually has its own dedicated page with relevant information.
          </p>
        </div>
      </div>

      {/*----Related Products Display----*/}
      <RelatedProducts category={productData.category} subCategory={productData.subCategory}/>
    </div>
  ): <div className='opacity-0'></div>
}

export default Product