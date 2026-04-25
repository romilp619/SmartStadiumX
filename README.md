# SmartStadiumX 🏟️

SmartStadiumX is a full-stack MERN web application designed to improve the physical event experience for attendees at large sporting venues by solving crowd congestion, long waiting times, and poor navigation.

## Features

- **Fan Portal**: Real-time stadium navigation, food ordering from seat, live queue monitor, QR ticket display, and rewards points.
- **Admin Command Centre**: Live heat map of crowd congestion, overall revenue/orders stats, and emergency incident broadcast system.
- **Staff Portal**: Monitor specific assigned zones, respond to alerts, and assist with rerouting fans from congested areas.
- **Vendor Portal**: Manage stall menu items, toggle availability, and track incoming orders with real-time status updates.

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, React Router, Socket.IO Client, Recharts
- **Backend**: Node.js, Express.js, MongoDB (Memory Server for demo), Mongoose, Socket.IO
- **Real-Time**: WebSockets for live order tracking and crowd movement updates

## Prerequisites

- Node.js (v18+)
- npm

## Getting Started

The project comes pre-configured with a script that automatically seeds the database with a live demo event, fans, stalls, orders, and zones on the first run.

### 1. Start the Backend API

```bash
cd server
npm install
npm run dev
```

The server will start on `http://localhost:5000`

### 2. Start the Frontend Client

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

The client will start on `http://localhost:3000`

## Demo Credentials

You can use the "Quick Login" buttons on the login page or use these credentials:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@stadium.com | password123 |
| **Fan** | fan@stadium.com | password123 |
| **Staff** | staff@stadium.com | password123 |
| **Vendor**| vendor@stadium.com | password123 |

## Features in Depth

### Smart Navigation (Fans)
- View a live SVG map of the stadium showing current congestion levels in different zones.
- Click on zones to see restrooms and exits.

### Crowd Management (Admin)
- Admins can manually update zone occupancy and congestion levels.
- Clicking **Simulate Movement** randomly updates zone congestion to show off real-time Socket.IO broadcasts across all connected clients.

### Food Ordering
- Fans browse menus, add items to cart, and place orders.
- Vendors receive the orders instantly on their dashboard and update the order status.
- Fans see a live progress bar updating via WebSockets.

### Rewards
- Fans earn 1 point for every ₹10 spent on food.
- Points can be redeemed for discounts and VIP access.

## License

MIT

## Demo Images

<img width="2332" height="1309" alt="image" src="https://github.com/user-attachments/assets/102388f9-8834-4d29-911c-6f70b2383564" />

<img width="2150" height="1263" alt="image" src="https://github.com/user-attachments/assets/675d9846-8c5b-42e1-a766-60e0cb2e3ad2" />

<img width="2556" height="1372" alt="image" src="https://github.com/user-attachments/assets/ff6e02a7-eab7-452c-ac9d-696737538bfd" />

<img width="2529" height="1395" alt="image" src="https://github.com/user-attachments/assets/9df53cab-02da-4094-b376-9b5074aae499" />

<img width="2496" height="1287" alt="image" src="https://github.com/user-attachments/assets/e91d24a5-dacd-4ea2-b101-ddb451335a49" />

<img width="2523" height="1358" alt="image" src="https://github.com/user-attachments/assets/78152040-a418-442e-88fa-5f2bb55fc754" />

<img width="2316" height="1378" alt="image" src="https://github.com/user-attachments/assets/475722ee-6c1c-48fb-b0c1-3cbc645494fc" />

<img width="2497" height="1148" alt="image" src="https://github.com/user-attachments/assets/e1591a52-bd94-49fa-9906-ea73b1bb98c8" />

<img width="2513" height="1241" alt="image" src="https://github.com/user-attachments/assets/f0996494-ea59-42e0-bb92-ce2815f0e3fe" />
