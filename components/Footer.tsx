import React from 'react';
import { PhoneIcon, EnvelopeIcon, MapPinIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { contactDetails } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold">Ratan <span className="text-accent">Agri Tech</span></h3>
            <p className="text-gray-300">Empowering farmers with modern agricultural solutions.</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Quick Links</h4>
            <ul className="space-y-1 text-gray-300">
              <li><a href="#/" className="hover:text-accent">Home</a></li>
              <li><a href="#/products" className="hover:text-accent">Products</a></li>
              <li><a href="#/about-us" className="hover:text-accent">About Us</a></li>
              <li><a href="#/contact" className="hover:text-accent">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Contact</h4>
            <p className="text-gray-300">{contactDetails.address}</p>
            <p className="text-gray-300">+91 {contactDetails.mobile}</p>
            <p className="text-gray-300">{contactDetails.email}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Newsletter</h4>
            <NewsletterForm />
          </div>
        </div>

        <div className="text-center text-gray-400 mt-8">&copy; {new Date().getFullYear()} Ratan Agri Tech. All rights reserved.</div>
      </div>
    </footer>
  );
};

export default Footer;

const NewsletterForm: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = React.useState<string>('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      const base = (import.meta as any)?.env?.VITE_API_URL || '';
      const res = await fetch(`${base}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        throw new Error(data.error || 'Subscription failed');
      }
      setStatus('success');
      setMessage('Thanks for subscribing!');
      setEmail('');
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.message || 'Something went wrong. Please try again.');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        className="w-full px-3 py-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="mt-2 w-full py-2 bg-white text-gray-900 font-extrabold rounded hover:bg-gray-100 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
      </button>
      {message ? (
        <div className={`mt-2 text-sm ${status === 'error' ? 'text-red-400' : 'text-green-400'}`}>{message}</div>
      ) : null}
    </form>
  );
};
