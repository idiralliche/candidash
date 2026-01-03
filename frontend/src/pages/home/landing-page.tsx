import { Link } from '@tanstack/react-router';
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Building2,
  Activity,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* --- HERO SECTION --- */}
      <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <section
            id="hero"
            className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 overflow-hidden rounded-xl bg-surface-modal px-6 py-16 shadow-2xl ring-1 ring-white/5 lg:grid-cols-2 lg:px-20 lg:py-28"
            aria-label="Introduction CandiDash"
        >
            {/* TEXT COLUMN */}
            <article className="z-10 flex w-full flex-col text-center lg:text-left">
                <header>
                    <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-[3.5rem]">
                    Votre assistant personnel de <span className="text-primary">candidatures</span>
                    </h1>
                </header>

                <p className="mb-10 text-lg leading-relaxed text-gray-400 sm:text-xl max-w-lg mx-auto lg:mx-0">
                    Gérez, suivez et centralisez toutes vos candidatures, opportunités,
                    relances et documents dans un espace simple, moderne et sécurisé.
                </p>

                <nav className="flex w-full flex-col sm:flex-row items-center justify-center gap-4 lg:justify-start">
                    <Link to="/register" className="w-full sm:w-auto">
                      <Button size="lg" palette="primary" className="w-full rounded-full">
                        Commencer
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <a href="#features" className="w-full sm:w-auto">
                      <Button size="lg" variant="outline" palette="white" className="w-full rounded-full">
                        En savoir plus
                      </Button>
                    </a>
                </nav>
            </article>

            {/* VISUAL COLUMN */}
            <div className="flex w-full justify-center lg:justify-end">
                <figure className="relative h-[380px] w-full max-w-[460px] shrink-0 sm:h-[400px]" aria-hidden="true">
                    {/* Background Blob */}
                    <div className="absolute inset-0 overflow-hidden rounded-xl bg-primary shadow-[0_30px_60px_rgba(255,78,59,0.3)]">
                        <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent" />
                    </div>

                    {/* Glass Card UI */}
                    <div className="absolute inset-x-6 bottom-3 top-9 flex flex-col gap-4 rounded-t-xl rounded-b-lg border border-white-medium bg-white-light p-6 backdrop-blur-md shadow-inner">
                        <div className="flex items-center justify-between opacity-80">
                            <div className="h-4 w-24 rounded-full bg-white/40" />
                            <div className="h-8 w-8 rounded-full bg-white/40" />
                        </div>
                        <div className="flex gap-4">
                            <div className="h-24 flex-1 rounded-xl bg-white/20" />
                            <div className="h-24 flex-1 rounded-xl bg-white/20" />
                        </div>
                        <div className="mt-2 flex flex-col gap-3">
                            <div className="h-10 w-full rounded-lg bg-white/15" />
                            <div className="h-10 w-full rounded-lg bg-white/15" />
                            <div className="hidden h-10 w-full rounded-lg bg-white/15 sm:block" />
                        </div>
                        {/* Notification Badge */}
                        <div className="absolute right-[-10px] top-[90px] flex items-center gap-3 rounded-lg bg-surface-accent px-4 py-3 shadow-xl border border-white-light animate-in slide-in-from-bottom-2 fade-in duration-700 delay-500">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            </div>
                            <span className="text-sm font-bold text-white">Offre Acceptée !</span>
                        </div>
                    </div>
                </figure>
            </div>
        </section>
      </div>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="w-full py-20 px-4 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-3xl font-bold text-white sm:text-4xl">
                Tout ce qu’il faut pour rester organisé
            </h2>

            <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
                {/* Feature 1 */}
                <div className="flex flex-col items-center rounded-xl bg-surface-base p-8 shadow-lg transition-transform hover:-translate-y-1 border border-white-light/10">
                    <div className="mb-4 inline-flex h-[72px] w-[72px] items-center justify-center rounded-xl bg-surface-hover text-primary ring-1 ring-white/10">
                        <FileText className="h-10 w-10" />
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-white">Documents</h3>
                    <p className="text-gray-400">Accédez instantanément à vos CV, lettres et fichiers importants.</p>
                </div>

                {/* Feature 2 */}
                <div className="flex flex-col items-center rounded-xl bg-surface-base p-8 shadow-lg transition-transform hover:-translate-y-1 border border-white-light/10">
                    <div className="mb-4 inline-flex h-[72px] w-[72px] items-center justify-center rounded-xl bg-surface-hover text-primary ring-1 ring-white/10">
                        <Building2 className="h-10 w-10" />
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-white">Entreprises</h3>
                    <p className="text-gray-400">Centralisez les profils d’entreprise, leurs opportunités et contacts associés.</p>
                </div>

                {/* Feature 3 */}
                <div className="flex flex-col items-center rounded-xl bg-surface-base p-8 shadow-lg transition-transform hover:-translate-y-1 border border-white-light/10">
                    <div className="mb-4 inline-flex h-[72px] w-[72px] items-center justify-center rounded-xl bg-surface-hover text-primary ring-1 ring-white/10">
                        <Activity className="h-10 w-10" />
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-white">Suivi</h3>
                    <p className="text-gray-400">Visualisez vos candidatures par statut, relances et entretiens planifiés.</p>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}
