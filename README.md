# Redis (Remote Dictionery Server)

## Use Cases

### Caching for High-Speed Performance
   - Redis is widely used as a cache to store frequently accessed data, reducing database load.
   - API response caching, session storage, and product catalog caching in e-commerce

### Rate Limiting & API Throttling
   - Redis is used to implement rate limiting, ensuring users don't exceed their allowed number of requests in particular timeframe.
   - Limiting login attempts, controlling API request frequency.
   - In case of multiple servers we need centralize storage to store user request info as per their IP address that's why we store info in Redis server because Node servers don't store or maintain each other server info or user information as server is stateless. Don't maintain user state in server.

### Real-Time Analytics & Leaderboards
   - Redis supports real-time metrics tracking, like page views, engagement tracking, and game leaderboards.
   - For example - Stock market real time data, Food delivery app tracking poilot real time location data, Cricket match real time streaming data, Social media trending topics.
   - Redis not going to persist the data because it's in memory server once consumer consumes the data then data not able to retrive back.

### Pub/Sub for Messaging & Notification
   - Pub/Sub (Publish-Subscribe) is used for event-driven architectures.
   - Sending real-time notification, chat applications, and microservices communication.

### Session Management
   - Redis stores user sessions efficiently and scales across multiple servers.
   - Handling user authentication in large-scale applications.

### Distributed Locks & Queue
   - Redis provides locking mechanisms to handle concurrent requests.
   - Preventing duplicate transactions in e-commerce (e.g. when a user places an order).
