# @protorians/vauban

Une infrastructure de serveur backend puissante et flexible construite sur Fastify.

## Table des matières

- [Aperçu](#aperçu)
- [Installation](#installation)
- [Concepts fondamentaux](#concepts-fondamentaux)
  - [Serveur Backend](#serveur-backend)
  - [Routes](#routes)
  - [Middleware](#middleware)
  - [Plugins](#plugins)
- [Utilisation de base](#utilisation-de-base)
- [Fonctionnalités avancées](#fonctionnalités-avancées)
  - [Gestion de la configuration](#gestion-de-la-configuration)
  - [Système de modules](#système-de-modules)
  - [Remplacement de module à chaud](#remplacement-de-module-à-chaud)
- [Référence API](#référence-api)
  - [Backend](#backend)
    - [Propriétés](#propriétés)
    - [Méthodes](#méthodes)
  - [Routes](#routes-1)
  - [Middleware](#middleware-1)
  - [Plugins](#plugins-1)
- [Référence des types](#référence-des-types)
- [Licence](#licence)

## Aperçu

@protorians/vauban est une infrastructure complète de serveur backend construite sur Fastify. Elle fournit une API flexible pour construire des applications côté serveur avec prise en charge du routage, du middleware, des plugins et de la gestion de la configuration. Vauban simplifie le processus de création de services backend robustes avec des fonctionnalités comme le remplacement de module à chaud et une architecture modulaire.

## Installation

```bash
# Utilisation de npm
npm install @protorians/vauban

# Utilisation de yarn
yarn add @protorians/vauban

# Utilisation de pnpm
pnpm add @protorians/vauban
```

## Concepts fondamentaux

### Serveur Backend

Le `Backend` est l'élément de base du framework Vauban. Il représente une instance de serveur avec des propriétés et des méthodes pour configurer et gérer le serveur, traiter les requêtes et servir les réponses.

```typescript
import { Backend } from '@protorians/vauban';

// Créer un nouveau serveur backend
const server = new Backend({
  logger: true,
  port: 3000,
  host: 'localhost'
});

// Démarrer le serveur
server.run((app) => {
  console.log('Serveur démarré avec succès !', app);
});
```

### Routes

Les routes définissent les points d'accès de votre application et les gestionnaires qui traitent les requêtes vers ces points d'accès. Vauban fournit une API simple pour définir des routes avec prise en charge de différentes méthodes HTTP.

```typescript
import { Backend, Route } from '@protorians/vauban';

// Créer un nouveau serveur backend
const server = new Backend();

// Définir une route
const homeRoute = new Route({
  path: '/',
  method: ['GET'],
  callable: ({ request, response }) => {
    response.send({ message: 'Bienvenue sur Vauban !' });
  }
});

// Ajouter la route au serveur
server.addRoute(homeRoute);
```

### Middleware

Les fonctions middleware traitent les requêtes avant qu'elles n'atteignent les gestionnaires de route. Elles peuvent modifier les objets de requête ou de réponse, terminer le cycle requête-réponse ou appeler la fonction middleware suivante dans la pile.

```typescript
import { Backend, Middleware } from '@protorians/vauban';
import { TreatmentQueueStatus } from '@protorians/core';

// Créer un nouveau serveur backend
const server = new Backend();

// Définir un middleware
const authMiddleware = new Middleware({
  name: 'auth',
  callable: async ({ request, response }) => {
    const token = request.headers.authorization;
    
    if (!token) {
      response.status(401).send({ error: 'Non autorisé' });
      return TreatmentQueueStatus.Exit;
    }
    
    // Le token est valide, continuer vers le middleware suivant ou le gestionnaire de route
    return TreatmentQueueStatus.Continue;
  }
});

// Ajouter le middleware au serveur
server.addMiddleware(authMiddleware);
```

### Plugins

Les plugins étendent la fonctionnalité du serveur backend. Ils peuvent ajouter des routes, des middleware ou des gestionnaires d'événements au serveur.

```typescript
import { Backend, Plugin } from '@protorians/vauban';

// Créer un nouveau serveur backend
const server = new Backend();

// Définir un plugin
const loggingPlugin = new Plugin({
  name: 'logging',
  event: (signal) => {
    signal.listen('request', ({ request }) => {
      console.log(`Reçu une requête ${request.method} vers ${request.url}`);
    });
  }
});

// Ajouter le plugin au serveur
server.addPlugin(loggingPlugin);
```

## Utilisation de base

```typescript
import { Backend, Route, Middleware } from '@protorians/vauban';
import { TreatmentQueueStatus } from '@protorians/core';

// Créer un nouveau serveur backend
const server = new Backend({
  logger: true,
  port: 3000
});

// Définir un middleware
const loggerMiddleware = new Middleware({
  name: 'logger',
  callable: async ({ request }) => {
    console.log(`${request.method} ${request.url}`);
    return TreatmentQueueStatus.Continue;
  }
});

// Définir des routes
const homeRoute = new Route({
  path: '/',
  method: ['GET'],
  callable: ({ response }) => {
    response.send({ message: 'Bienvenue sur Vauban !' });
  }
});

const userRoute = new Route({
  path: '/users/:id',
  method: ['GET'],
  callable: ({ request, response }) => {
    const userId = request.params.id;
    response.send({ userId, name: 'John Doe' });
  }
});

// Ajouter le middleware et les routes au serveur
server.addMiddleware(loggerMiddleware);
server.addRoute(homeRoute);
server.addRoute(userRoute);

// Démarrer le serveur
server.start().then(() => {
  console.log(`Serveur démarré sur http://localhost:${server.options.port}`);
});
```

## Fonctionnalités avancées

### Gestion de la configuration

Vauban fournit un système de configuration pour gérer les paramètres du serveur. Les configurations peuvent être chargées à partir de différentes sources et synchronisées avec le serveur.

```typescript
import { Configuration } from '@protorians/vauban';
import { ConfigurationLoader } from '@protorians/vauban/enums/configuration';

// Définir un schéma de configuration
interface ServerConfig {
  name: string;
  port: number;
  host: string;
  debug: boolean;
}

// Créer une instance de configuration
const config = new Configuration<ServerConfig>({
  loader: ConfigurationLoader.JSON
});

// Synchroniser avec des valeurs par défaut
await config.sync({
  name: 'my-server',
  port: 3000,
  host: 'localhost',
  debug: false
});

// Accéder aux valeurs de configuration
console.log(config.$.name); // 'my-server'
console.log(config.$.port); // 3000

// Mettre à jour les valeurs de configuration
config.set('port', 4000);
config.set('debug', true);

// Sauvegarder la configuration
config.save();
```

### Système de modules

Vauban fournit un système de modules pour organiser le code et prendre en charge les importations dynamiques.

```typescript
import { ModuleLoader } from '@protorians/vauban';

// Charger un module
const userModule = await ModuleLoader.load('./modules/user.js');

// Accéder à l'export par défaut
const UserController = userModule.default;

// Créer une instance
const userController = new UserController();
```

### Remplacement de module à chaud

Vauban prend en charge le remplacement de module à chaud (HMR) pour le développement, vous permettant de mettre à jour les modules sans redémarrer le serveur.

```typescript
import { HMR } from '@protorians/vauban';

// Créer une instance HMR
const hmr = new HMR({
  directory: './src',
  extensions: ['.ts', '.js']
});

// Commencer à surveiller les changements
hmr.watch();

// Écouter les mises à jour de module
hmr.on('update', (module) => {
  console.log(`Module ${module} mis à jour`);
});
```

## Référence API

### Backend

La classe principale pour créer et gérer les serveurs backend.

#### Propriétés

- `instance` : Obtient l'instance Fastify
- `options` : Obtient les options du serveur
- `routes` : Obtient la liste des routes
- `middleware` : Obtient la liste des middleware

#### Méthodes

- **Gestion du serveur**
  - `start(bootstrapper)` : Démarre le serveur
  - `stop()` : Arrête le serveur

- **Gestion des routes**
  - `addRoute(route)` : Ajoute une route au serveur
  - `removeRoute(path)` : Supprime une route du serveur

- **Gestion des middleware**
  - `addMiddleware(middleware)` : Ajoute un middleware au serveur
  - `removeMiddleware(name)` : Supprime un middleware du serveur

- **Gestion des plugins**
  - `addPlugin(plugin)` : Ajoute un plugin au serveur
  - `removePlugin(name)` : Supprime un plugin du serveur

### Routes

Méthodes et classes pour définir et gérer les routes.

- `Route` : Classe pour créer des gestionnaires de route
- `RouteGroup` : Classe pour regrouper des routes connexes

### Middleware

Méthodes et classes pour définir et gérer les middleware.

- `Middleware` : Classe pour créer des fonctions middleware
- `MiddlewareStack` : Classe pour gérer l'exécution des middleware

### Plugins

Méthodes et classes pour définir et gérer les plugins.

- `Plugin` : Classe pour créer des plugins
- `PluginManager` : Classe pour gérer les plugins

## Référence des types

| Catégorie | Type | Description |
|----------|------|-------------|
| **Types de Backend** | `IBackend` | Interface pour les serveurs backend |
| | `IBackendInstance` | Interface pour les instances Fastify |
| | `IBackendOptions` | Options pour configurer les serveurs |
| | `IBackendConfig` | Configuration pour les serveurs |
| **Types de Route** | `IRouteCallable` | Type de fonction pour les gestionnaires de route |
| | `IRoutePayload` | Configuration pour les routes |
| **Types de Middleware** | `IMiddleware` | Interface pour les middleware |
| | `IMiddlewareCallable` | Type de fonction pour les gestionnaires de middleware |
| | `IMiddlewareResponse` | Réponse des middleware |
| **Types de Plugin** | `IPlugin` | Interface pour les plugins |
| | `IPluginOptions` | Options pour configurer les plugins |
| **Types de Module** | `IModularDefaultSource` | Type pour les modules avec exports par défaut |
| | `IModularView` | Type pour les modules de vue |
| **Types de Configuration** | `IConfiguration` | Interface pour les objets de configuration |
| | `IConfigurationOptions` | Options pour la configuration |

## Licence

Ce projet est sous licence ISC. Voir le fichier LICENSE pour plus de détails.