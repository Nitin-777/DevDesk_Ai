# DevDesk AI

> A full-stack helpdesk and ticket management platform with role-based access control and Google Gemini API integration for automated ticket triage.

**Live Demo:** https://dev-desk-ai.vercel.app

---

## Overview

DevDesk AI is a production-deployed MERN stack application that digitizes the full support-ticket lifecycle — from intake and categorization through assignment, conversation, resolution, and analytics reporting.

Three user roles operate the platform:

- **Customer** — Raises support tickets, tracks their status, communicates with the assigned agent through a reply thread.
- **Agent** — Receives assigned tickets, resolves them through a threaded conversation, uses AI-assisted triage to quickly understand and categorize incoming issues.
- **Admin** — Full oversight: assigns tickets to agents, monitors team workload via an analytics dashboard, manages the agent roster, and receives all-ticket visibility.

The Google Gemini API is used as an assistive layer — it auto-classifies incoming tickets and drafts suggested replies for agents. Every AI output is a suggestion a human reviews; no action is taken automatically.

---

## Features

- **Role-Based Access Control** — Customer, Agent, and Admin roles with separate dashboards and route-level guards enforced server-side via JWT + middleware.
- **Full Ticket Lifecycle** — Create → Assign → In Progress → Resolve → Close, with status auto-advancing when an agent first replies to an unworked ticket.
- **Threaded Replies with Internal Notes** — Agents and admins can leave internal notes on a ticket that customers never see (filtered server-side, not just hidden in the UI).
- **Gemini AI Triage** — One-click ticket classification across 5 categories and 4 priority levels, customer sentiment detection, and suggested agent reply drafts.
- **Real-Time Notifications** — In-app notifications alert the relevant parties on every ticket state change (created, assigned, replied to, status updated).
- **Admin Analytics Dashboard** — Live charts for ticket status, priority distribution, category breakdown, and per-agent workload, computed via MongoDB aggregation pipelines.


---

## Tech Stack

### Frontend
| | |
|---|---|
| Framework | React 18 + Vite |
| Routing | React Router |
| Styling | Tailwind CSS |
| HTTP | Axios (with JWT interceptor) |
| Server State | TanStack Query |

### Backend
| | |
|---|---|
| Runtime | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Validation | express-validator |
| Security | helmet, cors |
| AI | Google Gemini API (`@google/genai`) |

### Deployment
| | |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |

---

## Project Structure

```
DevDesk_Ai/
├── client/                     # React frontend
│   └── src/
│       ├── api/                # Axios instance + API call functions
│       ├── components/         # Reusable UI components
│       ├── context/            # AuthContext (global auth state)
│       ├── layouts/            # AppLayout with role-based sidebar
│       ├── pages/              # Dashboard, AgentDashboard, AdminDashboard,
│       │                       #   CreateTicket, TicketDetails, Login, Register
│       ├── routes/             # ProtectedRoute (role-gated wrapper)
│       └── utils/              # roleRedirect (post-login routing)
└── server/
    └── src/
        ├── config/             # MongoDB connection
        ├── controllers/        # auth, ticket, ai, analytics, user, notification
        ├── middleware/         # protect (JWT auth), authorizeRoles (RBAC)
        ├── models/             # User, Ticket (with embedded replies), Notification
        ├── routes/             # 6 route files, 23 endpoints total
        └── services/           # aiService (Gemini), notificationService
```

---

