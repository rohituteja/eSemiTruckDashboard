from pydantic import BaseModel
from typing import Optional

class Truck(BaseModel):
    id: str
    name: str
    soc: float              # State of Charge, 0-100
    soh: float              # State of Health, 0-100
    capacity_kwh: float     # Battery capacity
    load_lbs: float         # Current cargo load
    status: str             # "ready" | "charging" | "maintenance"
    charge_eta_mins: Optional[int] = None  # Only set if status is "charging"

class Route(BaseModel):
    id: str
    name: str
    distance_miles: float
    elevation_gain_ft: float
    load_lbs: float
    priority: str           # "urgent" | "standard"
    terrain_multiplier: float
    base_consumption: float # kWh per mile baseline

class FeasibilityResult(BaseModel):
    truck_id: str
    status: str             # "green" | "yellow" | "red"
    arrival_soc: float      # Predicted SoC % at destination
    energy_required_kwh: float
    charge_time_mins: Optional[int] = None
