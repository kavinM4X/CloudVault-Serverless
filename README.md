CloudVault-Serverless

A cloud-native serverless file upload system built using AWS services. This project enables users to upload, store, and manage files efficiently without managing servers.

Project Overview

CloudVault-Serverless is designed to provide:

Scalable file storage
Secure file handling
Zero server management
Cost-efficient cloud architecture

Users interact through a modern frontend, while AWS handles backend processing automatically.

Problem Statement

Traditional systems:

Require server setup & maintenance
Are hard to scale
Increase infrastructure cost

Solution

This project uses serverless architecture to:

Automatically scale resources
Reduce operational overhead
Improve performance and reliability
 
 
 Architecture Overview
        The system is divided into four layers:

        🔹 Frontend Layer
                React App (Login, Dashboard, Upload, My Files)
        🔹 API Layer
                API Gateway handles HTTP requests
        🔹 Compute Layer
                AWS Lambda processes backend logic
        🔹 Storage Layer
                Amazon S3 → stores files
                DynamoDB → stores metadata

End-to-End Request Flow
  File Upload
  User selects file
  Frontend validates file (type & size)
  Generate S3 key
  Send POST /files request
  API Gateway receives request
  Lambda processes request
  Metadata stored in DynamoDB
  Success response returned

File Retrieval
  User opens "My Files" page
  GET /files request sent
  Lambda fetches metadata
  DynamoDB queried
  File list returned
  Display in frontend

Tech Stack
   Frontend
     React
     Vite
     Tailwind CSS
   Backend
     AWS Lambda (Node.js)
     Cloud Services
     API Gateway
     Amazon S3
     DynamoDB

API Endpoints

| Method | Endpoint    | Description     |
| ------ | ----------- | --------------- |
| GET    | /dashboard  | Dashboard stats |
| GET    | /files      | Get all files   |
| POST   | /files      | Upload metadata |
| GET    | /files/{id} | Get single file |
| DELETE | /files/{id} | Delete file     |


Security
  IAM roles with least privilege
  MFA enabled
  S3 public access blocked
  Secure API communication

Setup Instructions
    1. Clone Repository
      git clone https://github.com/your-username/CloudVault-Serverless.git
    
    2. Backend Setup
      Create Lambda function
      Connect API Gateway
      Configure S3 & DynamoDB
      
    3. Frontend Setup
       cd frontend
       npm install
       npm run dev
