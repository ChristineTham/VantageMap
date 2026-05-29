import Link from "next/link";

/**
 * Global 404 page — shown when no route matches.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <h1 className="font-serif text-4xl font-bold text-rosely-night">404</h1>
      <p className="mt-2 text-sm text-rosely-mist">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center rounded-lg bg-rosely-plum px-4 py-2 text-sm font-medium text-white hover:bg-rosely-plum/90 transition-colors"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
