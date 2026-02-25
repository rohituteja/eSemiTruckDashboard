import { type FC } from 'react';
import type { Route } from '../types';

interface RouteCardProps {
    route: Route;
    isSelected: boolean;
    onClick: () => void;
}

const RouteCard: FC<RouteCardProps> = ({ route, isSelected, onClick }) => {
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
                        <span className="text-gray-500 text-[11px] uppercase font-semibold">Payload</span>
                        <span className="text-gray-900 font-bold">{route.load_lbs.toLocaleString()} lbs</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-gray-500 text-[11px] uppercase font-semibold">Terrain</span>
                        <span className="text-gray-900 font-bold">{route.terrain_multiplier}x</span>
                    </div>
                </div>
            </div>

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