## API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/health` | Public | Health check |
| POST | `/api/auth/register` | Public | Create customer account |
| POST | `/api/auth/login` | Public | Authenticate, returns JWT |
| GET | `/api/auth/me` | Auth | Revalidate current session |
| POST | `/api/tickets` | Customer, Admin | Create ticket |
| GET | `/api/tickets/my` | Customer, Admin | My own tickets |
| GET | `/api/tickets/assigned` | Agent | Tickets assigned to me |
| GET | `/api/tickets/all` | Admin | All tickets (paginated, filterable) |
| GET | `/api/tickets/:id` | Owner / Admin | Single ticket + reply thread |
| PATCH | `/api/tickets/:id/assign` | Admin | Assign ticket to an agent |
| PATCH | `/api/tickets/:id/status` | Owner / Admin | Update ticket status |
| POST | `/api/tickets/:id/replies` | Owner / Admin | Add reply or internal note |
| POST | `/api/ai/tickets/:id/analyze` | Agent, Admin | Gemini classification |
| POST | `/api/ai/tickets/:id/suggest-reply` | Agent, Admin | Gemini reply draft |
| GET | `/api/analytics/overview` | Admin | Summary counts |
| GET | `/api/analytics/tickets-by-status` | Admin | Status aggregation |
| GET | `/api/analytics/tickets-by-priority` | Admin | Priority aggregation |
| GET | `/api/analytics/tickets-by-category` | Admin | Category aggregation |
| GET | `/api/analytics/agent-workload` | Admin | Per-agent workload stats |
| GET | `/api/users/agents` | Admin | List active agents |
| POST | `/api/users/agents` | Admin | Create agent account |
| GET | `/api/notifications` | Auth | My notifications + unread count |
| PATCH | `/api/notifications/:id/read` | Auth | Mark one notification read |
| PATCH | `/api/notifications/read-all` | Auth | Mark all notifications read |

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas cluster (or local MongoDB)
- Google Gemini API key (from [Google AI Studio](https://aistudio.google.com))

### 1. Clone the repository

```bash
git clone https://github.com/Nitin-777/DevDesk_Ai.git
cd DevDesk_Ai
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file inside `server/`:

```env
PORT=5000
NODE_ENV=development

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

CLIENT_URL=http://localhost:5173
```

Start the backend server:

```bash
npm start
```

### 3. Set up the frontend

```bash
cd ../client
npm install
```

Create a `.env` file inside `client/`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 4. Seed an admin account (optional)

```bash
cd server
npm run seed:admin
```

---

## Deployment

The application is deployed across three separate services:

| Service | Platform | Notes |
|---|---|---|
| Frontend | Vercel | Root directory: `client`, output: `dist` |
| Backend | Render | Root directory: `server`, start: `npm start` |
| Database | MongoDB Atlas | Network access: `0.0.0.0/0` for Render's dynamic IPs |

**Important:** After deploying the backend, update the `CLIENT_URL` environment variable on Render to match your exact Vercel frontend URL. This is required for CORS to allow cross-origin requests from the frontend to the API.

---

## Environment Variables Reference

### Server (`server/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (defaults to 5000; Render sets this automatically) |
| `NODE_ENV` | Yes | `development` or `production` |
| `MONGO_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Secret key for signing JWTs |
| `JWT_EXPIRES_IN` | No | Token expiry (default: `7d`) |
| `GEMINI_API_KEY` | Yes | Your Google Gemini API key |
| `GEMINI_MODEL` | No | Gemini model name (default: `gemini-2.5-flash`) |
| `CLIENT_URL` | Yes | Frontend origin URL (for CORS) |

### Client (`client/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Backend API base URL (e.g. `https://your-api.onrender.com/api`) |

---

## How the AI Integration Works

The Google Gemini API is called exclusively from the backend (`server/src/services/aiService.js`) — the API key is never exposed to the browser.

Two operations are available, both restricted to Agent and Admin roles:

**Ticket Analysis** — sends the ticket title and description to Gemini and returns:
- Category (technical, billing, account, feature-request, general)
- Priority (low, medium, high, urgent)
- Customer sentiment (positive, neutral, negative, frustrated)
- A short summary
- Relevant tags

Every AI-returned field is validated against the same enums the Mongoose schema enforces before saving — a hallucinated or malformed response cannot corrupt the database.

**Reply Suggestion** — builds the full reply thread into a plain-text transcript and asks Gemini to draft one professional agent reply. The prompt explicitly instructs Gemini not to invent resolutions or make promises on the company's behalf.

If the Gemini API call fails, the endpoints return `HTTP 502` (Bad Gateway) — semantically correct for an upstream service failure, distinct from a `500` which would imply the issue is in this server's own logic.

---

## Key Design Decisions

**Embedded replies** — Ticket replies are stored as sub-documents inside the Ticket document rather than a separate collection. Replies are always read together with their parent ticket (never independently), so embedding avoids extra joins and keeps the conversation atomic with its ticket.

**Compound MongoDB indexes** — Four compound indexes on the Ticket collection are chosen specifically to match the actual query patterns used by the controllers (`customer + createdAt`, `assignedAgent + status`, `status + priority`, `category`), avoiding full collection scans.

**Two-layer authorization** — Route-level RBAC (`authorizeRoles` middleware) controls which roles can access an endpoint at all; a second handler-level ownership check (`canAccessTicket`) verifies the specific resource belongs to the requesting user. Role alone is insufficient — a customer with the right role shouldn't see another customer's ticket.

**Notifications as side effects** — Notification creation is wrapped in `try/catch` and never throws, so a notification failure cannot cause the main ticket operation (creating a ticket, posting a reply) to fail. Notifications are best-effort.

**Analytics via aggregation pipelines** — Summary statistics are computed entirely inside MongoDB using `$group`, `$lookup`, and `$sort` stages, not by pulling documents into Node and counting in JavaScript. The `getAgentWorkload` pipeline performs a `$lookup` join to the users collection in a single round-trip.

---

## Screenshots

| Customer Dashboard | Agent Dashboard | Admin Dashboard |
|---|---|---|
| Create and track tickets | Manage assigned tickets with AI assistance | Full analytics and team management |

> *Add screenshots to a `/screenshots` folder and update the table above with actual image links.*

---

## Author

**Nitin Sharma**
- GitHub: [@Nitin-777](https://github.com/Nitin-777)
- LinkedIn: [nitinsharma007](https://linkedin.com/in/nitinsharma007)
- LeetCode: [nitin_828](https://leetcode.com/u/nitin_828/)

---

## License

This project is open source and available under the [MIT License](LICENSE).
