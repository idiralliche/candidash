import { Link } from '@tanstack/react-router';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-[#0f1115] py-12 text-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 md:flex-row md:justify-between lg:px-20">

        {/* Brand Column */}
        <div className="flex flex-col gap-4">
          <div className="text-xl font-extrabold text-primary">CandiDash</div>
          <p className="max-w-xs text-gray-500">
            Votre assistant personnel pour organiser, suivre et réussir votre recherche d'emploi.
          </p>
        </div>

        {/* links Columns */}
        <div className="flex gap-10 sm:gap-16">
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-white">Produit</h4>
            <Link to="/" className="text-gray-500 hover:text-primary">Fonctionnalités</Link>
            <Link to="/" className="text-gray-500 hover:text-primary">Tarifs</Link>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-white">Légal</h4>
            <Link to="/" className="text-gray-500 hover:text-primary">Confidentialité</Link>
            <Link to="/" className="text-gray-500 hover:text-primary">CGU</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-6xl border-t border-white/5 px-6 pt-8 text-center text-gray-600 lg:px-20">
        &copy; {currentYear} CandiDash. Tous droits réservés.
      </div>
    </footer>
  );
}
