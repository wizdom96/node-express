# Tutorial API

Simple REST API for managing tutorials and categories built with Express.js and TypeScript.

## Setup

Clone the repo and install dependencies:

```bash
npm install
```

## Running Locally

For development:

```bash
npm run dev
```

For deleting unpublished tutorials:

```bash
npm run delete-unpublished
```

The server starts on port 8081.

## Docker

Build and run with Docker Compose:

```bash
docker-compose up --build
```

This spins up the API server and MongoDB instance.

## Database

Uses SQLite for tutorials/categories data. The database file gets created automatically at `/app/tutorials.db`.

## API Endpoints

### Tutorials

| Method   | Endpoint         | Description          |
| -------- | ---------------- | -------------------- |
| `GET`    | `/tutorials`     | Get all tutorials    |
| `POST`   | `/tutorials`     | Create new tutorial  |
| `GET`    | `/tutorials/:id` | Get tutorial by ID   |
| `PUT`    | `/tutorials/:id` | Update tutorial      |
| `DELETE` | `/tutorials/:id` | Delete tutorial      |
| `DELETE` | `/tutorials`     | Delete all tutorials |

### Categories

| Method   | Endpoint          | Description           |
| -------- | ----------------- | --------------------- |
| `GET`    | `/categories`     | Get all categories    |
| `POST`   | `/categories`     | Create new category   |
| `GET`    | `/categories/:id` | Get category by ID    |
| `PUT`    | `/categories/:id` | Update category       |
| `DELETE` | `/categories/:id` | Delete category       |
| `DELETE` | `/categories`     | Delete all categories |

## Request Format

**For tutorials:**

```json
{
  "title": "Tutorial Title",
  "description": "Optional description",
  "published": true,
  "category_id": 1
}
```

**For categories:**

```json
{
  "name": "Category Name",
  "description": "Optional description"
}
```
