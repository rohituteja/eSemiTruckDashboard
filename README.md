# EV Dispatch Control

A fleet management dashboard for electric semi-trucks. The system uses a physics-based simulation engine to determine route feasibility by modeling battery consumption against dynamic variables like payload and terrain.

## Technical Architecture

### Backend: Iterative Simulation Engine (FastAPI)
The engine performs a leg-by-leg simulation rather than using static range estimates.
- **Consumption Model**: Calculates energy usage per leg based on `(base_consumption + weight_factor * current_payload) * distance * terrain_multiplier`.
- **Dynamic Payload**: Adjusts vehicle weight at each stop based on unload/pickup tasks, impacting consumption for all subsequent legs.
- **Look-Ahead Charging**: At each charger, the engine calculates the specific kWh requirement to reach the next viable charging node or destination with a safety margin.
- **Pre-Charge Logic**: If a truck's current State of Charge (SoC) is insufficient but its capacity is adequate, the engine calculates the specific time required to charge at the depot before dispatch.
- **Trip Time Estimation**: Total mission time is calculated as `(distance / 55 mph) + simulated_stop_time`. Stop time includes mandatory 30-minute unloading/loading cycles and calculated charging durations.
- **Cost Estimation**: Estimates energy expenses using a fixed rate of $0.15 per kWh applied to the total predicted energy consumption for the route.
- **Operational Sorting**: When a route is selected, the fleet is sorted by dispatch readiness: 
  1. No charge needed (Green)
  2. Least charge time required
  3. Highest predicted arrival SoC

### Frontend: Mission Control UI (React + TypeScript)
- **High-Density Data**: Displays real-time fleet telemetry and feasibility status across multiple route scenarios.
- **Stop-Level Transparency**: Explicitly indicates which waypoints on a route contain charging infrastructure, allowing for better operational planning. Leg details accurately label targets (e.g., Depot, Stop 1, Charger 1, Destination) and inline charger availability.
- **Wall Clock Dispatching**: Shows specific "Available at HH:MM" times for charging trucks and "Departure to Arrival" timelines for planned missions, anchored to the last dashboard refresh time.
- **Simulation Transparency**: Provides a "Leg Detail" audit trail for every result, showing SoC deltas, energy added, and load changes per segment.
- **Clear Infeasibility Reporting**: Explicitly explains why a route is designated as infeasible (e.g., insufficient battery capacity between available chargers), reducing ambiguity for dispatchers.
- **Performance**: Uses parallel fetching to evaluate the entire fleet's compatibility for a selected route without UI blocking.

## Engineering Decisions & Tradeoffs

- **Simulation vs. Range Estimates**: Chose iterative simulation to account for the heavy impact of payload (e.g., 80k lbs vs 20k lbs) on EV efficiency. 
  - *Tradeoff*: Higher computational overhead per request, mitigated by efficient Python math logic and Pydantic validation.
- **15% SoC Buffer**: Hard-coded safety floor maintained at all waypoints.
  - *Rationale*: Critical to account for unforeseen traffic, thermal management, and battery health (SoH).
- **Efficiency Heuristics**: Status (Green/Yellow/Red) is determined by the ratio of charging downtime to total transit distance.
  - *Tradeoff*: Simpler than ML-based ETA prediction but provides immediate, explainable results for dispatchers.
- **Input Validation**: Added robust checks for `effective_capacity <= 0` to handle edge cases like severe battery degradation (SoH) or critical maintenance states gracefully within the simulation engine.
- **Depot Integration**: The depot is modeled as a 150kW charging node to facilitate "Ready for Dispatch" calculations for trucks currently below mission-required SoC.

## Tech Stack
- **Backend**: FastAPI (Python), Pydantic (Logic/Models), Uvicorn (Server).
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS.
- **Data**: Mock telemetry representing high-fidelity truck and route datasets.

## Repository Structure
```text
├── /backend          # API & Physics Engine (main.py, models.py)
├── /frontend         # React Application (src/components, src/api, src/types)
└── README.md
```

## Setup

### Backend
1. cd backend
2. python -m venv .venv
3. source .venv/bin/activate (or .venv\Scripts\activate on Windows)
4. pip install -r requirements.txt
5. uvicorn main:app --reload

### Frontend
1. cd frontend
2. npm install
3. npm run dev
