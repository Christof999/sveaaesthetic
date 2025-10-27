import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-light text-gray-600 mb-8">
          SVEAAESTHETIC
        </h1>
        <div className="border-t border-gray-200 pt-8">
          <div className="space-y-4">
            <Link 
              href="/admin/login"
              className="block px-8 py-3 bg-gray-800 text-white hover:bg-gray-700 transition-colors"
            >
              Admin Login
            </Link>
            <p className="text-sm text-gray-500 mt-4">Kundenbereich folgt in Kürze</p>
          </div>
        </div>
      </div>
    </div>
  );
}
