import { Link } from '@tanstack/react-router';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-[70px] items-center justify-between border-b border-white/5 bg-background/80 px-4 backdrop-blur-xl md:px-8">

      {/* Logo */}
      <div className="flex items-center gap-2">
        <Link to="/" className="text-xl font-extrabold tracking-tight text-primary hover:opacity-90 md:text-2xl">
          CandiDash
        </Link>
      </div>

      {/* Desktop Navigation (Hidden on mobile) */}
      <nav className="hidden items-center gap-3 md:flex">
        <Link
          to="/login"
          className="rounded-xl border border-primary px-5 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary/10"
        >
          Connexion
        </Link>

        <Link
          to="/"
          className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#e84232] hover:-translate-y-[1px]"
        >
          Créer un compte
        </Link>
      </nav>

      {/* Mobile Burger Button (Visible < md) */}
      <button
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-white hover:bg-white/5 md:hidden"
        onClick={toggleMenu}
        aria-label="Ouvrir le menu"
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="absolute left-0 right-0 top-[70px] border-b border-white/5 bg-[#0f1115]/95 px-4 py-6 backdrop-blur-xl md:hidden">
            <nav className="flex flex-col gap-4">
              <Link
                to="/login"
                className="flex w-full items-center justify-center rounded-xl border border-primary py-3 text-base font-bold text-primary hover:bg-primary/10"
                onClick={() => setIsMenuOpen(false)}
              >
                Connexion
              </Link>
              <Link
                to="/"
                className="flex w-full items-center justify-center rounded-xl bg-primary py-3 text-base font-bold text-white shadow-lg hover:bg-[#e84232]"
                onClick={() => setIsMenuOpen(false)}
              >
                Créer un compte
              </Link>
            </nav>
        </div>
      )}
    </header>
  );
}
