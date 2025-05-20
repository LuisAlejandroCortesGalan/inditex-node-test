# Similar Products API

[![CI](https://github.com/yourusername/similar-products-api/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/similar-products-api/actions/workflows/ci.yml)

A RESTful API service to retrieve similar products based on a product ID.

## Project Overview

This service implements the following API contract:

- `GET /product/{productId}/similar`: Returns an array of similar products for a given product ID.

The API fetches similar product IDs from an external service, then retrieves the detailed information for each product, and returns a consolidated response with all the similar products' information.

## Architecture

The application follows a microservices architecture pattern where each service has a clear responsibility:

```
┌─────────────────┐                ┌────────────────────┐                ┌─────────────────┐
│                 │                │                    │                │                 │
│    Client       │────Request────▶│  Similar Products  │────Request────▶│   Mock API      │
│    Application  │                │  API Service       │                │   Service       │
│                 │◀───Response────│                    │◀───Response────│                 │
└─────────────────┘                └────────────────────┘                └─────────────────┘
                                          │
                                          │
                                          │
                                          ▼
                                   ┌─────────────────┐
                                   │                 │
                                   │   In-memory     │
                                   │   Cache         │
                                   │                 │
                                   └─────────────────┘
```

### Internal Structure

The project follows clean architecture principles with clear separation of concerns:

```
src/
├── types/            # general types
├── models/           # Data structures and interfaces
├── services/         # Business logic implementation
├── controllers/      # Request handling and response formatting
├── routes/           # API endpoint definitions
├── clients/          # External API communication
├── utils/            # Shared utilities and helpers
├── middleware/       # Request processing and error handling
├── app.ts            # Express application setup
└── index.ts          # Application entry point
```

### Request Flow

```
1. Client request → API
2. API routes → controller
3. Controller → service
4. Service → external API client
5. External API client → Mock API
6. Response flows back through the layers
7. Caching at service layer for improved performance
```

## Features

- REST API built with Node.js, TypeScript, and Express
- Resilient HTTP client with retry mechanism and circuit breaker pattern
- In-memory caching to improve performance
- Parallel processing of product detail requests
- Comprehensive error handling
- Containerized with Docker and Docker Compose
- Fully tested with unit and integration tests

## Requirements

- Node.js 20+ (for local development)
- Docker and Docker Compose (for containerized execution)
- Access to the mock API service

## Local Development

### Installation

```bash
# Clone the repository
git clone https://github.com/LuisAlejandroCortesGalan/inditex-node-test
cd similar-products-api

# Install dependencies
npm install

# Create .env file from template
cp .env.example .env

# Build the project
npm run build
```

### Running Locally

```bash
# Run in development mode with hot reload
npm run dev

# Run tests
npm test

# Lint the code
npm run lint

# Format the code
npm run format
```

## Running with Docker

This application is designed to work with the mock API service in a microservices architecture. Follow these steps to set up the entire environment:

### Step 1: Set up the Mock API

First, you need to clone and run the mock API service:

```bash
# Clone the mock API repository
git clone https://github.com/dalogax/backendDevTest
cd mock-api

# Start the mock API with Docker Compose
docker-compose up -d
```

Make sure the mock API is running and has created a Docker network named `backendnet`.

### Step 2: Run the Similar Products API

```bash
# Clone this repository (if you haven't already)
git clone https://github.com/LuisAlejandroCortesGalan/inditex-node-test
cd similar-products-api

# Build and start the service
docker-compose up -d

# Check the logs
docker-compose logs -f
```

### Step 3: Test the API

```bash
# Check health endpoint
curl http://localhost:5000/health

# Get similar products for product ID 1
curl http://localhost:5000/product/1/similar
```

## Environment Variables

The application can be configured using the following environment variables:

| Variable | Description | Default |
| --- | --- | --- |
| PORT | Server port | 5000 |
| EXTERNAL_API_BASE_URL | Base URL for the external API | http://simulado:80 |
| REQUEST_TIMEOUT | HTTP request timeout in ms | 3000 |
| MAX_RETRIES | Maximum number of retry attempts | 3 |
| RETRY_DELAY | Delay between retries in ms | 300 |
| CACHE_TTL | Cache time-to-live in ms | 60000 |

## API Documentation

### Get Similar Products

Returns an array of products that are similar to the specified product.

```
GET /product/{productId}/similar
```

#### Parameters

| Name | Type | In | Description |
| --- | --- | --- | --- |
| productId | string | path | ID of the product to find similar products for |

#### Responses

| Status | Description |
| --- | --- |
| 200 | Successful operation. Returns an array of product details. |
| 404 | Product not found |
| 500 | Internal server error |

Example response:

```json
[
  {
    "id": "2",
    "name": "Dress",
    "price": 19.99,
    "availability": true
  },
  {
    "id": "3",
    "name": "Blazer",
    "price": 29.99,
    "availability": false
  }
]
```

## 🧱 Estructura del Proyecto

inditex-node-test/
├── src/
│   ├── api/                    # Cliente HTTP para APIs externas (axios)
│   │   └── apiClient.ts
│   ├── config/                 # Configuración general y variables
│   │   └── config.ts
│   ├── controllers/           # Controladores (capa HTTP)
│   │   └── product.controller.ts
│   ├── routes/                # Definición de rutas
│   │   └── product.routes.ts
│   ├── services/              # Lógica de negocio y manejo de datos
│   │   └── product.service.ts
│   ├── types/                 # Tipado personalizado
│   │   └── product.ts
│   └── app.ts                 # Configuración y arranque de Express
├── .env.example               # Variables de entorno de ejemplo
├── Dockerfile                 # Imagen base para producción
├── docker-compose.yml         # Orquestación de contenedores para entorno local
├── jest.config.js             # Configuración de pruebas
├── tsconfig.json              # Configuración de TypeScript
├── package.json               # Dependencias y scripts
└── README.md                  # Documentación del proyecto


## Resilience Features

This API implements several resilience patterns to ensure robust operation:

1. **Retry Pattern**: Automatically retries failed requests to the external API with exponential backoff
2. **Circuit Breaker**: Prevents cascading failures by stopping requests to failing services
3. **Timeout Management**: Enforces timeouts to avoid resource exhaustion
4. **Cache Aside**: Reduces load on external services and improves response time
5. **Graceful Degradation**: Returns partial results when some product details can't be retrieved

## Performance Considerations

- **Parallel Processing**: Fetches product details concurrently for improved response time
- **Caching Strategy**: Implements in-memory caching with TTL to balance freshness and performance
- **Resource Management**: Controls memory usage through cache eviction policies
- **Connection Pooling**: Uses HTTP agent keep-alive for efficient connection management

## License

MIT