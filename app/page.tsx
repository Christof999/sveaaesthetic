import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-[var(--foreground)] mb-2">
          SVEAAESTHETIC
        </h1>
        <p className="text-sm text-[var(--muted)] mb-10 tracking-wide">
          Nagel Design Studio
        </p>
        <div className="space-y-4">
          <Link
            href="/admin/login"
            className="block px-8 py-3.5 bg-[var(--accent)] text-white font-medium rounded-xl hover:bg-[var(--accent-hover)] transition-all duration-200 shadow-sm hover:shadow"
          >
            Admin Login
          </Link>
          <p className="text-sm text-[var(--muted)] pt-4">
            Kundenbereich folgt in Kürze
          </p>
        </div>
      </div>
    </div>
  );
}
