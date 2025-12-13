import { Link, useNavigate } from '@tanstack/react-router';
import { Menu, X, User, LayoutDashboard, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useUserProfile } from '@/hooks/use-user-profile';

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
  const { user } = useUserProfile();

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-white/10 bg-white/5 hover:bg-white/10">
                <User className="h-5 w-5 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-[#13151a] text-white border-white/10" align="end">

              <DropdownMenuLabel className="truncate max-w-[200px]" title={`${user?.first_name} ${user?.last_name}`}>
                {user?.first_name} {user?.last_name}
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="bg-white/10" />

              <DropdownMenuItem className="cursor-pointer focus:bg-white/10 focus:text-white" onClick={() => navigate({ to: '/dashboard' })}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Tableau de bord</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="cursor-pointer focus:bg-white/10 focus:text-white" onClick={() => navigate({ to: '/account' })}>
                <User className="mr-2 h-4 w-4" />
                <span>Mon compte</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-white/10" />

              <DropdownMenuItem className="cursor-pointer text-red-500 focus:bg-red-500/10 focus:text-red-500" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Se déconnecter</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          // ... (Le bloc 'else' reste identique) ...
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

      {/* ... (Le menu Mobile doit aussi être mis à jour si tu le souhaites, dis-le moi) ... */}
      <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-white hover:bg-white/5 md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isMenuOpen && (
        // ... Code du menu mobile ...
        <div className="absolute left-0 right-0 top-[70px] border-b border-white/5 bg-[#0f1115]/95 px-4 py-6 backdrop-blur-xl md:hidden">
            {/* Je te laisse la main pour modifier le menu mobile ou je peux te fournir le code si tu veux */}
             <nav className="flex flex-col gap-4">
              {/* ... */}
            </nav>
        </div>
      )}
    </header>
  );
}
