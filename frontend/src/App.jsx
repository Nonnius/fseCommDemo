import { Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/Home.jsx'
import Collections from './pages/Collections.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Product from './pages/Product.jsx'
import Login from './pages/Login.jsx'
import PlaceOrder from './pages/PlaceOrder.jsx'
import Orders from './pages/Orders.jsx'
import Navbar from './components/Navbar.jsx'
import Cart from '/src/pages/Cart.jsx'
import Footer from './components/Footer.jsx'
import SearchBar from './components/SearchBar.jsx'
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
