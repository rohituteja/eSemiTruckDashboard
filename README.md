# eSemiTruck Dispatch Control Dashboard

A conceptual **Electric Semi-Truck Dispatch Dashboard** designed to optimize fleet operations through real-time operational feasibility analysis. This project showcases a modern full-stack implementation using **FastAPI** and **React + TypeScript (Vite)**.

## Key Features & Showcases

- **Advanced Dispatch Engine**: A leg-by-leg physics simulation that calculates route feasibility based on dynamic payloads, terrain, and battery health.
- **Smart Charging Logic**: Intelligent charging strategies that calculate the minimum required energy to reach the next waypoint or destination with a safety buffer.
- **Journey Transparency**: Detailed journey transcripts for every truck/route combination, providing a breakdown of SOC, loads, and stop times.
- **"Best Match" Intelligence**: Instant identification of the most efficient truck available for a selected mission.
- **Real-time Fleet Monitoring**: Visual tracking of truck status (Ready, Charging, Maintenance) with animated State of Charge (SoC) telemetry.
- **Fleet Compatibility Summaries**: High-level regional feasibility previews on route cards to assist in strategic planning.

## 🏗 Architecture & Design Decisions

### Backend: The Physics-Based Dispatch Engine
- **Iterative Journey Simulation**: Moves beyond simple distance/range checks by simulating the truck throughout the specific route nodes (stops, chargers, and destination).
- **Dynamic Load Modeling**: Accounts for cargo weight reductions at mid-route stops, which directly impacts energy consumption for subsequent legs.
- **Smart Charging Strategy**: 
  - **15% Safety Buffer**: Ensures trucks never arrive at a waypoint with critically low battery.
  - **Dynamic Targets**: Calculates the exact kWh needed to safely reach the next charging point.
  - **Charging Thresholds**: "Green" status is awarded for routes completed within an efficiency-scaled time window (e.g., `60m + 0.2m/mile`).
- **Data Integrity**: Uses Pydantic for rigid schema enforcement and FastAPI for high-performance async processing.

### Frontend: Professional Dispatcher Interface
- **React + TypeScript**: Built with strict typing for reliable state management across complex feasibility datasets.
- **Glassmorphism & High-Density UI**: A premium, "mission-control" aesthetic using Tailwind CSS and custom micro-animations.
- **Interactive Transcripts**: Collapsable tables within Truck Cards provide "Leg-by-Leg" details (Miles, Start/End SOC, Load, Charge Added, and Stop Time).
- **High Performance**: Parallel fetching patterns ensure that feasibility analysis for an entire fleet remains responsive even for complex routes.

## 📁 Project Structure

```text
.
├── /backend          # Python FastAPI services & Physics Engine
│   ├── main.py       # API Endpoints & Simulation Logic
│   ├── models.py     # Data schemas (Trucks, Routes, Feasibility, Legs)
│   └── requirements.txt
├── /frontend         # Vite React + TypeScript UI
│   ├── src/components # Modular UI components (TruckCard, RouteCard)
│   ├── src/api       # API client layer (Fetch-based)
│   ├── src/types     # Shared TypeScript interfaces
│   └── src/styles     # Tailwind & Custom CSS
└── README.md
```

## 🛠 Setup & Installation

### Prerequisites
- Python 3.8+
- Node.js 18+

### 1. Backend Setup
```bash
cd backend
python3 -m venv .venv
# Activate:
#  macOS/Linux: source .venv/bin/activate
#  Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
*API: `http://localhost:8000`*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend: `http://localhost:5173`*
