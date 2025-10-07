import React, { createContext, useEffect, useState } from 'react'
//import {products} from '/src/assets/assets.js'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'

export const ShopContext = createContext();

const ShopContextProvider = (props) => {

    const currency = '$';
    const delivery_fee = 10;
    const backendUrl = import.meta.env.VITE_BACKEND_URL  //img cloud storage connector

    //search function
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState([]);
    const [subCategory, setSubCategory] = useState([]);
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [products, setProducts] = useState([]);
    const [token, setToken] = useState('');
    const navigate = useNavigate();
    

    //Product size Add to Cart Function
    const addToCart = async (itemId, size) => {

        if (!size) {
            toast.error('Select Product Size')
            console.log('size:', size);
            return;
        }

        let cartData = structuredClone(cartItems); //object copy creation of cart item
        if(cartData[itemId]){
            if(cartData[itemId][size]){
                cartData[itemId][size] += 1;
            }
            else{
            cartData[itemId][size] = 1;
            }
        }        
        else{
            cartData[itemId] = {};
            cartData[itemId][size] = 1;
        }
        setCartItems(cartData);

        if (token) {
            try {
                await axios.post(backendUrl + '/api/cart/add', {itemId,size}, {headers:{token}})
            } catch (error) {
                console.log(error)
                toast.error(error.message)
            }
        }
    }

    //useEffect(() => {   //for trigger test only!!
        //console.log(cartItems)
    //},[cartItems])
   
    //Cart Count Feature function
    const getCartCount = () => {
        let totalCount = 0;
        for(const items in cartItems){ //targets item
            for(const item in cartItems[items]) //targets item size
                try{
                    if(cartItems[items][item] > 0) //this portion establishes total count
                        totalCount += cartItems[items][item];
                } catch (error) {

                }
        }
        return totalCount;

    }

    //Cart item counter feature wiring
    const updateQuantity = async (itemId, size, quantity) => {
        // update local state immediately for snappy UI
        let cartData = structuredClone(cartItems);
        // ensure structures exist
        cartData[itemId] = cartData[itemId] || {};

        if (quantity <= 0) {
            // remove size entry
            delete cartData[itemId][size];
            // if no sizes remain, remove the item key
            if (Object.keys(cartData[itemId]).length === 0) delete cartData[itemId];
        } else {
            cartData[itemId][size] = quantity;
        }

        setCartItems(cartData);

        // persist to backend when authenticated
        if (token) {
            try {
                await axios.post(backendUrl + '/api/cart/update', { itemId, size, quantity }, { headers: { token } });
            } catch (error) {
                console.log('Failed to persist cart update:', error);
                toast.error('Could not update cart on server');
            }
        }
    }
    

    
    //Cart page Order Sum Total Feature wiring
    const getCartAmount = () => {
        let totalAmount = 0;
        for(const items in cartItems){
            // Find matching product by id (coerce to string for safety)
            let itemInfo = products.find((product) => String(product._id) === String(items));
            for(const item in cartItems[items]){
                try{
                    if (cartItems[items][item] > 0) {
                        if (!itemInfo) {
                            // Product missing from products list (could be a stale cart entry)
                            console.warn('Product not found for cart item id:', items);
                            continue; // skip adding price for missing product
                        }
                        // Ensure price exists and is a number
                        const price = Number(itemInfo.price) || 0;
                        totalAmount += price * cartItems[items][item];
                    }
                } catch (error){
                    console.log(error)
                    toast.error(error.message)
                }
            }
        }
        return totalAmount;
    }

    const getProductsData = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/product/listProducts')
            //console.log(response.data) trigger test only
            if(response.data.success){
                setProducts(response.data.products)
            }
            else{
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    //re-render page load cart revert to 0 preventer
    const getUserCart = async ( token ) => {
        try {
            const response = await axios.post(backendUrl + '/api/cart/get', {}, {headers:{token}})
            if (response.data.success) {
                setCartItems(response.data.cartData)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    useEffect(()=>{
        getProductsData()
    },[])

    //Re-render preventer
    useEffect(()=>{
        if (!token && localStorage.getItem('token')) {
            setToken(localStorage.getItem('token'))
            getUserCart(localStorage.getItem('token'))
        }
    },[])

    const value = {
        products,
        currency,
        delivery_fee,
        search,
        setSearch,
        showSearch,
        setShowSearch,
        category,
        setCategory,
        subCategory,
        setSubCategory,
        cartItems,
        setCartItems,
        addToCart,
        getCartCount,
        updateQuantity,
        getCartAmount,
        navigate,
        backendUrl,
        setToken,
        token
    }

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider;