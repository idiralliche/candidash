# CandiDash - Frontend

Interface utilisateur moderne pour la plateforme de suivi de candidatures CandiDash.
Développée avec React, TypeScript et Vite.

## 🛠 Stack Technique

- **Core**: [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn/UI](https://ui.shadcn.com/)
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **State & API**: [TanStack Query](https://tanstack.com/query) + [Axios](https://axios-http.com/)
- **Code Gen**: [Orval](https://orval.dev/) (Génération automatique du client API depuis OpenAPI)

## 🚀 Installation & Démarrage

### Prérequis

- Node.js v22+
- Le Backend CandiDash doit être lancé (pour la génération d'API ou les appels)

### Installation

```bash
cd frontend
npm install
```

### Développement

```bash
npm run dev
```

## 🔌 API & Génération de Code

Le frontend utilise Orval pour générer les types TypeScript et les hooks React Query directement depuis la spécification OpenAPI du backend (`../backend/openapi.yaml`).

Si le backend change (nouveaux endpoints, modèles modifiés), lancez cette commande pour mettre à jour le client frontend :

```bash
# Génère les types et hooks dans src/api/
npm run gen:api
```

## 📦 Build Production

Pour compiler l'application pour la production :

```bash
npm run build
```

## 📂 Structure du Projet

- `src/api` : Code généré automatiquement par Orval (ne pas modifier manuellement).
- `src/components` : Composants UI réutilisables (Header, Footer, Shadcn primitives).
- `src/routes` : Pages et définition du routage (TanStack Router).
- `src/lib` : Configuration des outils (Axios, QueryClient, Utils).
