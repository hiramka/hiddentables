import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import OrderCard from '../components/OrderCard';

export default function Profile() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      const { data } = await supabase.from('orders').select('*, order_items(*)').eq('user_id', user.id);
      setOrders(data);
    };
    fetchOrders();
  }, [user]);

  if (!user) return <p>Please login first</p>;

  return (
    <>
      <Navbar />
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
        {orders.length === 0 ? <p>No orders yet.</p> :
          orders.map(o => <OrderCard key={o.id} order={o} />)
        }
      </main>
      <Footer />
    </>
  );
}