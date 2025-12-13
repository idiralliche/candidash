import { Link, useNavigate } from '@tanstack/react-router';
import { Menu, X, User, LayoutDashboard, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';

// Shadcn Components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from './ui/button';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: '/' });
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-[70px] items-center justify-between border-b border-white/5 bg-background/80 px-4 backdrop-blur-xl md:px-8">
      {/* Logo */}
      <Link to="/" className="text-xl font-extrabold tracking-tight text-primary hover:opacity-90 md:text-2xl">
        CandiDash
      </Link>

      {/* --- DESKTOP NAVIGATION --- */}
      <nav className="hidden items-center gap-3 md:flex">
        {isAuthenticated ? (
          // CONNECTED MODE: User Dropdown
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-white/10 bg-white/5 hover:bg-white/10">
                <User className="h-5 w-5 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-[#13151a] text-white border-white/10" align="end">
              <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />

              <DropdownMenuItem className="cursor-pointer focus:bg-white/10 focus:text-white" onClick={() => navigate({ to: '/dashboard' })}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Tableau de bord</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-white/10" />

              <DropdownMenuItem className="cursor-pointer text-red-500 focus:bg-red-500/10 focus:text-red-500" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Se déconnecter</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          // DISCONNECTED MODE: Classic buttons
          <>
            <Link to="/login" className="rounded-xl border border-primary px-5 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary/10">
              Connexion
            </Link>
            <Link to="/register" className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#e84232]">
              Créer un compte
            </Link>
          </>
        )}
      </nav>

      {/* --- MOBILE NAVIGATION --- */}
      <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-white hover:bg-white/5 md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isMenuOpen && (
        <div className="absolute left-0 right-0 top-[70px] border-b border-white/5 bg-[#0f1115]/95 px-4 py-6 backdrop-blur-xl md:hidden">
            <nav className="flex flex-col gap-4">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2 px-2 py-2 text-sm font-semibold text-gray-400">
                    <User className="h-4 w-4" /> Mon Compte
                  </div>
                  <Link to="/dashboard" className="flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 py-3 text-base font-bold text-white" onClick={() => setIsMenuOpen(false)}>
                    Tableau de bord
                  </Link>
                  <button onClick={handleLogout} className="flex w-full items-center justify-center rounded-xl border border-red-900/50 bg-red-900/20 py-3 text-base font-bold text-red-500">
                    Se déconnecter
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="flex w-full items-center justify-center rounded-xl border border-primary py-3 text-base font-bold text-primary hover:bg-primary/10" onClick={() => setIsMenuOpen(false)}>
                    Connexion
                  </Link>
                  <Link to="/register" className="flex w-full items-center justify-center rounded-xl bg-primary py-3 text-base font-bold text-white shadow-lg" onClick={() => setIsMenuOpen(false)}>
                    Créer un compte
                  </Link>
                </>
              )}
            </nav>
        </div>
      )}
    </header>
  );
}
