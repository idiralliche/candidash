import { Link, useNavigate } from '@tanstack/react-router';
import {
  Menu,
  X,
  User,
  LayoutDashboard,
  LogOut,
  Building2,
  Briefcase,
  CalendarClock,
  Contact,
  Files,
  Package,
} from 'lucide-react';
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
import { Button } from '@/components/ui/button';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { user } = useUserProfile();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  // Helper for Nav Links styles
  const navLinkClass = "flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-[70px] items-center justify-between border-b border-white-subtle bg-background/80 px-4 backdrop-blur-xl md:px-8">
      {/* Logo */}
      <div className="flex items-center gap-8">
        <Link to="/" className="text-xl font-extrabold tracking-tight text-primary hover:opacity-90 md:text-2xl">
          CandiDash
        </Link>

        {/* --- DESKTOP NAVIGATION LINKS --- */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-6">
             <Link to="/opportunities" className={navLinkClass} activeProps={{ className: "!text-white font-bold" }}>
               <Briefcase className="h-4 w-4" />
               Opportunités
             </Link>
             <Link to="/companies" className={navLinkClass} activeProps={{ className: "!text-white font-bold" }}>
               <Building2 className="h-4 w-4" />
               Entreprises
             </Link>
             <Link to="/scheduled-events" className={navLinkClass} activeProps={{ className: "!text-white font-bold" }}>
               <CalendarClock className="h-4 w-4" />
               Agenda
             </Link>
             <Link to="/contacts" className={navLinkClass} activeProps={{ className: "!text-white font-bold" }}>
               <Contact className="h-4 w-4" />
               Contacts
             </Link>
             <Link to="/documents" className={navLinkClass} activeProps={{ className: "!text-white font-bold" }}>
               <Files className="h-4 w-4" />
               Documents
             </Link>
             <Link to="/products" className={navLinkClass} activeProps={{ className: "!text-white font-bold" }}>
               <Package className="h-4 w-4" />
               Produits
             </Link>
          </nav>
        )}
      </div>

      {/* --- DESKTOP USER MENU --- */}
      <nav className="hidden items-center gap-3 md:flex">
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-white-light bg-white-subtle  hover:bg-white-light ">
                <User className="h-5 w-5 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-surface-modal text-white border-white-light" align="end">

              <DropdownMenuLabel className="truncate max-w-[200px]" title={`${user?.first_name} ${user?.last_name}`}>
                {user?.first_name} {user?.last_name}
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="bg-white-light " />

              <DropdownMenuItem className="cursor-pointer focus:bg-white-light  focus:text-white" onClick={() => navigate({ to: '/dashboard' })}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Tableau de bord</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="cursor-pointer focus:bg-white-light  focus:text-white" onClick={() => navigate({ to: '/account' })}>
                <User className="mr-2 h-4 w-4" />
                <span>Mon compte</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-white-light " />

              <DropdownMenuItem className="cursor-pointer text-red-500 focus:bg-red-500/10 focus:text-red-500" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Se déconnecter</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Link to="/login" className="rounded-xl border border-primary px-5 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary/10">
              Connexion
            </Link>
            <Link to="/register" className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white shadow-lg transition-all hover:bg-primary-hover">
              Créer un compte
            </Link>
          </>
        )}
      </nav>

      {/* --- MOBILE MENU BUTTON --- */}
      <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-white-light text-white hover:bg-white-subtle  md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* --- MOBILE MENU CONTENT --- */}
      {isMenuOpen && (
        <div className="absolute left-0 right-0 top-[70px] border-b border-white-subtle bg-surface-deeper/95 px-4 py-6 backdrop-blur-xl md:hidden">
            <nav className="flex flex-col gap-4">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 px-2 py-2 mb-2 border-b border-white-subtle">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                       <User size={16} />
                    </div>
                    <span className="text-white font-medium">{user?.first_name} {user?.last_name}</span>
                  </div>

                  {/* Added Mobile Links */}
                  <Link
                    to="/opportunities"
                    className="flex items-center gap-2 rounded-lg p-2 text-gray-300 hover:bg-white-subtle  hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Briefcase size={18} />
                    Opportunités
                  </Link>

                  <Link
                    to="/companies"
                    className="flex items-center gap-2 rounded-lg p-2 text-gray-300 hover:bg-white-subtle  hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Building2 size={18} />
                    Entreprises
                  </Link>

                  <Link
                    to="/scheduled-events"
                    className="flex items-center gap-2 rounded-lg p-2 text-gray-300 hover:bg-white-subtle  hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <CalendarClock size={18} />
                    Agenda
                  </Link>

                  <Link
                    to="/contacts"
                    className="flex items-center gap-2 rounded-lg p-2 text-gray-300 hover:bg-white-subtle  hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Contact size={18} />
                    Contacts
                  </Link>

                  <Link
                    to="/documents"
                    className="flex items-center gap-2 rounded-lg p-2 text-gray-300 hover:bg-white-subtle  hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Files size={18} />
                    Documents
                  </Link>

                  <Link
                    to="/products"
                    className="flex items-center gap-2 rounded-lg p-2 text-gray-300 hover:bg-white-subtle  hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Package size={18} />
                    Produits
                  </Link>

                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 rounded-lg p-2 text-gray-300 hover:bg-white-subtle  hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LayoutDashboard size={18} />
                    Tableau de bord
                  </Link>

                  <Link
                    to="/account"
                    className="flex items-center gap-2 rounded-lg p-2 text-gray-300 hover:bg-white-subtle  hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User size={18} />
                    Mon compte
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-lg p-2 text-red-400 hover:bg-red-500/10 w-full text-left"
                  >
                    <LogOut size={18} />
                    Se déconnecter
                  </button>
                </>
              ) : (
                <>
                   <Link
                    to="/login"
                    className="flex w-full items-center justify-center rounded-xl border border-primary p-3 font-bold text-primary hover:bg-primary/10"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="flex w-full items-center justify-center rounded-xl bg-primary p-3 font-bold text-white hover:bg-primary-hover"
                    onClick={() => setIsMenuOpen(false)}
                  >
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
