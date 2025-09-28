import userModel from '../models/userModel.js'


// add products to user cart
const addToCart = async (req,res) => {
    try {
        const { itemId, size } = req.body;
        // auth middleware attaches the decoded id to req.body.user
        const userId = req.body.user || req.body.userId;

        if (!userId) {
            return res.json({ success: false, message: 'User not authenticated' });
        }

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({ success: false, message: 'User not found' });
        }

        // ensure cartData is an object
        let cartData = userData.cartData || {};

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1
            }
            else {
                cartData[itemId][size] = 1
            }
        } else {
            cartData[itemId] = {}
            cartData[itemId][size] = 1
        }

        await userModel.findByIdAndUpdate(userId, {cartData})
        res.json({success: true, message: "Added To Cart"})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// update user cart
const updateCart = async (req,res) => {
    try {
        const { itemId, size, quantity } = req.body;
        const userId = req.body.user || req.body.userId;

        if (!userId) {
            return res.json({ success: false, message: 'User not authenticated' });
        }

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({ success: false, message: 'User not found' });
        }

        let cartData = userData.cartData || {};

        // ensure nested objects exist
        cartData[itemId] = cartData[itemId] || {};

        if (quantity <= 0) {
            // remove the size entry
            delete cartData[itemId][size];
            // if no sizes remain for item, remove item
            if (Object.keys(cartData[itemId] || {}).length === 0) {
                delete cartData[itemId];
            }
        } else {
            cartData[itemId][size] = quantity;
        }

        // optional debug log
        console.log('Updating cart for user', userId, 'cartData:', cartData);

        await userModel.findByIdAndUpdate(userId, {cartData});
        res.json({success: true, message: "Cart Updated"});

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//get user cart data
const getUserCart = async (req,res) => {
    try {
        const userId = req.body.user || req.body.userId;

        if (!userId) {
            return res.json({ success: false, message: 'User not authenticated' });
        }

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({ success: false, message: 'User not found' });
        }

        let cartData = userData.cartData || {};

        res.json({ success: true, cartData });
        
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export {addToCart, updateCart, getUserCart}