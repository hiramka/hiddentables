import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import RestaurantCard from '../components/RestaurantCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      const { data } = await supabase.from('restaurants').select('*');
      setRestaurants(data);
    };
    fetchRestaurants();
  }, []);

  return (
    <>
      <Navbar />
      <main className="p-6">
        <h2 className="text-xl font-semibold mb-4">Discover Hidden Tables</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {restaurants.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
        </div>
      </main>
      <Footer />
    </>
  );
}