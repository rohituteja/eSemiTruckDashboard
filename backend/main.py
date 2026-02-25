from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import math
from models import Truck, Route, FeasibilityResult

app = FastAPI()

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Mock Data
MOCK_TRUCKS = [
    Truck(id="T-01", name="Tesla Semi", soc=92.0, soh=98.0, capacity_kwh=500.0, load_lbs=42000.0, status="ready"),
    Truck(id="T-02", name="Freightliner eCascadia", soc=61.0, soh=91.0, capacity_kwh=550.0, load_lbs=68000.0, status="ready"),
    Truck(id="T-03", name="Volvo FH Electric", soc=34.0, soh=85.0, capacity_kwh=480.0, load_lbs=0.0, status="charging", charge_eta_mins=47),
    Truck(id="T-04", name="Kenworth T680E", soc=78.0, soh=94.0, capacity_kwh=520.0, load_lbs=55000.0, status="ready"),
    Truck(id="T-05", name="Peterbilt 579EV", soc=15.0, soh=76.0, capacity_kwh=460.0, load_lbs=0.0, status="maintenance"),
]

MOCK_ROUTES = [
    Route(
        id="R-01", 
        name="Local Delivery", 
        distance_miles=48.0, 
        elevation_gain_ft=120.0, 
        load_lbs=35000.0, 
        priority="standard", 
        terrain_multiplier=1.05, 
        base_consumption=1.8
    ),
    Route(
        id="R-02", 
        name="Cross-State Express", 
        distance_miles=382.0, 
        elevation_gain_ft=800.0, 
        load_lbs=22000.0, 
        priority="urgent", 
        terrain_multiplier=1.12, 
        base_consumption=1.8
    ),
    Route(
        id="R-03", 
        name="Mountain Pass", 
        distance_miles=218.0, 
        elevation_gain_ft=4200.0, 
        load_lbs=58000.0, 
        priority="standard", 
        terrain_multiplier=1.45, 
        base_consumption=1.8
    ),
]

@app.get("/")
async def root():
    return {"message": "eSemiTruckDashboard API handles are up and running!"}

@app.get("/trucks", response_model=List[Truck])
async def get_trucks():
    return MOCK_TRUCKS

@app.get("/routes", response_model=List[Route])
async def get_routes():
    return MOCK_ROUTES

@app.get("/routes/{route_id}/feasibility", response_model=List[FeasibilityResult])
async def get_route_feasibility(route_id: str):
    # Find the route
    route = next((r for r in MOCK_ROUTES if r.id == route_id), None)
    if not route:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Route not found")
    
    results = []
    weight_factor = 0.00004  # kWh per mile per lb
    
    for truck in MOCK_TRUCKS:
        # 1. Use effective battery capacity instead of raw capacity
        effective_capacity = truck.capacity_kwh * (truck.soh / 100)
        
        # 2. Use combined load (truck + route) in the weight factor
        total_load = truck.load_lbs + route.load_lbs
        
        # 3. Use effective_capacity and total_load in formulas
        energy_required = (route.base_consumption + weight_factor * total_load) * route.distance_miles * route.terrain_multiplier
        energy_available = (truck.soc / 100) * effective_capacity
        
        arrival_soc = ((energy_available - energy_required) / effective_capacity) * 100
        
        # Status rules
        charge_time_mins = None
        if arrival_soc >= 15:
            status = "green"
        elif arrival_soc >= 0:
            status = "yellow"
            # Calculate the energy deficit needed to reach 15% SoC
            deficit_kwh = (0.15 - (arrival_soc / 100)) * effective_capacity
            # Calculate charge_time_mins: 1% charge = 4 mins (or 5% = 20 mins)
            charge_time_mins = math.ceil(deficit_kwh / effective_capacity * 100 / 5) * 20
        else:
            status = "red"
            
        results.append(FeasibilityResult(
            truck_id=truck.id,
            status=status,
            arrival_soc=round(arrival_soc, 2),
            energy_required_kwh=round(energy_required, 2),
            charge_time_mins=charge_time_mins
        ))
    
    # Sort by arrival_soc descending
    results.sort(key=lambda x: x.arrival_soc, reverse=True)
    
    return results
