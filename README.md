# File Sharing API Server (Node.js and MongoDB)

File Sharing API Server is a Node.js application for file upload, access and delete

## Installation

Use the package manager [npm](https://www.npmjs.com) to install application dependency.

```
1. npm install
2. create .env file with appropiate data in application root
3. create public directory in application root
4. define PORT, DB credential FOLDER in .env
```
# Integration Test
```
npm test
```
# Development stage
```
nodemon
or
npm start
```
# Production stage
```
pm2 start --name production-file-server server.js
```

## Author

```
Md. Al Amin Bhuiyan
```
