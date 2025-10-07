import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '/src/components/Title.jsx'
import ProductItem from './ProductItem';




const RelatedProducts = ({category,subCategory}) => {
    const { products } = useContext(ShopContext);    
    const [related1, setRelated1] = useState([]);

      useEffect(() =>{
        if(products.length > 0) {
            let productsCopy = products.slice();

            productsCopy = productsCopy.filter((item) => category === item.category);
            productsCopy = productsCopy.filter((item) => subCategory === item.subCategory);

            setRelated1(productsCopy.slice(0, 5));
        }
      },[products])
 
  

  return (
    <div className='my-24'>
        <div className='text-center text-3xl py-2'>
            <Title text1={'RELATED'} text2={'PRODUCTS'}/>            
        </div>

        {/*----Related Product Items Images & info*/}
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
            {
             related1.map((item,index)=>(
              <ProductItem
              key={index} 
              name={item.name} 
              id={item._id} 
              price={item.price} 
              image={item.image}/>
            ))
          }
        </div>
    </div>
  )
}

export default RelatedProducts