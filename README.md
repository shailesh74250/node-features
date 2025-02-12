# Kafka 
- Apache Kafka is a distributed event steaming platofrm used for real-time data processing, event-driven architecture, and large-scale queuing. It allows applications to publish, subscribe, store, and process data streams in a fault-tolerant, scalable, and high-performance way.

## Key Use Case of Kafka
- 1️⃣ Real-Time Data Processing
- 2️⃣ Event-Driven Architectures
- 3️⃣ Log Aggregation & Monitoring
- 4️⃣ Streaming ETL & Data Pipelines
- 5️⃣ Fraud Detection & Security Analytics
- 6️⃣ IoT Data Processing
- 7️⃣ Real-Time Analytics & Metrics Processing
- 8️⃣ Message Queueing & Asynchronous Processing

## Companies uses Kafka 
- LinkedIn
    - LinkedIn, the company that originally developed Kafka, uses it for:
    - Tracking user activities (profile views, searches, likes)
    - Log aggregation across distributed services
    - Metrics collection for performance monitoring
    - Real-time recommendations (jobs, connections)
    - Example: If a user views a job posting, Kafka captures this event in real-time and updates the recommendation engine.

- Netflix - Kafka for real-time event streaming
    - Netflix processes millions of events per second using Kafka for:
    - Monitoring user behavior (video streaming, pause, rewind)
    - Content recommendation engine (personalized movie suggestions)
    - Log processing for system health monitoring
    - Live error tracking for troubleshooting
    - Example: If a user pauses a video, Kafka logs the event and updates the recommendation system.

- Uber – Kafka for Trip Tracking & Dynamic Pricing
    - Uber’s real-time infrastructure is powered by Kafka for:
    - Trip tracking & driver updates (GPS locations)
    - Dynamic pricing adjustments based on demand
    - Real-time fraud detection for ride requests
    - Event-driven messaging between microservices
    - Example: If a driver cancels a ride, Kafka notifies nearby drivers instantly.

- Airbnb – Kafka for Search Indexing & Fraud Detection
    - Airbnb uses Kafka for:
    - Real-time search indexing for listings
    - Tracking user behavior for recommendations
    - Fraud detection in bookings
    - Payments processing & validation
    - Example: If a new listing is added, Kafka updates the search index immediately.

- PayPal – Kafka for Fraud Detection & Transactions
    - PayPal processes millions of financial transactions daily using Kafka for:
    - Real-time fraud detection using AI/ML models
    - Transaction validation and security monitoring
    - Asynchronous message processing between payment services
    - Example: If an unusual login occurs, Kafka alerts the security team in real-time.

- Twitter – Kafka for Log Processing & Analytics
    - Twitter relies on Kafka for:
    - Processing real-time tweets & likes
    - Log aggregation from multiple servers
    - Real-time analytics & trending topics
    - Example: When a tweet goes viral, Kafka updates trends in real-time.

- Shopify – Kafka for Order Processing & Inventory Management
    - Shopify’s Kafka-based architecture helps with:
    - Processing customer orders asynchronously
    - Updating stock levels in real-time
    - Processing payments and refunds
    - Example: When a customer places an order, Kafka updates inventory instantly.

- Spotify – Kafka for Music Streaming Analytics
    - Spotify uses Kafka for:
    - Tracking real-time music playback data
    - Generating personalized recommendations
    - Ad targeting & real-time analytics
    - Example: If a user skips a song, Kafka logs the event for recommendation updates.

- ✅ High Throughput & Low Latency – Can handle millions of messages per second.
- ✅ Scalability – Can scale horizontally by adding more brokers.
- ✅ Durability & Fault Tolerance – Ensures data persistence even if services fail.
- ✅ Event-Driven Architecture – Enables microservices to communicate asynchronously.
- ✅ Exactly-Once Processing – Ensures messages are processed reliably without duplication.

