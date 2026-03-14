import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

export default function Navbar() {
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="bg-orange-600 text-white p-4 flex justify-between items-center">
      <Link href="/"><h1 className="font-bold text-xl">Hidden Tables</h1></Link>
      <div className="space-x-4">
        <Link href="/">Home</Link>
        {user && user.role === 'customer' && <Link href="/cart">Cart</Link>}
        {user && <Link href="/profile">Profile</Link>}
        {user && user.role === 'restaurant' && <Link href="/dashboard">Dashboard</Link>}
        {!user ? <Link href="/login">Login</Link> : <button onClick={handleLogout}>Logout</button>}
      </div>
    </nav>
  );
}