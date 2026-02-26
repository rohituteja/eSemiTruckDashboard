import { useState, useEffect, type FC } from 'react';
import type { Truck, FeasibilityResult } from '../types';

interface TruckCardProps {
    truck: Truck;
    feasibility: FeasibilityResult | null;
    isBestMatch?: boolean;
    baseTime?: Date;
}

const TruckCard: FC<TruckCardProps> = ({ truck, feasibility, isBestMatch, baseTime = new Date() }) => {
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

    const isAvailable = truck.status === 'ready' || truck.status === 'charging';

    // Border and status highlight based on feasibility
    const getFeasibilityStyles = () => {
        if (!feasibility || feasibility.not_available) return 'border-gray-200 bg-white';

        const hasWaitTime = (truck.charge_eta_mins || 0) > 0 || (feasibility.precharge_mins || 0) > 0;

        // If it's feasible but needs any charge/wait time, show amber (yellow)
        if (feasibility.status === 'green' && hasWaitTime) {
            return 'border-l-amber-500 border-l-4 bg-white shadow-sm';
        }

        if (feasibility.feasible_after_precharge) {
            return 'border-l-amber-500 border-l-4 bg-white shadow-sm';
        }

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
        const hasWaitTime = (truck.charge_eta_mins || 0) > 0 || (feasibility.precharge_mins || 0) > 0;

        if (feasibility.feasible_after_precharge || (feasibility.status === 'green' && hasWaitTime)) {
            return 'bg-amber-100 text-amber-800';
        }

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

    // Helper formatting logic placed inline in the table

    const handleDispatch = () => {
        console.log(`[DISPATCH] Truck ${truck.id} (${truck.name}) authorized for route.`);
        const confirmResult = window.confirm(`Confirm dispatch for ${truck.name} to start mission?`);
        if (confirmResult) {
            alert(`Dispatch signal sent to ${truck.name}. Mission active.`);
        }
    };

    // Status badge logic
    const renderStatusBadge = () => {
        const totalWaitMins = (truck.charge_eta_mins || 0) + (feasibility?.precharge_mins || 0);
        const availableTime = new Date(baseTime.getTime() + totalWaitMins * 60000);
        const timeStr = availableTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // CASE 1: Feasible-after-precharge (Explicitly marked as needing depot charge)
        if (feasibility && feasibility.feasible_after_precharge) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                    Pre-charge — {totalWaitMins} min (Avail. {timeStr})
                </span>
            );
        }

        // CASE 2: Feasible now, but still charging/waiting for some reason
        if (feasibility && feasibility.status === 'green' && totalWaitMins > 0) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                    Wait for Charge — {totalWaitMins}m (Ready {timeStr})
                </span>
            );
        }

        // CASE 3: Yellow feasibility (Requires charge to BE feasible)
        if (feasibility && feasibility.status === 'yellow') {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                    Needs {totalWaitMins}m depot charge (Avail. {timeStr})
                </span>
            );
        }

        // CASE 4: Truly ready now
        if (feasibility && feasibility.status === 'green' && totalWaitMins === 0) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Ready
                </span>
            );
        }

        // CASE 5: Infeasible
        if (feasibility && feasibility.status === 'red') {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                    Infeasible
                </span>
            );
        }

        // Default cases (No feasibility context)
        switch (truck.status) {
            case 'ready':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Ready
                    </span>
                );
            case 'charging': {
                if (!feasibility) {
                    return (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            Charging — Full in {totalWaitMins}m ({timeStr})
                        </span>
                    );
                }

                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Charging — {totalWaitMins} min (Avail. {timeStr})
                    </span>
                );
            }
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div className="bg-slate-50 p-2 rounded border border-slate-100">
                        <span className="text-gray-400 font-medium uppercase text-[9px] block">Est. Range</span>
                        <span className="font-bold text-gray-900">{truck.range_miles != null ? `${truck.range_miles.toFixed(0)} mi` : "—"}</span>
                    </div>
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
                        {feasibility.not_available ? (
                            <p className="text-[10px] text-gray-400 italic">
                                Unavailable for dispatch — skipped in feasibility analysis
                            </p>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`px-2 py-1 rounded-sm text-[10px] font-black uppercase tracking-wider ${getFeasibilityBadgeStyles()}`}>
                                            Arrival SoC: {feasibility.arrival_soc.toFixed(1)}%
                                        </span>
                                        {!feasibility.no_charge_needed && feasibility.charge_time_mins && (
                                            <span className="px-2 py-1 rounded-sm text-[10px] font-black uppercase tracking-wider bg-yellow-50 text-yellow-700">
                                                {(() => {
                                                    // Calculate overlapping time where charging happens during load/unload
                                                    const overlapMins = feasibility.leg_details.reduce((acc, leg) => {
                                                        if (leg.used_charger && (leg.unload_lbs > 0 || leg.pickup_lbs > 0)) {
                                                            // Assume 30 mins for load/unload per stop, but don't subtract more than the leg's charge time
                                                            return acc + Math.min(30, leg.charge_time_mins);
                                                        }
                                                        return acc;
                                                    }, 0);

                                                    const netChargeMins = Math.max(0, (feasibility.charge_time_mins || 0) - overlapMins);
                                                    const hrs = Math.floor(netChargeMins / 60);
                                                    const mins = netChargeMins % 60;
                                                    return `+${hrs}h ${mins}m added`;
                                                })()}
                                            </span>
                                        )}
                                        <span className="px-2 py-1 rounded-sm text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700">
                                            {feasibility.stops_required} stops
                                        </span>
                                    </div>
                                </div>

                                <div className="mb-3 flex flex-wrap gap-2 items-center">
                                    <span className="px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                                        Route Range Req: {feasibility.energy_required_kwh.toFixed(0)} kWh ({(feasibility.energy_required_kwh / (truck.soh / 100 * truck.capacity_kwh) * 100).toFixed(0)}% of capacity)
                                    </span>
                                    {feasibility.energy_cost_estimate != null && (
                                        <span className="px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                                            Est. Cost: ${feasibility.energy_cost_estimate.toFixed(2)}
                                        </span>
                                    )}
                                    {feasibility.estimated_trip_time_mins != null && (
                                        <span className="px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                                            {(() => {
                                                const startT = new Date(baseTime.getTime() + ((truck.charge_eta_mins || 0) + (feasibility.precharge_mins || 0)) * 60000);
                                                const endT = new Date(startT.getTime() + feasibility.estimated_trip_time_mins * 60000);
                                                const startStr = startT.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                const endStr = endT.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                const hrs = Math.floor(feasibility.estimated_trip_time_mins / 60);
                                                const mins = feasibility.estimated_trip_time_mins % 60;
                                                return `Transit: ${hrs}h ${mins}m (${startStr} → ${endStr})`;
                                            })()}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between mb-2">
                                    <button
                                        onClick={() => setShowLegs(!showLegs)}
                                        className="text-[10px] text-indigo-600 font-bold uppercase tracking-tight hover:text-indigo-800 transition-colors"
                                    >
                                        {showLegs ? 'Hide leg details ▴' : 'Show leg details ▾'}
                                    </button>

                                    {isAvailable && feasibility.status !== 'red' && (
                                        <button
                                            onClick={handleDispatch}
                                            className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase rounded hover:bg-indigo-700 transition-all shadow-sm active:scale-95"
                                        >
                                            Dispatch Truck
                                        </button>
                                    )}
                                </div>

                                {showLegs && (
                                    <div className="mt-2 overflow-x-auto border rounded border-slate-100 shadow-sm">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-100 text-[9px] uppercase tracking-tighter text-gray-500 font-black">
                                                    <th className="px-1.5 py-1 border-b">Target</th>
                                                    <th className="px-1.5 py-1 border-b">Miles</th>
                                                    <th className="px-1.5 py-1 border-b">Start</th>
                                                    <th className="px-1.5 py-1 border-b">End</th>
                                                    <th className="px-1.5 py-1 border-b text-center">Load In</th>
                                                    <th className="px-1.5 py-1 border-b text-center">Load Out</th>
                                                    <th className="px-1.5 py-1 border-b text-right" title="Charge at start of leg">Dep. Charge</th>
                                                    <th className="px-1.5 py-1 border-b text-right" title="Activity at target">Arr. Activity</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-[10px] font-medium text-gray-700">
                                                {feasibility.leg_details.map((leg, idx) => (
                                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                                                        <td className="px-1.5 py-1 border-b text-gray-700 font-medium whitespace-nowrap">
                                                            {leg.end_location_name}
                                                            {leg.end_has_charger && (
                                                                <span className="ml-1 text-yellow-500" title="Charger available here">⚡</span>
                                                            )}
                                                        </td>
                                                        <td className="px-1.5 py-1 border-b">{leg.distance_miles.toFixed(0)}</td>
                                                        <td className="px-1.5 py-1 border-b whitespace-nowrap">{leg.start_soc.toFixed(1)}%</td>
                                                        <td className="px-1.5 py-1 border-b whitespace-nowrap">
                                                            <span className={leg.end_soc < 15 ? "text-red-500 font-bold" : ""}>
                                                                {leg.end_soc.toFixed(1)}%
                                                            </span>
                                                        </td>
                                                        <td className="px-1.5 py-1 border-b text-center">{(leg.start_load_lbs / 1000).toFixed(1)}k</td>
                                                        <td className="px-1.5 py-1 border-b text-center">{(leg.end_load_lbs / 1000).toFixed(1)}k</td>
                                                        <td className="px-1.5 py-1 border-b text-right whitespace-nowrap">
                                                            {leg.used_charger ? <span className="text-blue-600 font-semibold">{leg.charge_added_kwh.toFixed(1)} kWh <span className="text-gray-400 font-normal text-[9px]">({leg.charge_time_mins}m)</span></span> : '—'}
                                                        </td>
                                                        <td className="px-1.5 py-1 border-b text-right whitespace-nowrap font-semibold text-gray-600">
                                                            {(() => {
                                                                if (leg.unload_lbs > 0 && leg.pickup_lbs > 0) return "30m un/load";
                                                                if (leg.unload_lbs > 0) return "30m unld";
                                                                if (leg.pickup_lbs > 0) return "30m pkup";
                                                                return "—";
                                                            })()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}


                                {feasibility.status === 'red' && !feasibility.feasible_after_precharge && !showLegs && (
                                    <div className="mt-2 text-[10px] bg-red-50 border border-red-200 rounded p-2">
                                        <p className="font-bold text-red-600 flex items-center gap-1 mb-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                            INFEASIBLE ROUTE
                                        </p>
                                        <p className="text-red-700">
                                            Truck battery capacity is insufficient for the distance between available chargers <span className="text-yellow-500 font-bold" title="Charger icon">⚡</span>. Adding chargers to intermediate stops would be required to make this route feasible.
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TruckCard;
