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
