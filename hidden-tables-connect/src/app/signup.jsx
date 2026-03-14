import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const router = useRouter();

  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return alert(error.message);

    await supabase.from('users').insert([{ name: email.split('@')[0], email, role }]);
    router.push('/login');
  };

  return (
    <>
      <Navbar />
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Signup</h1>
        <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="border p-2 w-full mb-2"/>
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="border p-2 w-full mb-2"/>
        <select value={role} onChange={e=>setRole(e.target.value)} className="border p-2 w-full mb-2">
          <option value="customer">Customer</option>
          <option value="restaurant">Restaurant Owner</option>
        </select>
        <button className="bg-orange-600 text-white px-4 py-2 rounded" onClick={handleSignup}>Signup</button>
      </main>
      <Footer />
    </>
  );
}