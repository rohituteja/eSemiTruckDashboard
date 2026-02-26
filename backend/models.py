from pydantic import BaseModel
from typing import Optional

class ChargingStation(BaseModel):
    mile_marker: float
    charge_rate_kw: float

class Stop(BaseModel):
    mile_marker: float
    unload_lbs: float = 0
    pickup_lbs: float = 0
    has_charger: bool
    charge_rate_kw: float | None = None

class LegDetail(BaseModel):
    leg_number: int
    distance_miles: float
    start_soc: float
    end_soc: float
    start_load_lbs: float
    end_load_lbs: float
    pickup_lbs: float
    charge_added_kwh: float
    charge_time_mins: int
    unload_lbs: float
    used_charger: bool
    end_location_name: str = ""
    end_has_charger: bool = False

class Truck(BaseModel):
    id: str
    name: str
    soc: float              # State of Charge, 0-100
    soh: float              # State of Health, 0-100
    capacity_kwh: float     # Battery capacity
    load_lbs: float         # Current cargo load
    status: str             # "ready" | "charging" | "maintenance"
    charge_eta_mins: Optional[int] = None  # Only set if status is "charging"
    range_miles: float | None = None

class Route(BaseModel):
    id: str
    name: str
    distance_miles: float
    elevation_gain_ft: float
    priority: str           # "urgent" | "standard"
    terrain_multiplier: float
    base_consumption: float # kWh per mile baseline
    charging_stations: list[ChargingStation] = []
    stops: list[Stop] = []

class FeasibilityResult(BaseModel):
    truck_id: str
    status: str             # "green" | "yellow" | "red"
    arrival_soc: float      # Predicted SoC % at destination
    energy_required_kwh: float
    charge_time_mins: int | None = None
    total_stop_time_mins: int | None = None
    estimated_trip_time_mins: int | None = None
    energy_cost_estimate: float | None = None
    stops_required: int = 0
    no_charge_needed: bool = True
    not_available: bool = False
    feasible_after_precharge: bool = False
    precharge_mins: int | None = None
    precharge_kwh: float | None = None
    leg_details: list[LegDetail] = []
