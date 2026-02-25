export interface Truck {
    id: string;
    name: string;
    soc: number;              // State of Charge, 0-100
    soh: number;              // State of Health, 0-100
    capacity_kwh: number;     // Battery capacity
    load_lbs: number;         // Current cargo load
    status: 'ready' | 'charging' | 'maintenance' | string;
    charge_eta_mins: number | null; // Only set if status is "charging"
}

export interface Route {
    id: string;
    name: string;
    distance_miles: number;
    elevation_gain_ft: number;
    load_lbs: number;
    priority: 'urgent' | 'standard' | string;
    terrain_multiplier: number;
    base_consumption: number; // kWh per mile baseline
}

export interface FeasibilityResult {
    truck_id: string;
    status: 'green' | 'yellow' | 'red' | string;
    arrival_soc: number;      // Predicted SoC % at destination
    energy_required_kwh: number;
}
