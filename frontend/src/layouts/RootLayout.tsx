import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export function RootLayout() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      {/* Main content */}
      <main className="max-w-7xl mx-auto pt-4">
        <Outlet />
      </main>
    </div>
  );
} 