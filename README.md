# @protorians/vauban

A powerful, flexible backend server framework built on top of Fastify.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Core Concepts](#core-concepts)
  - [Backend Server](#backend-server)
  - [Routes](#routes)
  - [Middleware](#middleware)
  - [Plugins](#plugins)
- [Basic Usage](#basic-usage)
- [Advanced Features](#advanced-features)
  - [Configuration Management](#configuration-management)
  - [Module System](#module-system)
  - [Hot Module Replacement](#hot-module-replacement)
- [API Reference](#api-reference)
  - [Backend](#backend)
    - [Properties](#properties)
    - [Methods](#methods)
  - [Routes](#routes-1)
  - [Middleware](#middleware-1)
  - [Plugins](#plugins-1)
- [Types Reference](#types-reference)
- [License](#license)

## Overview

@protorians/vauban is a comprehensive backend server framework built on top of Fastify. It provides a flexible API for building server-side applications with support for routing, middleware, plugins, and configuration management. Vauban simplifies the process of creating robust backend services with features like hot module replacement and a modular architecture.

## Installation

```bash
# Using npm
npm install @protorians/vauban

# Using yarn
yarn add @protorians/vauban

# Using pnpm
pnpm add @protorians/vauban
```

## Core Concepts

### Backend Server

The `Backend` is the core building block of the Vauban framework. It represents a server instance with properties and methods for configuring and managing the server, handling requests, and serving responses.

```typescript
import { Backend } from '@protorians/vauban';

// Create a new backend server
const server = new Backend({
  logger: true,
  port: 3000,
  host: 'localhost'
});

// Start the server
server.start().then(() => {
  console.log('Server started successfully!');
});
```

### Routes

Routes define the endpoints of your application and the handlers that process requests to those endpoints. Vauban provides a simple API for defining routes with support for different HTTP methods.

```typescript
import { Backend, Route } from '@protorians/vauban';

// Create a new backend server
const server = new Backend();

// Define a route
const homeRoute = new Route({
  path: '/',
  method: ['GET'],
  callable: ({ request, response }) => {
    response.send({ message: 'Welcome to Vauban!' });
  }
});

// Add the route to the server
server.addRoute(homeRoute);
```

### Middleware

Middleware functions process requests before they reach the route handlers. They can modify the request or response objects, end the request-response cycle, or call the next middleware function in the stack.

```typescript
import { Backend, Middleware } from '@protorians/vauban';
import { TreatmentQueueStatus } from '@protorians/core';

// Create a new backend server
const server = new Backend();

// Define a middleware
const authMiddleware = new Middleware({
  name: 'auth',
  callable: async ({ request, response }) => {
    const token = request.headers.authorization;

    if (!token) {
      response.status(401).send({ error: 'Unauthorized' });
      return TreatmentQueueStatus.Exit;
    }

    // Token is valid, continue to the next middleware or route handler
    return TreatmentQueueStatus.Continue;
  }
});

// Add the middleware to the server
server.addMiddleware(authMiddleware);
```

### Plugins

Plugins extend the functionality of the backend server. They can add routes, middleware, or event handlers to the server.

```typescript
import { Backend, Plugin } from '@protorians/vauban';

// Create a new backend server
const server = new Backend();

// Define a plugin
const loggingPlugin = new Plugin({
  name: 'logging',
  event: (signal) => {
    signal.listen('request', ({ request }) => {
      console.log(`Received ${request.method} request to ${request.url}`);
    });
  }
});

// Add the plugin to the server
server.addPlugin(loggingPlugin);
```

## Basic Usage

```typescript
import { Backend, Route, Middleware } from '@protorians/vauban';
import { TreatmentQueueStatus } from '@protorians/core';

// Create a new backend server
const server = new Backend({
  logger: true,
  port: 3000
});

// Define a middleware
const loggerMiddleware = new Middleware({
  name: 'logger',
  callable: async ({ request }) => {
    console.log(`${request.method} ${request.url}`);
    return TreatmentQueueStatus.Continue;
  }
});

// Define routes
const homeRoute = new Route({
  path: '/',
  method: ['GET'],
  callable: ({ response }) => {
    response.send({ message: 'Welcome to Vauban!' });
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

// Add middleware and routes to the server
server.addMiddleware(loggerMiddleware);
server.addRoute(homeRoute);
server.addRoute(userRoute);

// Start the server
server.start().then(() => {
  console.log(`Server started on http://localhost:${server.options.port}`);
});
```

## Advanced Features

### Configuration Management

Vauban provides a configuration system for managing server settings. Configurations can be loaded from different sources and synchronized with the server.

```typescript
import { Configuration } from '@protorians/vauban';
import { ConfigurationLoader } from '@protorians/vauban/enums/configuration';

// Define a configuration schema
interface ServerConfig {
  name: string;
  port: number;
  host: string;
  debug: boolean;
}

// Create a configuration instance
const config = new Configuration<ServerConfig>({
  loader: ConfigurationLoader.JSON
});

// Synchronize with default values
await config.sync({
  name: 'my-server',
  port: 3000,
  host: 'localhost',
  debug: false
});

// Access configuration values
console.log(config.$.name); // 'my-server'
console.log(config.$.port); // 3000

// Update configuration values
config.set('port', 4000);
config.set('debug', true);

// Save configuration
config.save();
```

### Module System

Vauban provides a module system for organizing code and supporting dynamic imports.

```typescript
import { ModuleLoader } from '@protorians/vauban';

// Load a module
const userModule = await ModuleLoader.load('./modules/user.js');

// Access the default export
const UserController = userModule.default;

// Create an instance
const userController = new UserController();
```

### Hot Module Replacement

Vauban supports hot module replacement (HMR) for development, allowing you to update modules without restarting the server.

```typescript
import { HMR } from '@protorians/vauban';

// Create an HMR instance
const hmr = new HMR({
  directory: './src',
  extensions: ['.ts', '.js']
});

// Start watching for changes
hmr.watch();

// Listen for module updates
hmr.on('update', (module) => {
  console.log(`Module ${module} updated`);
});
```

## API Reference

### Backend

The main class for creating and managing backend servers.

#### Properties

- `instance`: Gets the Fastify instance
- `options`: Gets the server options
- `routes`: Gets the list of routes
- `middleware`: Gets the list of middleware

#### Methods

- **Server Management**
  - `start(bootstrapper)`: Starts the server
  - `stop()`: Stops the server

- **Route Management**
  - `addRoute(route)`: Adds a route to the server
  - `removeRoute(path)`: Removes a route from the server

- **Middleware Management**
  - `addMiddleware(middleware)`: Adds middleware to the server
  - `removeMiddleware(name)`: Removes middleware from the server

- **Plugin Management**
  - `addPlugin(plugin)`: Adds a plugin to the server
  - `removePlugin(name)`: Removes a plugin from the server

### Routes

Methods and classes for defining and managing routes.

- `Route`: Class for creating route handlers
- `RouteGroup`: Class for grouping related routes

### Middleware

Methods and classes for defining and managing middleware.

- `Middleware`: Class for creating middleware functions
- `MiddlewareStack`: Class for managing middleware execution

### Plugins

Methods and classes for defining and managing plugins.

- `Plugin`: Class for creating plugins
- `PluginManager`: Class for managing plugins

## Types Reference

| Category | Type | Description |
|----------|------|-------------|
| **Backend Types** | `IBackend` | Interface for backend servers |
| | `IBackendInstance` | Interface for Fastify instances |
| | `IBackendOptions` | Options for configuring servers |
| | `IBackendConfig` | Configuration for servers |
| **Route Types** | `IRouteCallable` | Function type for route handlers |
| | `IRoutePayload` | Configuration for routes |
| **Middleware Types** | `IMiddleware` | Interface for middleware |
| | `IMiddlewareCallable` | Function type for middleware handlers |
| | `IMiddlewareResponse` | Response from middleware |
| **Plugin Types** | `IPlugin` | Interface for plugins |
| | `IPluginOptions` | Options for configuring plugins |
| **Module Types** | `IModularDefaultSource` | Type for modules with default exports |
| | `IModularView` | Type for view modules |
| **Configuration Types** | `IConfiguration` | Interface for configuration objects |
| | `IConfigurationOptions` | Options for configuration |

## License

This project is licensed under the ISC License. See the LICENSE file for details.
