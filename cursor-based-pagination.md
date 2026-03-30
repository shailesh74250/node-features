# Cursor-Based Pagination (The "Infinite Scroll" Way)
## This is what Facebook and LinkedIn use. Instead of a page number, the client sends the ID or Timestamp of the last item they received.

- Pros: Extremely fast even with millions of rows. Prevents duplicate posts if a new post is added while the user is scrolling.
- Cons: You cannot "jump" to Page 10; you can only go "Next."


```// post.service.ts
async findWithCursor(limit: number = 10, cursor?: number) {
  const queryBuilder = this.postRepository
    .createQueryBuilder('post')
    .orderBy('post.id', 'DESC')
    .take(limit);

  if (cursor) {
    queryBuilder.where('post.id < :cursor', { cursor });
  }

  const data = await queryBuilder.getMany();
  const nextCursor = data.length > 0 ? data[data.length - 1].id : null;

  return { data, nextCursor };
}```