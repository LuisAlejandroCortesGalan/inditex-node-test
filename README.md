# Similar Products API

A RESTful API service to retrieve similar products based on a product ID.

## Project Overview

This service implements the following API contract:

- `GET /product/{productId}/similar`: Returns an array of similar products for a given product ID.

The API fetches similar product IDs from an external service, then retrieves the detailed information for each product, and returns a consolidated response with all the similar products' information.

## Features

- REST API built with Node.js, TypeScript, and Express
- Resilient HTTP client with retry mechanism
- In-memory caching to improve performance
- Parallel processing of product detail requests
- Comprehensive error handling
- Containerized with Docker and Docker Compose
- Fully tested with unit and integration tests

## Architecture

The project follows clean architecture principles with clear separation of concerns:

- **Models**: Data structures and interfaces
- **Services**: Business logic implementation
- **Controllers**: Request handling and response formatting
- **Routes**: API endpoint definitions
- **Clients**: External API communication
- **Utils**: Shared utilities and helpers
- **Middleware**: Request processing and error handling

## Requirements

- Node.js 18+
- npm 8+
- Docker and Docker Compose (for containerized execution)

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/similar-products-api.git
cd similar-products-api

# Install dependencies
npm install

# Build the project
npm run build
```

## Development

```bash
# Run in development mode with hot reload
npm run dev

# Lint the code
npm run lint

# Format the code
npm run format
```

## Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Running with Docker

```bash
# Create the required network
docker network create backendnet

# Build and start the service
docker-compose up -d
```

## Environment Variables

The application can be configured using the following environment variables:

| Variable | Description | Default |
| --- | --- | --- |
| PORT | Server port | 5000 |
| EXTERNAL_API_BASE_URL | Base URL for the external API | http://localhost:3001 |
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
    "id": "1",
    "name": "Product Name",
    "price": 19.99,
    "availability": true
  }
]
```

## License

MIT