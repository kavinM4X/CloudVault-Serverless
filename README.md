☁️ CloudVault-Serverless

""Documentation" (https://img.shields.io/badge/Documentation-Notion-black?logo=notion)" (https://app.notion.com/p/CloudVault-349702dd26a180e39b37dc680ec5bd50?source=copy_link)

A cloud-native Serverless File Upload & Management System built on AWS. CloudVault enables users to securely upload, store, retrieve, and manage files without provisioning or maintaining traditional servers. The application leverages AWS serverless services to provide scalability, reliability, and cost efficiency.

---

📘 Project Documentation

Complete project documentation, including architecture diagrams, AWS service configuration, API flow, implementation details, screenshots, and setup instructions, is available in Notion.

🔗 Notion Documentation:
https://app.notion.com/p/CloudVault-349702dd26a180e39b37dc680ec5bd50?source=copy_link

---

🚀 Features

- Secure file upload
- File management dashboard
- Serverless backend architecture
- Automatic scaling
- Low operational cost
- Metadata management
- REST API integration
- Responsive user interface
- Secure AWS IAM permissions
- Amazon S3 storage
- DynamoDB metadata storage

---

🎯 Problem Statement

Traditional file storage applications require dedicated servers, manual scaling, infrastructure maintenance, and higher operational costs.

These limitations include:

- Infrastructure management
- High maintenance cost
- Limited scalability
- Complex deployment
- Reduced availability during traffic spikes

---

💡 Solution

CloudVault-Serverless solves these problems using AWS Serverless Architecture.

The application:

- Eliminates server management
- Automatically scales with user demand
- Reduces infrastructure costs
- Provides secure cloud storage
- Stores file metadata efficiently
- Improves reliability and availability

---

🏗️ Architecture

                User
                  │
                  ▼
        React Frontend (Vite)
                  │
                  ▼
            API Gateway
                  │
                  ▼
           AWS Lambda Functions
          ┌─────────┴─────────┐
          ▼                   ▼
     Amazon S3          DynamoDB
   File Storage      File Metadata

---

🔄 Application Flow

File Upload

1. User selects a file.
2. Frontend validates file size and type.
3. Upload request is sent to API Gateway.
4. API Gateway invokes AWS Lambda.
5. Lambda uploads the file to Amazon S3.
6. File metadata is stored in DynamoDB.
7. Success response is returned.
8. Dashboard updates automatically.

---

File Retrieval

1. User opens My Files.
2. Frontend sends GET request.
3. API Gateway invokes Lambda.
4. Lambda fetches metadata from DynamoDB.
5. File information is returned.
6. User views uploaded files.

---

File Deletion

1. User selects a file.
2. DELETE request is sent.
3. Lambda removes the file from Amazon S3.
4. Metadata is deleted from DynamoDB.
5. Updated file list is returned.

---

🛠️ Tech Stack

Frontend

- React
- Vite
- Tailwind CSS
- JavaScript

Backend

- AWS Lambda
- Node.js

Cloud Services

- Amazon API Gateway
- Amazon S3
- Amazon DynamoDB
- AWS IAM

---

📂 Project Structure

CloudVault-Serverless/
│
├── lambda/
├── src/
├── dist/
├── node_modules/
├── .env
├── index.html
├── package.json
├── package-lock.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── favicon.svg
├── README.md
└── generate_project_document.py

---

📡 API Endpoints

Method| Endpoint| Description
GET| /dashboard| Dashboard statistics
GET| /files| Get all files
POST| /files| Upload file metadata
GET| /files/{id}| Get file details
DELETE| /files/{id}| Delete a file

---

🔐 Security

- IAM Least Privilege Access
- Secure API Gateway
- Amazon S3 Public Access Blocked
- Role-Based Access Control
- Secure HTTP Communication
- Environment Variable Configuration

---

⚙️ Installation

Clone Repository

git clone https://github.com/kavinM4X/CloudVault-Serverless.git

Install Dependencies

npm install

Start Development Server

npm run dev

---

☁️ AWS Configuration

Configure the following AWS services:

- AWS Lambda
- Amazon API Gateway
- Amazon S3 Bucket
- Amazon DynamoDB Table
- IAM Roles & Policies

Update the required environment variables before deployment.

---

📈 Future Enhancements

- User Authentication
- File Sharing
- Search & Filtering
- Folder Management
- File Preview
- Version History
- CloudFront Integration
- Presigned URL Uploads
- Multi-user Support
- File Analytics

---

👨‍💻 Author

Kavin S

GitHub: https://github.com/kavinM4X

---

⭐ Support

If you found this project helpful:

- ⭐ Star this repository
- 🍴 Fork the project
- 🛠️ Contribute improvements
- 📢 Share your feedback

---

📄 License

This project is developed for educational and learning purposes.

---

Built with ❤️ using AWS Serverless Technologies
