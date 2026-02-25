# eSemiTruck Dispatch Control Dashboard

A conceptual **Electric Semi-Truck Dispatch Dashboard** designed to optimize fleet operations through real-time operational feasibility analysis. This project showcases a modern full-stack implementation using **FastAPI** and **React + TypeScript (Vite)**.

## Key Features & Showcases

- **Real-time Fleet Monitoring**: Visual tracking of truck status (Ready, Charging, Maintenance) and State of Charge (SoC).
- **Dynamic Route Feasibility**: Instantaneous calculation of arrival SoC based on truck capacity, current SoC, route distance, terrain complexity, and cargo weight.
- **Operational Intelligence**: Intelligent sorting and color-coded status indicators to assist dispatchers in making rapid, data-driven decisions.
- **Physics-Based Energy Modeling**: A simplified but realistic energy consumption algorithm accounting for rolling resistance and payload factors.

## 🏗 Architecture & Design Decisions

### Backend: Performance & Reliability
- **FastAPI Core**: Leverages Python 3.8+ for high-performance asynchronous API endpoints.
- **Physics-Based Estimation Engine**: 
  - **Formula**: `Energy Required = (Base Consumption + (Weight Factor * Payload)) * Distance * Terrain Multiplier`
  - **Weight Factor**: `0.00004 kWh / mi / lb`
  - **Minimum Buffer**: Routes are marked as "Feasible" (Green) if arrival SoC >= 15%, "Charge Needed" (Yellow) if between 0-15%, and "Infeasible" (Red) if < 0%.
- **Validation**: Pydantic models are used for strict type checking and attribute validation across all endpoints.
- **In-Memory Data**: The system uses hardcoded mock data for trucks and routes to ensure high performance and zero-config demonstration.

### Frontend: Modern & Responsive
- **React + TypeScript**: High-performance UI framework with a strong type system for predictable state management.
- **Vite Build Tool**: Modern build system for fast HMR and optimized production bundles.
- **Tailwind CSS Styling**: Professional UI with custom animations, glassmorphism, and a focus on dispatcher situational awareness.
- **Dynamic Sorting**: Fleet operations view automatically sorts trucks by their predicted arrival SoC for the selected route.

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

