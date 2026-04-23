# Node Features - E-commerce Product Search with Elasticsearch

This project implements an e-commerce product search backend using NestJS + Elasticsearch with two separate APIs:

- Suggestions API for autocomplete
- Search API for full product results
- Admin upsert API for adding/updating products

Both endpoints are powered by Elasticsearch and automatically fall back to in-memory search when Elasticsearch is unavailable.

## Swagger Documentation

- Swagger UI: http://localhost:3000/api/docs
- OpenAPI JSON: http://localhost:3000/api/docs-json

## What Is Implemented

### 1) Separate APIs (as required)

- Suggestions endpoint returns only suggestions
- Search endpoint returns only product results

### 2) Elasticsearch integration

- Elasticsearch client configured from environment variables
- Product index is auto-created at startup (if not present)
- Sample products are seeded only when index is empty
- Completion suggester is used for fast autocomplete
- Multi-match full text query is used for product search

### 3) Dockerized local stack

- Elasticsearch container
- Kibana container
- API container

## API Endpoints

Base URL:

```text
http://localhost:3000/api/v1/products
```

Swagger UI:

```text
http://localhost:3000/api/docs
```

OpenAPI JSON:

```text
http://localhost:3000/api/docs-json
```

### 1) Suggestions API

Endpoint:

```http
GET /suggestions
```

Query params:

- query (required)
- suggestionSize (optional, default: 5, range: 1-20)

Example:

```bash
curl -s "http://localhost:3000/api/v1/products/suggestions?query=iph&suggestionSize=5"
```

Sample response:

```json
{
  "query": "iph",
  "suggestions": ["iphone"],
  "source": "elasticsearch"
}
```

### 2) Search API

Endpoint:

```http
GET /search
```

Query params:

- query (required)
- resultSize (optional, default: 20, range: 1-100)

Example:

```bash
curl -s "http://localhost:3000/api/v1/products/search?query=iphone&resultSize=10"
```

Sample response:

```json
{
  "query": "iphone",
  "total": 2,
  "results": [
    {
      "id": "P-1001",
      "name": "Apple iPhone 15 Pro",
      "description": "6.1-inch display, A17 Pro chip, and advanced triple camera system.",
      "category": "Smartphones",
      "brand": "Apple",
      "tags": ["iphone", "ios", "5g", "premium"],
      "price": 999,
      "inStock": true,
      "suggest": {
        "input": ["Apple iPhone 15 Pro", "Apple", "Smartphones", "iphone", "ios", "5g", "premium"]
      }
    }
  ],
  "source": "elasticsearch"
}
```

### 3) Admin Upsert API (for latest catalog sync)

Endpoint:

```http
POST /
```

Request body:

```json
{
  "id": "P-1010",
  "name": "Apple Watch Ultra 2",
  "description": "Premium smartwatch with GPS, titanium case, and long battery life.",
  "category": "Wearables",
  "brand": "Apple",
  "tags": ["watch", "wearable", "fitness"],
  "price": 799,
  "inStock": true
}
```

Example:

```bash
curl -s -X POST "http://localhost:3000/api/v1/products" \
  -H "content-type: application/json" \
  -d '{
    "id": "P-1010",
    "name": "Apple Watch Ultra 2",
    "description": "Premium smartwatch with GPS, titanium case, and long battery life.",
    "category": "Wearables",
    "brand": "Apple",
    "tags": ["watch", "wearable", "fitness"],
    "price": 799,
    "inStock": true
  }'
```

Sample response when ES is healthy:

```json
{
  "product": {
    "id": "P-1010",
    "name": "Apple Watch Ultra 2",
    "description": "Premium smartwatch with GPS, titanium case, and long battery life.",
    "category": "Wearables",
    "brand": "Apple",
    "tags": ["watch", "wearable", "fitness"],
    "price": 799,
    "inStock": true
  },
  "syncStatus": "indexed",
  "message": "Product was indexed in Elasticsearch and is now searchable."
}
```

If ES is down, product write still succeeds with queueing:

```json
{
  "syncStatus": "queued",
  "message": "Product saved, but Elasticsearch indexing failed. Product has been queued for retry."
}
```

Update behavior:

- Sending the same `id` again with new fields updates the product.
- Update is synced to Elasticsearch with `refresh=wait_for` when ES is healthy.
- If ES is unavailable, update is queued and retried automatically.

### 4) Admin Delete API

