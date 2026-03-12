import { useEffect } from 'react';
import { Clock } from 'lucide-react';

const Inventory = () => {
  useEffect(() => {
    // Redirect to Knoweb Inventory registration after 3 seconds
    const timer = setTimeout(() => {
      window.location.href = 'http://localhost:5173/register';
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
          <Clock className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Inventory Management</h2>
        <p className="text-gray-600 mb-6">
          Please register or login to access your inventory system.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          You will be redirected to our secure registration page in a moment...
        </p>
        <a
          href="http://localhost:5173/register"
          className="inline-block w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
        >
          Continue to Registration
        </a>
      </div>
    </div>
  );
};

export default Inventory;
