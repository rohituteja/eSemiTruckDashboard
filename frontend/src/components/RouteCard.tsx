import { type FC } from 'react';
import type { Route } from '../types';

interface RouteCardProps {
    route: Route;
    isSelected: boolean;
    onClick: () => void;
    feasibilitySummary: { green: number, yellow: number, red: number } | null;
}

const RouteCard: FC<RouteCardProps> = ({ route, isSelected, onClick, feasibilitySummary }) => {
    return (
        <div
            onClick={onClick}
            className={`relative p-4 rounded-lg border cursor-pointer transition-all duration-200 group
        ${isSelected
                    ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500'
                    : 'bg-white border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                }`}
        >
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className={`text-lg font-bold ${isSelected ? 'text-indigo-900' : 'text-gray-900'}`}>
                        {route.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono">{route.id}</p>
                </div>
                <div>
                    {route.priority === 'urgent' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">
                            Urgent
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
                            Standard
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-2 mt-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="flex flex-col">
                        <span className="text-gray-500 text-[11px] uppercase font-semibold">Distance</span>
                        <span className="text-gray-900 font-bold">{route.distance_miles.toFixed(1)} mi</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-gray-500 text-[11px] uppercase font-semibold">Elevation</span>
                        <span className="text-gray-900 font-bold">+{route.elevation_gain_ft.toLocaleString()} ft</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-gray-500 text-[11px] uppercase font-semibold">Terrain</span>
                        <span className="text-gray-900 font-bold">{route.terrain_multiplier}x</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-gray-500 text-[11px] uppercase font-semibold">Cargo Stops</span>
                        <span className="text-gray-900 font-bold text-xs">
                            {route.stops?.length || 0} <span className="text-gray-400 font-normal">({route.stops?.filter(s => s.has_charger).length || 0} w/ charger)</span>
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-gray-500 text-[11px] uppercase font-semibold">Stations</span>
                        <span className="text-gray-900 font-bold">{route.charging_stations?.length || 0} <span className="text-gray-400 font-normal">dedicated</span></span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-gray-500 text-[11px] uppercase font-semibold">Total Chargers</span>
                        <span className="text-indigo-600 font-bold">
                            {(route.charging_stations?.length || 0) + (route.stops?.filter(s => s.has_charger).length || 0)}
                        </span>
                    </div>
                </div>
            </div>

            {feasibilitySummary && (
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mr-1">Fleet Compatibility</span>
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-50 text-green-600 text-[9px] font-black border border-green-100" title="Ready for immediate dispatch">
                        {feasibilitySummary.green}
                    </span>
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-yellow-50 text-yellow-600 text-[9px] font-black border border-yellow-100" title="Feasible after charging/wait">
                        {feasibilitySummary.yellow}
                    </span>
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-50 text-red-600 text-[9px] font-black border border-red-100" title="Route infeasible for this truck">
                        {feasibilitySummary.red}
                    </span>
                </div>
            )}

            {isSelected && (
                <div className="absolute top-2 right-2 flex items-center">
                    <span className="text-[10px] text-indigo-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        ← click to deselect
                    </span>
                </div>
            )}
        </div>
    );
};

export default RouteCard;
