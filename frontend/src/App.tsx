import { useState, useEffect, useMemo } from 'react';
import type { Truck, Route, FeasibilityResult } from './types';
import { fetchTrucks, fetchRoutes, fetchFeasibility } from './api';
import TruckCard from './components/TruckCard';
import RouteCard from './components/RouteCard';
import './styles/App.css';

function App() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [feasibilityMap, setFeasibilityMap] = useState<Record<string, FeasibilityResult>>({});
  const [allRouteFeasibility, setAllRouteFeasibility] = useState<Record<string, FeasibilityResult[]>>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Initial data fetch
  useEffect(() => {
    const initData = async () => {
      try {
        const [truckData, routeData] = await Promise.all([
          fetchTrucks(),
          fetchRoutes()
        ]);
        setTrucks(truckData);
        setRoutes(routeData);

        // Fetch feasibility for ALL routes in parallel
        const allFeas = await Promise.all(
          routeData.map(async (route) => ({
            id: route.id,
            results: await fetchFeasibility(route.id)
          }))
        );

        const allFeasMap = allFeas.reduce((acc, curr) => {
          acc[curr.id] = curr.results;
          return acc;
        }, {} as Record<string, FeasibilityResult[]>);

        setAllRouteFeasibility(allFeasMap);
      } catch (error) {
        console.error('Failed to initialize dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const handleRouteClick = async (routeId: string) => {
    if (selectedRouteId === routeId) {
      setSelectedRouteId(null);
      setFeasibilityMap({});
      return;
    }

    setSelectedRouteId(routeId);
    try {
      const feasibilityData = await fetchFeasibility(routeId);
      const mapping = feasibilityData.reduce((acc, curr) => {
        acc[curr.truck_id] = curr;
        return acc;
      }, {} as Record<string, FeasibilityResult>);
      setFeasibilityMap(mapping);
    } catch (error) {
      console.error('Error calculating feasibility:', error);
      setFeasibilityMap({});
    }
  };

  const feasibilitySummary = useMemo(() => {
    if (!selectedRouteId) return null;
    const stats = { green: 0, yellow: 0, red: 0 };
    Object.values(feasibilityMap).forEach(f => {
      if (f.status === 'green') stats.green++;
      else if (f.status === 'yellow') stats.yellow++;
      else if (f.status === 'red') stats.red++;
    });
    return stats;
  }, [feasibilityMap, selectedRouteId]);

  const sortedTrucks = useMemo(() => {
    if (!selectedRouteId) return trucks;
    return [...trucks].sort((a, b) => {
      const feasA = feasibilityMap[a.id];
      const feasB = feasibilityMap[b.id];
      if (!feasA) return 1;
      if (!feasB) return -1;
      return feasB.arrival_soc - feasA.arrival_soc;
    });
  }, [trucks, selectedRouteId, feasibilityMap]);

  const bestMatchTruckId = useMemo(() => {
    if (!selectedRouteId) return null;
    const best = sortedTrucks.find(truck => {
      const feasibility = feasibilityMap[truck.id];
      return feasibility?.status === 'green' && truck.status === 'ready';
    });
    return best?.id || null;
  }, [sortedTrucks, feasibilityMap, selectedRouteId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-slate-600 font-medium">Initializing EV Dispatch Control...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden font-sans">
      <nav className="bg-slate-900 text-white px-6 py-4 flex items-center shadow-lg z-10 transition-colors duration-500">
        <div className="flex items-center gap-3 group">
          <div className="bg-indigo-500 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-xl font-black tracking-tighter uppercase">EV Dispatch Control</h1>
        </div>
        <div className="ml-auto flex items-center gap-6">
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-r border-slate-700 pr-6">
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500"></span>Round Trip</div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-500"></span>Charge Needed</div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500"></span>Infeasible</div>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            System: Active · Nodes: {trucks.length}
          </div>
        </div>
      </nav>

      <main className="flex-1 flex overflow-hidden">
        <section className="w-3/5 h-full overflow-y-auto p-6 scroll-smooth bg-white/50 backdrop-blur-sm border-r border-slate-200">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Fleet Operations</h2>
            {feasibilitySummary ? (
              <div className="mt-3 flex items-center gap-3 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100/50 transition-all animate-in fade-in slide-in-from-top-2">
                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mr-2">Feasibility Summary</span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">
                  {feasibilitySummary.green} Feasible
                </span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-[10px] font-bold">
                  {feasibilitySummary.yellow} Need Charge
                </span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                  {feasibilitySummary.red} Infeasible
                </span>
              </div>
            ) : (
              <p className="mt-1 text-sm text-slate-400 font-medium italic">Select a route to calculate operational feasibility</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 relative">
            {sortedTrucks.map(truck => (
              <div key={truck.id} className="transition-all duration-500 ease-in-out transform">
                <TruckCard
                  truck={truck}
                  feasibility={feasibilityMap[truck.id] || null}
                  isBestMatch={truck.id === bestMatchTruckId}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="w-2/5 h-full overflow-y-auto p-6 bg-slate-50">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Available Routes</h2>
            <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-1 rounded font-black uppercase tracking-widest">
              {routes.length} Loaded
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {routes.map(route => {
              const routeResults = allRouteFeasibility[route.id] || [];
              const summary = routeResults.length > 0 ? {
                green: routeResults.filter(f => f.status === 'green').length,
                yellow: routeResults.filter(f => f.status === 'yellow').length,
                red: routeResults.filter(f => f.status === 'red').length,
              } : null;

              return (
                <RouteCard
                  key={route.id}
                  route={route}
                  isSelected={selectedRouteId === route.id}
                  onClick={() => handleRouteClick(route.id)}
                  feasibilitySummary={summary}
                />
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
