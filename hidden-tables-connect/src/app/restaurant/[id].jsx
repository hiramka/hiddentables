import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import MenuItemCard from '../../components/MenuItemCard';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function RestaurantMenu() {
  const router = useRouter();
  const { id } = router.query;
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      const { data: restData } = await supabase.from('restaurants').select('*').eq('id', id).single();
      setRestaurant(restData);

      const { data: items } = await supabase.from('menu_items').select('*').eq('restaurant_id', id);
      setMenuItems(items);
    };
    fetchData();
  }, [id]);

  const addToCart = (item) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) return prev.map(i => i.id === item.id ? {...i, quantity: i.quantity + 1} : i);
      return [...prev, {...item, quantity:1}];
    });
  };

  if (!restaurant) return <p>Loading...</p>;

  return (
    <>
      <Navbar />
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">{restaurant.name}</h1>
        <p className="mb-6">{restaurant.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menuItems.map(item => <MenuItemCard key={item.id} item={item} addToCart={addToCart} />)}
        </div>
      </main>
      <Footer />
    </>
  );
}