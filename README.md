# Video Streaming
## List of Application
- YouTube
- Netflix
- Hotstar
- Jio Cinema
- FB
- Instagram
- TicTok
- Udemy
- Unacademy
- Corsera
- Live videos
- Zoom
- Google Meet
- LinkedIn
- VHX
- IBM Cloud Video
- OTT Platform
- Sony Liv
- Apple TV
- MX Player
- Amazon Prime
- ALTBalaji
- Voot
- Saina Play
- Zartek Technologies

## Building a Scalable Video Uploading Service Using Microservices, Kafka, AWS S3 & CloudFront
- This guide will help you design and build a highly scalable video uploading service, similar to YouTube, using microservices architecture, Kafka for event-driven processing, AWS S3 for storage, and CloudFront for fast content delivery.

## High-Level Architecture
- API Gateway (Express + Nginx) → Accepts upload requests.
- Upload Service (Microservice) → Handles video uploads to AWS S3.
- Kafka (Message Queue) → Triggers asynchronous processing.
- Encoding Service (Microservice) → Transcodes videos to multiple resolutions using FFmpeg.
- Metadata Service (Microservice) → Stores video metadata in PostgreSQL/DynamoDB
- Content Delivery (AWS CloudFront + S3) → Caches & delivers videos efficiently.
- Notifications Service (Microservice) → Sends emails/webhooks when processing is complete

## Tech Stack
    Component	            Technology
    Backend	                Node.js (Express/Fastify)
    Queue	                Apache Kafka
    Storage	                AWS S3
    CDN	                    AWS CloudFront
    Database	            PostgreSQL / DynamoDB
    Encoding	            FFmpeg
    Containerization	    Docker + Kubernetes
    Logging & Monitoring	Prometheus + Grafana
    Authentication	        OAuth2 / JWT

## System Flow
- User Uplaod Video
    - The frontend sends the video to the Upload Service.
    - The service temporarily stores the video in AWS S3.
    - Generates a unique videoId and sends a Kafka event for processing.
- Kafka Processes Video
    - Upload Service sends an event to Kafka (video_uploaded topic).
    - Encoding Service listens to Kafka, downloads the video from S3, and starts transcoding
- Video Transcoding & Compression
    - The Encoding Service converts the video into multiple formats (e.g., 144p, 360p, 720p, 1080p).
    - Uses FFmpeg for encoding and optimization.
    - The processed files are stored back in AWS S3 under different resolutions.
- Update Metadata
    - Once encoding is complete, the Metadata Service updates the database.
    - The video is marked as "Ready".
- Content Delivery via AWS CloudFront
    - The video is served through AWS CloudFront (CDN) for low-latency playback.
- Notification System
    - The Notification Service (Kafka consumer) sends an email/webhook notifying the user.

## Packages used
- kafkajs
- multer
- aws-sdk
- child_process
- FFmpeg
- express
- pg
- typeorm