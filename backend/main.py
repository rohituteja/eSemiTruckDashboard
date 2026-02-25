from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import math
from models import Truck, Route, FeasibilityResult, ChargingStation, Stop, LegDetail

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
    Truck(id="T-01", name="Tesla Semi", soc=92.0, soh=98.0, capacity_kwh=500.0, load_lbs=0.0, status="ready"),
    Truck(id="T-02", name="Freightliner eCascadia", soc=61.0, soh=91.0, capacity_kwh=550.0, load_lbs=24000.0, status="ready"),
    Truck(id="T-03", name="Volvo FH Electric", soc=34.0, soh=85.0, capacity_kwh=480.0, load_lbs=0.0, status="charging", charge_eta_mins=47),
    Truck(id="T-04", name="Kenworth T680E", soc=78.0, soh=94.0, capacity_kwh=520.0, load_lbs=38000.0, status="ready"),
    Truck(id="T-05", name="Peterbilt 579EV", soc=15.0, soh=76.0, capacity_kwh=460.0, load_lbs=0.0, status="maintenance"),
    Truck(id="T-06", name="BYD ETM6", soc=88.0, soh=97.0, capacity_kwh=470.0, load_lbs=0.0, status="ready"),
    Truck(id="T-07", name="Nikola Tre", soc=55.0, soh=89.0, capacity_kwh=500.0, load_lbs=51000.0, status="ready"),
    Truck(id="T-08", name="Mercedes eActros 600", soc=71.0, soh=93.0, capacity_kwh=620.0, load_lbs=0.0, status="charging", charge_eta_mins=22),
    Truck(id="T-09", name="DAF XF Electric", soc=44.0, soh=82.0, capacity_kwh=490.0, load_lbs=17000.0, status="ready"),
    Truck(id="T-10", name="MAN eTruck", soc=95.0, soh=99.0, capacity_kwh=700.0, load_lbs=62000.0, status="ready"),
]

