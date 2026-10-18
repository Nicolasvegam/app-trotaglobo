import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200 py-4">
      <div className="mx-auto px-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <div className="flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Trotaglobo Logo"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
            </div>
            <div className="ml-2 font-semibold text-xl text-neutral-900">Trotaglobo</div>
          </Link>
        </div>
      </div>
    </header>
  );
} 