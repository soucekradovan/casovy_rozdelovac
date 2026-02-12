
import React from 'react';
import { CalculationResult } from '../types';
import { formatDuration } from '../utils/timeUtils';

interface ResultsViewProps {
  result: CalculationResult | null;
}

const COLORS_CLASSES: Record<string, string> = {
  'indigo': 'bg-indigo-500',
  'emerald': 'bg-emerald-500',
  'rose': 'bg-rose-500',
  'sky': 'bg-sky-500',
  'violet': 'bg-violet-500',
  'orange': 'bg-orange-500',
};

const ResultsView: React.FC<ResultsViewProps> = ({ result }) => {
  if (!result) return (
    <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p>Vyplňte časy a zakázky pro výpočet rozdělení.</p>
    </div>
  );

  const endTimeChanged = result.calculatedEndTime !== result.originalEndTime;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 relative z-10">
          <div>
            <p className="text-indigo-100 text-xs font-medium uppercase tracking-wider">Pracovní fond</p>
            <h2 className="text-2xl font-bold">{formatDuration(result.workingDurationMinutes)}</h2>
          </div>
          <div>
            <p className="text-indigo-100 text-xs font-medium uppercase tracking-wider">Na zakázku</p>
            <h2 className="text-2xl font-bold">{result.intervalMinutes} <span className="text-sm font-normal text-indigo-200">min</span></h2>
          </div>
          <div className="sm:text-right">
            <p className="text-indigo-100 text-xs font-medium uppercase tracking-wider">Upravený konec</p>
            <div className="flex flex-col sm:items-end">
                <h2 className={`text-2xl font-bold ${endTimeChanged ? 'text-amber-300' : ''}`}>
                    {result.calculatedEndTime}
                </h2>
                {endTimeChanged && (
                    <span className="text-[10px] text-indigo-200 line-through opacity-70">Původně {result.originalEndTime}</span>
                )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">Časový rozvrh</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded uppercase tracking-wider flex items-center gap-1">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
               Výtahová logika
            </span>
        </div>
        
        <div className="relative pl-12 pr-4 space-y-4">
          {/* Shaft line */}
          <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-slate-200 -z-0"></div>
          
          {result.intervals.map((interval, idx) => (
            <div 
              key={idx} 
              className={`relative border rounded-xl p-4 flex items-center shadow-sm transition-all z-10 ${
                interval.type === 'break' 
                  ? 'bg-amber-50 border-amber-200 ring-1 ring-amber-100' 
                  : 'bg-white border-slate-200 hover:shadow-md'
              }`}
            >
              {/* Floor marker */}
              <div className={`absolute -left-10 h-6 w-6 rounded-full border-2 bg-white flex items-center justify-center ${
                 interval.type === 'break' ? 'border-amber-400 text-amber-500' : 'border-slate-300 text-slate-400'
              }`}>
                <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
              </div>

              <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border-2 border-white ring-1 ring-slate-100 mr-4 ${
                interval.type === 'break' 
                  ? 'bg-amber-400' 
                  : (COLORS_CLASSES[interval.color || 'indigo'])
              }`}>
                {interval.type === 'break' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1-1z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className={`font-bold ${interval.type === 'break' ? 'text-amber-900' : 'text-slate-900'}`}>
                    {interval.jobName}
                  </h4>
                  {interval.type === 'break' && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-200 text-amber-800 rounded uppercase tracking-wide">
                      Přestávka
                    </span>
                  )}
                </div>
                <div className="flex gap-4 text-sm text-slate-500 mt-1">
                  <span className="flex items-center gap-1 font-mono text-base font-medium">
                    {interval.startTime} – {interval.endTime}
                  </span>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <span className={`text-xs font-bold px-2 py-1 rounded-full border ${
                  interval.type === 'break' 
                    ? 'bg-white text-amber-700 border-amber-200' 
                    : 'bg-green-50 text-green-700 border-green-100'
                }`}>
                  {interval.durationMinutes} min
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {endTimeChanged && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-800 flex gap-2 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Koncový čas byl upraven na {result.calculatedEndTime}, aby každá zakázka trvala přesně {result.intervalMinutes} minut bez zbytkových sekund.
            </p>
          </div>
      )}
    </div>
  );
};

export default ResultsView;
