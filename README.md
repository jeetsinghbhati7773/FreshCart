# Hitman Grocery - Full Stack Grocery Delivery App

**Project Duration:** June 2025 – July 2025  
**Tech Stack:** Docker, React.js, Tailwind CSS, Node.js, Express.js, MongoDB, Razorpay, Cloudinary, Socket.io

---

## Project Overview

Hitman Grocery is a full-stack grocery delivery application designed to provide a seamless and secure shopping experience for users while enabling sellers to manage orders efficiently. The app includes user authentication, real-time updates, payment integration, and an in-app chat feature for direct communication between users and sellers.

---

## Features

### User Features
- **Secure Authentication:** User registration and login with JWT authentication and OTP verification.  
- **Shop & Order:** Browse products by categories, view real-time bestseller rankings, and place orders with Razorpay or Cash on Delivery options.  
- **Order Tracking:** Track order status in real-time from placement to delivery.  
- **Chat Support:** Real-time chat with sellers for queries or support.

### Seller Features
- **Order Management:** Receive and update orders in real-time, manage inventory and product listings.  
- **Chat Support:** Communicate with users via an in-app chat system to provide better service.  

### Admin & Technical Features
- **Real-Time Updates:** Socket.io-powered real-time updates for bestseller lists, orders, and chat messages.  
- **Media Management:** Cloudinary integration for storing and serving product images.  
- **Containerization:** Dockerized application for consistent deployments across environments.  

---

## Tech Stack & Tools

- **Frontend:** React.js, Tailwind CSS  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **Payments:** Razorpay integration with secure transaction handling  
- **Real-Time Communication:** Socket.io for live updates and chat  
- **Media Storage:** Cloudinary for product images  
- **Deployment:** Docker for containerized development and deployment  

---

## Installation & Setup

1. **Clone the repository**
```bash
git clone <(https://github.com/meetmodi45/hitman.grocery)>
cd hitman-grocery
```

---

2. Backend Setup
 ```bash
cd server
npm install
cp .env.example .env
npm start
```
---

3. Frontend Setup
```bash
cd client
npm install
npm start
```