MOCK_ROUTES = [
    Route(
        id="R-01", name="Harbor District Delivery", distance_miles=95.0, elevation_gain_ft=180.0, 
        priority="standard", terrain_multiplier=1.05, base_consumption=1.8,
        stops=[Stop(mile_marker=60.0, unload_lbs=18000.0, pickup_lbs=0.0, has_charger=False)],
        charging_stations=[]
    ),
    Route(
        id="R-02", name="Airport Freight Loop", distance_miles=130.0, elevation_gain_ft=240.0, 
        priority="urgent", terrain_multiplier=1.08, base_consumption=1.8,
        stops=[
            Stop(mile_marker=45.0, unload_lbs=0.0, pickup_lbs=22000.0, has_charger=True, charge_rate_kw=150.0),
            Stop(mile_marker=110.0, unload_lbs=22000.0, pickup_lbs=0.0, has_charger=False)
        ],
        charging_stations=[]
    ),
    Route(
        id="R-03", name="Central Valley Run", distance_miles=280.0, elevation_gain_ft=520.0, 
        priority="standard", terrain_multiplier=1.1, base_consumption=1.8,
        stops=[Stop(mile_marker=140.0, unload_lbs=15000.0, pickup_lbs=8000.0, has_charger=True, charge_rate_kw=200.0)],
        charging_stations=[ChargingStation(mile_marker=220.0, charge_rate_kw=150.0)]
    ),
    Route(
        id="R-04", name="Silicon Valley Express", distance_miles=340.0, elevation_gain_ft=890.0, 
        priority="urgent", terrain_multiplier=1.18, base_consumption=1.8,
        stops=[
            Stop(mile_marker=120.0, unload_lbs=0.0, pickup_lbs=30000.0, has_charger=False),
            Stop(mile_marker=280.0, unload_lbs=30000.0, pickup_lbs=0.0, has_charger=True, charge_rate_kw=250.0)
        ],
        charging_stations=[]
    ),
    Route(
        id="R-05", name="Cascade Corridor", distance_miles=390.0, elevation_gain_ft=1200.0, 
        priority="standard", terrain_multiplier=1.25, base_consumption=1.8,
        stops=[Stop(mile_marker=180.0, unload_lbs=20000.0, pickup_lbs=0.0, has_charger=True, charge_rate_kw=175.0)],
        charging_stations=[
            ChargingStation(mile_marker=80.0, charge_rate_kw=200.0),
            ChargingStation(mile_marker=310.0, charge_rate_kw=150.0)
        ]
    ),
    Route(
        id="R-06", name="Pacific Coast Interstate", distance_miles=620.0, elevation_gain_ft=1800.0, 
        priority="standard", terrain_multiplier=1.2, base_consumption=1.8,
        stops=[
            Stop(mile_marker=200.0, unload_lbs=25000.0, pickup_lbs=0.0, has_charger=True, charge_rate_kw=300.0),
            Stop(mile_marker=450.0, unload_lbs=0.0, pickup_lbs=18000.0, has_charger=True, charge_rate_kw=250.0)
        ],
        charging_stations=[ChargingStation(mile_marker=350.0, charge_rate_kw=200.0)]
    ),
    Route(
        id="R-07", name="Desert Southwest Haul", distance_miles=780.0, elevation_gain_ft=2200.0, 
        priority="urgent", terrain_multiplier=1.3, base_consumption=1.8,
        stops=[
            Stop(mile_marker=180.0, unload_lbs=30000.0, pickup_lbs=0.0, has_charger=False),
            Stop(mile_marker=480.0, unload_lbs=0.0, pickup_lbs=20000.0, has_charger=True, charge_rate_kw=350.0),
            Stop(mile_marker=680.0, unload_lbs=20000.0, pickup_lbs=0.0, has_charger=False)
        ],
        charging_stations=[ChargingStation(mile_marker=320.0, charge_rate_kw=300.0)]
    ),
    Route(
        id="R-08", name="Rocky Mountain Freight", distance_miles=890.0, elevation_gain_ft=4800.0, 
        priority="standard", terrain_multiplier=1.45, base_consumption=1.8,
        stops=[
            Stop(mile_marker=250.0, unload_lbs=18000.0, pickup_lbs=12000.0, has_charger=True, charge_rate_kw=300.0),
            Stop(mile_marker=600.0, unload_lbs=12000.0, pickup_lbs=0.0, has_charger=True, charge_rate_kw=250.0)
        ],
        charging_stations=[
            ChargingStation(mile_marker=120.0, charge_rate_kw=200.0),
            ChargingStation(mile_marker=450.0, charge_rate_kw=350.0)
        ]
    ),
    Route(
        id="R-09", name="Southern Transcontinental", distance_miles=1450.0, elevation_gain_ft=3200.0, 
        priority="standard", terrain_multiplier=1.22, base_consumption=1.8,
        stops=[
            Stop(mile_marker=320.0, unload_lbs=22000.0, pickup_lbs=0.0, has_charger=True, charge_rate_kw=350.0),
            Stop(mile_marker=750.0, unload_lbs=0.0, pickup_lbs=28000.0, has_charger=True, charge_rate_kw=300.0),
            Stop(mile_marker=1100.0, unload_lbs=28000.0, pickup_lbs=15000.0, has_charger=True, charge_rate_kw=350.0),
            Stop(mile_marker=1350.0, unload_lbs=15000.0, pickup_lbs=0.0, has_charger=False)
        ],
        charging_stations=[
            ChargingStation(mile_marker=180.0, charge_rate_kw=200.0),
            ChargingStation(mile_marker=550.0, charge_rate_kw=300.0),
            ChargingStation(mile_marker=950.0, charge_rate_kw=350.0)
        ]
    ),
    Route(
        id="R-10", name="Northern Transcontinental", distance_miles=1820.0, elevation_gain_ft=5100.0, 
        priority="urgent", terrain_multiplier=1.35, base_consumption=1.8,
        stops=[
            Stop(mile_marker=400.0, unload_lbs=35000.0, pickup_lbs=0.0, has_charger=True, charge_rate_kw=350.0),
            Stop(mile_marker=850.0, unload_lbs=0.0, pickup_lbs=25000.0, has_charger=True, charge_rate_kw=300.0),
            Stop(mile_marker=1300.0, unload_lbs=25000.0, pickup_lbs=20000.0, has_charger=True, charge_rate_kw=350.0),
            Stop(mile_marker=1600.0, unload_lbs=20000.0, pickup_lbs=0.0, has_charger=True, charge_rate_kw=250.0)
        ],
        charging_stations=[
            ChargingStation(mile_marker=200.0, charge_rate_kw=250.0),
            ChargingStation(mile_marker=620.0, charge_rate_kw=350.0),
            ChargingStation(mile_marker=1050.0, charge_rate_kw=300.0),
            ChargingStation(mile_marker=1450.0, charge_rate_kw=350.0)
        ]
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
    weight_factor = 0.000004  # kWh per lb per mile (realistic: ~0.3 kWh/mile at 80k lbs)
    MIN_BUFFER_SOC = 0.15
    
    # Build waypoints
    waypoints = []
    for cs in route.charging_stations:
        waypoints.append({
            'mile_marker': cs.mile_marker, 
            'type': 'charger', 
            'charge_rate_kw': cs.charge_rate_kw
        })
    for s in route.stops:
        waypoints.append({
            'mile_marker': s.mile_marker, 
            'type': 'stop', 
            'unload_lbs': s.unload_lbs, 
            'pickup_lbs': s.pickup_lbs,
            'has_charger': s.has_charger, 
            'charge_rate_kw': s.charge_rate_kw
        })
    waypoints.sort(key=lambda x: x['mile_marker'])
    waypoints.append({'mile_marker': route.distance_miles, 'type': 'destination'})

    for truck in MOCK_TRUCKS:
        effective_capacity = truck.capacity_kwh * (truck.soh / 100)
        current_soc = truck.soc / 100
        current_load = truck.load_lbs
        total_charge_time_mins = 0
        total_unload_time_mins = 0
        total_stops_required = 0
        no_charge_needed = True
        leg_details = []
        feasible = True
        current_mile_marker = 0.0
        total_energy_kwh = 0
        
        # Build the full list of nodes the truck visits, starting with the depot (mile 0).
        # Each node describes what's available BEFORE the truck departs for the next leg.
        # Nodes: depot (origin), then each waypoint in order.
        # We process legs: node[i] → node[i+1], where charging happens at node[i].
        nodes = [{'mile_marker': 0.0, 'type': 'depot', 'has_charger': False, 'charge_rate_kw': None}]
        for wp in waypoints:
            has_charger = (wp['type'] == 'charger') or (wp['type'] == 'stop' and wp.get('has_charger'))
            nodes.append({
                'mile_marker': wp['mile_marker'],
                'type': wp['type'],
                'has_charger': has_charger,
                'charge_rate_kw': wp.get('charge_rate_kw'),
                'unload_lbs': wp.get('unload_lbs', 0),
                'pickup_lbs': wp.get('pickup_lbs', 0),
            })
        
        CHARGE_TARGET_SOC = 0.90  # Charge to 90% when stopping at a charger

        for i in range(len(nodes) - 1):
            from_node = nodes[i]
            to_node = nodes[i + 1]
            
            leg_distance = to_node['mile_marker'] - from_node['mile_marker']
            energy_needed_kwh = (route.base_consumption + weight_factor * current_load) * leg_distance * route.terrain_multiplier
            total_energy_kwh += energy_needed_kwh
            energy_needed_soc = energy_needed_kwh / effective_capacity

            charge_added_kwh = 0
            charge_time_mins = 0
            unload_lbs = 0
            used_charger = False

            # --- STEP 1: Charge at the DEPARTURE node (from_node), BEFORE driving the leg ---
            if from_node['has_charger']:
                # Smart target: charge just enough to reach the NEXT charger (or destination)
                # with the minimum buffer SoC. Cap at CHARGE_TARGET_SOC = 90%.
                # Forward-scan remaining legs to find energy to next charger/destination.
                forward_load = current_load
                energy_to_next_charger_soc = 0.0
                for j in range(i, len(nodes) - 1):
                    fn = nodes[j]
                    tn = nodes[j + 1]
                    leg_dist = tn['mile_marker'] - fn['mile_marker']
                    leg_kwh = (route.base_consumption + weight_factor * forward_load) * leg_dist * route.terrain_multiplier
                    energy_to_next_charger_soc += leg_kwh / effective_capacity
                    # Adjust forward load for unloads
                    if tn['type'] == 'stop':
                        forward_load = max(0, forward_load - tn.get('unload_lbs', 0) + tn.get('pickup_lbs', 0))
                    # Stop scanning when we hit the next charger (after the current leg)
                    if j > i and tn.get('has_charger'):
                        break

                # Charge to just enough SoC to reach the next charger/destination with buffer,
                # capped at CHARGE_TARGET_SOC (90%) to avoid overcharging.
                min_needed_soc = energy_to_next_charger_soc + MIN_BUFFER_SOC
                target_soc = min(min_needed_soc, CHARGE_TARGET_SOC)

                deficit_soc = max(0, target_soc - current_soc)
                if deficit_soc > 0.001:
                    charge_added_kwh = deficit_soc * effective_capacity
                    charge_rate = from_node.get('charge_rate_kw') or 150.0
                    charge_time_mins = math.ceil(charge_added_kwh / charge_rate * 60)
                    current_soc += deficit_soc
                    total_charge_time_mins += charge_time_mins
                    total_stops_required += 1
                    no_charge_needed = False
                    used_charger = True

            # Record departure SoC (after any charging has occurred)
            start_soc = current_soc

            # --- STEP 2: Drive the leg — check if we can reach the next node ---
            # Use a small epsilon to avoid float rounding false-infeasibility
            will_arrive_soc = current_soc - energy_needed_soc
            if will_arrive_soc < MIN_BUFFER_SOC - 0.001:
                feasible = False

            current_soc -= energy_needed_soc
            current_soc = max(current_soc, 0.0)

            # --- STEP 3: At the ARRIVAL node, update cargo if it's a stop ---
            unload_lbs = 0
            pickup_lbs = 0
            end_load = current_load
            
            if to_node['type'] == 'stop':
                unload_lbs = to_node.get('unload_lbs', 0)
                pickup_lbs = to_node.get('pickup_lbs', 0)
                end_load = max(0, current_load - unload_lbs + pickup_lbs)
                total_unload_time_mins += 30  # Fixed unload time (not counted vs charge threshold)
                total_stops_required += 1

            leg_details.append(LegDetail(
                leg_number=i + 1,
                distance_miles=round(leg_distance, 2),
                start_soc=round(start_soc * 100, 2),
                end_soc=round(current_soc * 100, 2),
                start_load_lbs=round(current_load, 2),
                end_load_lbs=round(end_load, 2),
                pickup_lbs=pickup_lbs,
                charge_added_kwh=round(charge_added_kwh, 2),
                charge_time_mins=charge_time_mins,
                unload_lbs=unload_lbs,
                used_charger=used_charger
            ))

            current_load = end_load

            current_mile_marker = to_node['mile_marker']
            
        arrival_soc = round(current_soc * 100, 2)
        total_stop_time_mins = total_charge_time_mins + total_unload_time_mins
        
        # Status is based on CHARGING time only (unload stops are unavoidable and don't
        # reflect energy feasibility — they're always counted regardless of truck).
        green_limit_mins = 60 + route.distance_miles * 0.2
        yellow_limit_mins = 120 + route.distance_miles * 0.4
        
        if not feasible:
            status = "red"
        elif no_charge_needed:
            status = "green"
        elif total_charge_time_mins < green_limit_mins:
            status = "green"
        elif total_charge_time_mins < yellow_limit_mins:
            status = "yellow"
        else:
            status = "red"
            
        results.append(FeasibilityResult(
            truck_id=truck.id,
            status=status,
            arrival_soc=arrival_soc,
            energy_required_kwh=round(total_energy_kwh, 2),
            charge_time_mins=total_stop_time_mins,
            stops_required=total_stops_required,
            no_charge_needed=no_charge_needed,
            leg_details=leg_details
        ))
    
    # Sort results: no_charge_needed=True greens first, then by total_charge_time_mins ascending, 
    # then by arrival_soc descending
    results.sort(key=lambda x: (
        not (x.status == "green" and x.no_charge_needed),
        x.charge_time_mins if x.charge_time_mins is not None else 0,
        -x.arrival_soc
    ))
    
    return results
