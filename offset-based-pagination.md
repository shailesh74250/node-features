# Note
- Sending 10,000 posts in a single JSON response is a performance "red flag." It will cause a massive delay in the API response (Time to First Byte), consume significant memory on your NestJS server, and potentially freeze the user's browser as it tries to parse a multi-megabyte string.

- As a Senior Engineer, you should implement Pagination. In the world of high-performance apps like LinkedIn or Facebook, there are two main ways to do this using NestJS and TypeORM.

# Offset-Based Pagination (The Standard Way)
## This is the easiest to implement. The client sends a page and limit.

- Pros: Easy to jump to a specific page (e.g., "Page 5").
- Cons: Slows down as the "offset" gets larger (PostgreSQL has to scan all previous rows).


```// post.service.ts
async findAll(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;

  const [data, total] = await this.postRepository.findAndCount({
    take: limit,
    skip: skip,
    order: { createdAt: 'DESC' },
  });

  return {
    data,
    meta: {
      total,
      page,
      lastPage: Math.ceil(total / limit),
    },
  };
}```