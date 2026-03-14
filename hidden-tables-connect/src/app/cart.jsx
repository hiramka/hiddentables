import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartItem from '../components/CartItem';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  
  const removeFromCart = (id) => {
    setCart(cart.filter(i => i.id !== id));
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!user) return alert("Please login first");
    const { data: order } = await supabase.from('orders').insert([{ 
      user_id: user.id,
      restaurant_id: cart[0]?.restaurant_id,
      total_price: total,
      status: 'pending'
    }]).select().single();

    const orderItems = cart.map(i => ({
      order_id: order.id,
      menu_item_id: i.id,
      quantity: i.quantity,
      price: i.price
    }));

    await supabase.from('order_items').insert(orderItems);
    alert("Order placed!");
    setCart([]);
  };

  return (
    <>
      <Navbar />
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
        {cart.length === 0 ? <p>Cart is empty</p> :
          <>
            {cart.map(item => <CartItem key={item.id} item={item} removeFromCart={removeFromCart} />)}
            <p className="font-bold mt-4">Total: KSh {total}</p>
            <button className="mt-2 bg-orange-600 text-white px-4 py-2 rounded" onClick={handleCheckout}>
              Checkout
            </button>
          </>
        }
      </main>
      <Footer />
    </>
  );
}