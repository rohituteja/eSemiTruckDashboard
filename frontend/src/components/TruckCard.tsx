import { useState, useEffect, type FC } from 'react';
import type { Truck, FeasibilityResult } from '../types';

interface TruckCardProps {
    truck: Truck;
    feasibility: FeasibilityResult | null;
    isBestMatch?: boolean;
}

const TruckCard: FC<TruckCardProps> = ({ truck, feasibility, isBestMatch }) => {
    const [animatedSoc, setAnimatedSoc] = useState(0);
    const [showLegs, setShowLegs] = useState(false);

    // Reset showLegs when feasibility changes
    useEffect(() => {
        setShowLegs(false);
    }, [feasibility]);

    // Animate SoC from 0 to value on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedSoc(truck.soc);
        }, 100);
        return () => clearTimeout(timer);
    }, [truck.soc]);

    const isAvailable = truck.status === 'ready';

    // Border and status highlight based on feasibility
    const getFeasibilityStyles = () => {
        if (!feasibility) return 'border-gray-200 bg-white';

        switch (feasibility.status) {
            case 'green':
                return 'border-l-green-500 border-l-4 bg-white shadow-sm';
            case 'yellow':
                return 'border-l-yellow-500 border-l-4 bg-white shadow-sm';
            case 'red':
                return 'border-l-red-500 border-l-4 bg-white shadow-sm';
            default:
                return 'border-gray-200 bg-white';
        }
    };

    const getFeasibilityBadgeStyles = () => {
        if (!feasibility) return '';
        switch (feasibility.status) {
            case 'green': return 'bg-green-100 text-green-800';
            case 'yellow': return 'bg-yellow-100 text-yellow-800';
            case 'red': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // SoC color logic
    const getSoCColor = (soc: number) => {
        if (soc > 50) return 'bg-green-500';
        if (soc >= 20) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    // Status badge logic
    const renderStatusBadge = () => {
        switch (truck.status) {
            case 'ready':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Ready
                    </span>
                );
            case 'charging':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Charging — {truck.charge_eta_mins} min
                    </span>
                );
            case 'maintenance':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                        Maintenance
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {truck.status}
                    </span>
                );
        }
    };

    return (
        <div className={`p-4 rounded-lg border transition-all duration-300 ${getFeasibilityStyles()} ${!isAvailable ? 'opacity-60 saturate-[0.8]' : ''}`}>
            <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">{truck.name}</h3>
                        {isBestMatch && (
                            <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] font-black uppercase rounded tracking-wider ring-1 ring-indigo-200">
                                Best Match
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 font-mono tracking-tight">{truck.id}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    {renderStatusBadge()}
                    {!isAvailable && (
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-tighter">
                            Not available for dispatch
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {/* SoC Progress Bar */}
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 font-medium text-xs uppercase tracking-wider">State of Charge</span>
                        <span className="text-gray-900 font-bold">{truck.soc}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 shadow-inner overflow-hidden">
                        <div
                            className={`h-2 rounded-full ${getSoCColor(truck.soc)} transition-all duration-1000 ease-out`}
                            style={{ width: `${animatedSoc}%` }}
                        ></div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-slate-50 p-2 rounded border border-slate-100">
                        <span className="text-gray-400 font-medium uppercase text-[9px] block">State of Health</span>
                        <span className="font-bold text-gray-900">{truck.soh}%</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-100">
                        <span className="text-gray-400 font-medium uppercase text-[9px] block">Current Load</span>
                        <span className="font-bold text-gray-900">{truck.load_lbs.toLocaleString()} lbs</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-100">
                        <span className="text-gray-400 font-medium uppercase text-[9px] block">Effective Cap.</span>
                        <span className="font-bold text-gray-900">{(truck.soh / 100 * truck.capacity_kwh).toFixed(1)} kWh</span>
                    </div>
                </div>

                {/* Feasibility Data */}
                {feasibility && (
                    <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex flex-wrap gap-2">
                                <span className={`px-2 py-1 rounded-sm text-[10px] font-black uppercase tracking-wider ${getFeasibilityBadgeStyles()}`}>
                                    Arrival SoC: {feasibility.arrival_soc.toFixed(1)}%
                                </span>
                                {!feasibility.no_charge_needed && feasibility.charge_time_mins && (
                                    <span className="px-2 py-1 rounded-sm text-[10px] font-black uppercase tracking-wider bg-yellow-50 text-yellow-700">
                                        +{Math.floor(feasibility.charge_time_mins / 60)}h {feasibility.charge_time_mins % 60}m added
                                    </span>
                                )}
                                <span className="px-2 py-1 rounded-sm text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700">
                                    {feasibility.stops_required} stops
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowLegs(!showLegs)}
                            className="text-[10px] text-indigo-600 font-bold uppercase tracking-tight hover:text-indigo-800 transition-colors"
                        >
                            {showLegs ? 'Hide leg details ▴' : 'Show leg details ▾'}
                        </button>

                        {showLegs && (
                            <div className="mt-2 overflow-x-auto border rounded border-slate-100 shadow-sm">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-100 text-[9px] uppercase tracking-tighter text-gray-500 font-black">
                                            <th className="px-1.5 py-1 border-b">Leg</th>
                                            <th className="px-1.5 py-1 border-b">Miles</th>
                                            <th className="px-1.5 py-1 border-b">Start</th>
                                            <th className="px-1.5 py-1 border-b">End</th>
                                            <th className="px-1.5 py-1 border-b text-center">Load In</th>
                                            <th className="px-1.5 py-1 border-b text-center">Load Out</th>
                                            <th className="px-1.5 py-1 border-b text-right">Charged</th>
                                            <th className="px-1.5 py-1 border-b text-right">Stop Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-[10px] font-medium text-gray-700">
                                        {feasibility.leg_details.map((leg, idx) => (
                                            <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                                                <td className="px-1.5 py-1 border-b text-gray-500 font-mono">{leg.leg_number}</td>
                                                <td className="px-1.5 py-1 border-b">{leg.distance_miles.toFixed(0)}</td>
                                                <td className="px-1.5 py-1 border-b whitespace-nowrap">{leg.start_soc.toFixed(1)}%</td>
                                                <td className="px-1.5 py-1 border-b whitespace-nowrap">{leg.end_soc.toFixed(1)}%</td>
                                                <td className="px-1.5 py-1 border-b text-center">{(leg.start_load_lbs / 1000).toFixed(1)}k</td>
                                                <td className="px-1.5 py-1 border-b text-center">{(leg.end_load_lbs / 1000).toFixed(1)}k</td>
                                                <td className="px-1.5 py-1 border-b text-right whitespace-nowrap">
                                                    {leg.used_charger ? `${leg.charge_added_kwh.toFixed(1)} kWh` : '—'}
                                                </td>
                                                <td className="px-1.5 py-1 border-b text-right whitespace-nowrap font-semibold">
                                                    {(() => {
                                                        const activities = [];
                                                        if (leg.unload_lbs > 0 && leg.pickup_lbs > 0) activities.push("30 min (unload + pickup)");
                                                        else if (leg.unload_lbs > 0) activities.push("30 min (unload)");
                                                        else if (leg.pickup_lbs > 0) activities.push("30 min (pickup)");

                                                        let res = activities[0] || "";
                                                        if (leg.used_charger && leg.charge_time_mins > 0) {
                                                            if (res) res += ` + ${leg.charge_time_mins}m charge`;
                                                            else res = `${leg.charge_time_mins}m charge`;
                                                        }
                                                        return res || "—";
                                                    })()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {feasibility.status === 'red' && !showLegs && (
                            <p className="mt-2 text-[10px] font-bold text-red-600 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                INFEASIBLE
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TruckCard;
