import type { Truck, Route, FeasibilityResult } from '../types';

const BASE_URL = 'http://localhost:8000';

export async function fetchTrucks(): Promise<Truck[]> {
    try {
        const response = await fetch(`${BASE_URL}/trucks`);
        if (!response.ok) {
            throw new Error(`Failed to fetch trucks: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching trucks:', error);
        throw error;
    }
}

export async function fetchRoutes(): Promise<Route[]> {
    try {
        const response = await fetch(`${BASE_URL}/routes`);
        if (!response.ok) {
            throw new Error(`Failed to fetch routes: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching routes:', error);
        throw error;
    }
}

export async function fetchFeasibility(routeId: string): Promise<FeasibilityResult[]> {
    try {
        const response = await fetch(`${BASE_URL}/routes/${routeId}/feasibility`);
        if (!response.ok) {
            throw new Error(`Failed to fetch feasibility: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching feasibility for route ${routeId}:`, error);
        throw error;
    }
}
