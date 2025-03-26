# API pagination logic
- Express pagination
- Nestj pagination

## request formate
- http://localhost:3000/documents?page=1&limit=5
- // response formate
- {
  "page": 1,
  "limit": 5,
  "totalDocuments": 50,
  "totalPages": 10,
  "documents": []

}  

Yes! You can implement your frontend pagination logic in a NestJS API by using:

skip and limit for MongoDB (Mongoose)

skip and take for PostgreSQL/MySQL (TypeORM)
