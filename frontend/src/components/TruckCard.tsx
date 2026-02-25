import { useState, useEffect, type FC } from 'react';
import type { Truck, FeasibilityResult } from '../types';

interface TruckCardProps {
    truck: Truck;
    feasibility: FeasibilityResult | null;
}

const TruckCard: FC<TruckCardProps> = ({ truck, feasibility }) => {
    const [animatedSoc, setAnimatedSoc] = useState(0);

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
                <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{truck.name}</h3>
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
                <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-50 p-2 rounded border border-slate-100">
                        <span className="text-gray-400 font-medium uppercase text-[9px] block">State of Health</span>
                        <span className="font-bold text-gray-900">{truck.soh}%</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-100">
                        <span className="text-gray-400 font-medium uppercase text-[9px] block">Current Load</span>
                        <span className="font-bold text-gray-900">{truck.load_lbs.toLocaleString()} lbs</span>
                    </div>
                </div>

                {/* Feasibility Data */}
                {feasibility && (
                    <div className="pt-3 border-t border-gray-100">
                        <div className="flex flex-wrap gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-sm text-[10px] font-black uppercase tracking-wider ${getFeasibilityBadgeStyles()}`}>
                                Arrival SoC: {feasibility.arrival_soc.toFixed(1)}%
                            </span>
                            <span className="px-2 py-1 rounded-sm text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700">
                                Energy: {feasibility.energy_required_kwh.toFixed(1)} kWh
                            </span>
                        </div>

                        {feasibility.status === 'yellow' && (
                            <p className="text-[10px] font-bold text-yellow-600 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.365-.636 1.283-.636 1.648 0 l7.625 13.257c.365.636-.093 1.442-.824 1.442H3.294c-.731 0-1.19-.806-.827-1.442L8.257 3.099zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                EN-ROUTE CHARGE NEEDED (+45 MIN)
                            </p>
                        )}
                        {feasibility.status === 'red' && (
                            <p className="text-[10px] font-bold text-red-600 flex items-center gap-1">
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
