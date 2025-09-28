import { Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Collections from './pages/Collections'
import About from './pages/About'
import Contact from './pages/Contact'
import Product from './pages/Product'
import Login from './pages/Login'
import PlaceOrder from './pages/PlaceOrder'
import Orders from './pages/Orders'
import Navbar from './components/Navbar'
import Cart from '/src/pages/Cart.jsx'
import Footer from './components/Footer'
import SearchBar from './components/SearchBar'
import { ToastContainer, toast } from 'react-toastify';
import Verify from './pages/Verify.jsx'

function App() {
  

  return (
    <>
      <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
        <ToastContainer/>
        <Navbar/>
        <SearchBar/>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/Collections' element={<Collections/>}/>
          <Route path='/About' element={<About/>}/>
          <Route path='/Contact' element={<Contact/>}/>
          <Route path='/Product/:productId' element={<Product/>}/>
          <Route path='/Cart' element={<Cart/>}/>
          <Route path='/Login' element={<Login/>}/>
          <Route path='/PlaceOrder' element={<PlaceOrder/>}/>
          <Route path='/Orders' element={<Orders/>}/>
          <Route path='/Verify' element={<Verify/>}/>
        </Routes>
        <Footer/>
      </div>
      
    </>
  )
}

export default App
