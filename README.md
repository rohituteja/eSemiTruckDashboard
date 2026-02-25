# eSemiTruck Dispatch Control Dashboard

A conceptual **Electric Semi-Truck Dispatch Dashboard** designed to optimize fleet operations through real-time operational feasibility analysis. This project showcases a modern full-stack implementation using **FastAPI** and **React + TypeScript (Vite)**.

## Key Features & Showcases

- **Real-time Fleet Monitoring**: Visual tracking of truck status (Ready, Charging, Maintenance) and State of Charge (SoC).
- **Intelligent Dispatch Selection**: A "Best Match" badge instantly identifies the most compatible available truck for a selected route.
- **Cross-fleet Route Analysis**: "Fleet Compatibility" summaries on route cards provide a high-level view of regional feasibility before selection.
- **Dynamic Operational Intelligence**: Intelligent sorting and color-coded status indicators to assist dispatchers in making rapid, data-driven decisions.
- **Physics-Based Energy Modeling**: A simplified but realistic energy consumption algorithm accounting for rolling resistance and payload factors.

## 🏗 Architecture & Design Decisions

### Backend: Performance & Reliability
- **FastAPI Core**: Leverages Python 3.8+ for high-performance asynchronous API endpoints.
- **Physics-Based Estimation Engine**: 
  - **Formula**: `Energy Required = (Base Consumption + (Weight Factor * Total Load)) * Distance * Terrain Multiplier`
  - **Total Load**: Combined weight of the truck's current load and the route's cargo.
  - **Effective Capacity**: Calculations utilize `Truck Capacity * (SOH / 100)` to account for battery degradation over time.
  - **Minimum Buffer**: Routes are marked as "Feasible" (Green) if arrival SoC >= 15%, "Charge Needed" (Yellow) if between 0-15%, and "Infeasible" (Red) if < 0%.
- **Charge Time Estimation**: For "Yellow" status trucks, the engine calculates the dynamic charging time required to reach the 15% safety buffer.
- **Validation**: Pydantic models are used for strict type checking and attribute validation across all endpoints.

### Frontend: Modern & Responsive
- **React + TypeScript**: High-performance UI framework with a strong type system for predictable state management.
- **Vite Build Tool**: Modern build system for fast HMR and optimized production bundles.
- **Reactive Dashboard**:
  - **Pre-fetching**: Feasibility for all routes is fetched in parallel on mount, enabling immediate visual feedback.
  - **Dispatcher Assistance**: Automatic "Best Match" identification for the highest-ranked available vehicle.
  - **Situational Awareness**: Professional UI with custom animations, glassmorphism, and color-coded telemetry.

## 📁 Project Structure

```text
.
├── /backend          # Python FastAPI services & Physics Engine
│   ├── main.py       # API Endpoints & Operational Logic
│   ├── models.py     # Data schemas (Trucks, Routes, Feasibility)
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
- Node.js 16+

### 1. Backend Setup
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
*API will be available at `http://localhost:8000`*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend will be available at `http://localhost:5173`*