Endpoint:

```http
DELETE /:id
```

Example:

```bash
curl -s -X DELETE "http://localhost:3000/api/v1/products/P-1010"
```

Sample response:

```json
{
  "id": "P-1010",
  "deleted": true,
  "syncStatus": "indexed",
  "message": "Product deletion synced to Elasticsearch."
}
```

If ES is unavailable, delete is queued and retried later with `syncStatus: queued`.

## How Suggestions Work

Suggestions are implemented using Elasticsearch completion suggester:

- Index mapping contains a completion field named suggest
- During seeding, each product adds suggestion inputs:
  - product name
  - brand
  - category
  - tags
- API uses query prefix to get fast autocomplete matches

Elasticsearch query shape used for suggestions:

```json
{
  "suggest": {
    "product_suggestions": {
      "prefix": "iph",
      "completion": {
        "field": "suggest",
        "size": 5,
        "skip_duplicates": true
      }
    }
  }
}
```

## How Search Works

Full product search uses multi_match query with field boosting:

- name^4
- brand^3
- category^2
- description
- tags

Fuzziness is set to AUTO to support minor typos.

Elasticsearch query shape used for search:

```json
{
  "query": {
    "multi_match": {
      "query": "iphone",
      "fields": ["name^4", "brand^3", "category^2", "description", "tags"],
      "fuzziness": "AUTO"
    }
  },
  "size": 20
}
```

## Startup and Indexing Flow

On application startup:

1. Service pings Elasticsearch
2. Creates products index if missing
3. Applies mapping including suggest completion field
4. Checks document count
5. Seeds sample products if index is empty

If any Elasticsearch step fails, the service switches to fallback mode:

- suggestions are generated from in-memory sample data
- search results are generated from in-memory scoring logic

For admin catalog writes:

1. Product is first saved in API memory store (always)
2. API tries to index document in Elasticsearch with refresh = wait_for
3. If indexing fails, product is placed in a retry queue
4. Queue is retried automatically on next read/write path once ES is available

For admin deletes:

1. Product is removed from API memory store immediately
2. API tries to delete the document in Elasticsearch with refresh = wait_for
3. If delete fails, operation is queued and retried later

This gives near real-time visibility when ES is healthy, with graceful degradation during outages.

## File-Level Implementation Map

- Product search module: src/modules/product-search/product-search.module.ts
- API endpoints: src/modules/product-search/product-search.controller.ts
- Elasticsearch + fallback logic: src/modules/product-search/product-search.service.ts
- Types/DTO contracts: src/modules/product-search/product-search.types.ts
- Seed data: src/modules/product-search/sample-products.ts
- App module wiring: src/app.module.ts
- Global API prefix setup: src/main.ts

## Environment Variables

Copy values from .env.example:

```env
PORT=3000
ES_NODE=http://localhost:9200
ES_PRODUCTS_INDEX=products
ADMIN_API_KEY=

# Optional when ES security is enabled
# ES_USERNAME=elastic
# ES_PASSWORD=changeme

# Optional admin protection for product upsert endpoint
# If set, send x-admin-key header with this value for POST /api/v1/products
# ADMIN_API_KEY=super-secret-key
```

## Run with Docker (Recommended)

Start API + Elasticsearch + Kibana:

```bash
docker compose up --build
```

Service URLs:

- API: http://localhost:3000
- Elasticsearch: http://localhost:9200
- Kibana: http://localhost:5601

Useful Docker commands:

```bash
# Start only ES + Kibana (if running API on host)
docker compose up -d elasticsearch kibana

# Rebuild and restart API container
docker compose up -d --build app

# Stop all containers
docker compose down

# Stop containers and remove volumes (clears ES data)
docker compose down -v
```

## Run without Docker

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run start:dev
```

## Kibana: How to View Indexed Products

If Kibana is running but products are not visible:

1. Open Kibana at http://localhost:5601
2. Go to Stack Management -> Data Views
3. Create data view
4. Set index pattern to products
5. Select no time field
6. Open Discover and select the products data view

You can also verify index from terminal:

```bash
curl -s http://localhost:9200/_cat/indices/products?v
curl -s http://localhost:9200/products/_count
```

## Validation Commands

```bash
npm run build
npm test -- --runInBand
```

## Notes

- API prefix is /api
- Product routes are under /v1/products
- Suggestions and search are intentionally split into separate APIs
