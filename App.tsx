
import React, { useState, useEffect, useCallback } from 'react';
import { Job, CalculationResult, CalculatedInterval } from './types';
import JobInput from './components/JobInput';
import ResultsView from './components/ResultsView';
import { timeToMinutes, minutesToTime } from './utils/timeUtils';

const App: React.FC = () => {
  const [startTime, setStartTime] = useState<string>('06:30');
  const [endTime, setEndTime] = useState<string>('10:00');
  const [hasLunchBreak, setHasLunchBreak] = useState<boolean>(true);
  const [lunchStartTime, setLunchStartTime] = useState<string>('08:00');
  const [jobs, setJobs] = useState<Job[]>([
    { id: '1', name: '225-037', color: 'indigo' },
    { id: '2', name: '225-038', color: 'emerald' },
    { id: '3', name: '225-039', color: 'rose' },
    { id: '4', name: '225-040', color: 'sky' },
  ]);
  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculateIntervals = useCallback(() => {
    if (!startTime || !endTime || jobs.length === 0) return;

    const startMins = timeToMinutes(startTime);
    let endMins = timeToMinutes(endTime);

    // Handle overnight shifts
    if (endMins < startMins) {
      endMins += 24 * 60;
    }

    const initialTotalDuration = endMins - startMins;
    const lunchDuration = hasLunchBreak ? 30 : 0;
    const initialWorkingDuration = initialTotalDuration - lunchDuration;

    if (initialWorkingDuration <= 0) {
      setResult(null);
      return;
    }

    // ROUNDING TO WHOLE MINUTES PER JOB
    const intervalPerJob = Math.round(initialWorkingDuration / jobs.length);
    const actualWorkingDuration = intervalPerJob * jobs.length;
    const actualTotalDuration = actualWorkingDuration + lunchDuration;
    const finalEndMins = startMins + actualTotalDuration;
    
    const lunchStartMins = timeToMinutes(lunchStartTime);
    
    const finalIntervals: CalculatedInterval[] = [];
    let currentTime = startMins;
    let jobIndex = 0;
    let lunchPlaced = !hasLunchBreak;

    while (jobIndex < jobs.length || !lunchPlaced) {
      // 1. Check if lunch should be placed precisely at lunchStartTime
      if (!lunchPlaced && currentTime >= lunchStartMins) {
        finalIntervals.push({
          type: 'break',
          jobName: 'OBĚD',
          startTime: minutesToTime(currentTime),
          endTime: minutesToTime(currentTime + lunchDuration),
          durationMinutes: lunchDuration,
        });
        currentTime += lunchDuration;
        lunchPlaced = true;
        continue;
      }

      // 2. Place jobs
      if (jobIndex < jobs.length) {
        const jobEnd = currentTime + intervalPerJob;
        const currentJob = jobs[jobIndex];
        
        // Handle lunch interruption within a job block
        if (!lunchPlaced && jobEnd > lunchStartMins && currentTime < lunchStartMins) {
           const timeBeforeLunch = lunchStartMins - currentTime;
           const timeAfterLunch = intervalPerJob - timeBeforeLunch;
           
           // Segment of job before lunch
           finalIntervals.push({
             type: 'job',
             jobId: currentJob.id,
             jobName: currentJob.name || `Zakázka ${jobIndex + 1}`,
             color: currentJob.color,
             startTime: minutesToTime(currentTime),
             endTime: minutesToTime(lunchStartMins),
             durationMinutes: timeBeforeLunch,
           });
           
           // The lunch break itself
           finalIntervals.push({
             type: 'break',
             jobName: 'OBĚD',
             startTime: minutesToTime(lunchStartMins),
             endTime: minutesToTime(lunchStartMins + lunchDuration),
             durationMinutes: lunchDuration,
           });
           
           // Remaining segment of the same job after lunch
           finalIntervals.push({
             type: 'job',
             jobId: currentJob.id,
             jobName: currentJob.name || `Zakázka ${jobIndex + 1}`,
             color: currentJob.color,
             startTime: minutesToTime(lunchStartMins + lunchDuration),
             endTime: minutesToTime(lunchStartMins + lunchDuration + timeAfterLunch),
             durationMinutes: timeAfterLunch,
           });
           
           currentTime = lunchStartMins + lunchDuration + timeAfterLunch;
           lunchPlaced = true;
           jobIndex++;
        } else {
          // Standard full job block
          finalIntervals.push({
            type: 'job',
            jobId: currentJob.id,
            jobName: currentJob.name || `Zakázka ${jobIndex + 1}`,
            color: currentJob.color,
            startTime: minutesToTime(currentTime),
            endTime: minutesToTime(jobEnd),
            durationMinutes: intervalPerJob,
          });
          currentTime = jobEnd;
          jobIndex++;
        }
      } else if (!lunchPlaced) {
        // Only lunch left if it's past all jobs
        finalIntervals.push({
            type: 'break',
            jobName: 'OBĚD',
            startTime: minutesToTime(currentTime),
            endTime: minutesToTime(currentTime + lunchDuration),
            durationMinutes: lunchDuration,
        });
        currentTime += lunchDuration;
        lunchPlaced = true;
      }
    }

    setResult({
      totalDurationMinutes: actualTotalDuration,
      workingDurationMinutes: actualWorkingDuration,
      intervalMinutes: intervalPerJob,
      intervals: finalIntervals,
      calculatedEndTime: minutesToTime(finalEndMins),
      originalEndTime: endTime,
    });
  }, [startTime, endTime, hasLunchBreak, lunchStartTime, jobs]);

  useEffect(() => {
    calculateIntervals();
  }, [calculateIntervals]);

  return (
    <div className="min-h-screen pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-md shadow-indigo-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Časový <span className="text-indigo-600">rozdělovač</span></h1>
          </div>
          <div className="hidden sm:block text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            Průmyslový standard rozvrhování
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Konfigurace směny
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Začátek</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Konec</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                        type="checkbox" 
                        checked={hasLunchBreak} 
                        onChange={(e) => setHasLunchBreak(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm font-semibold text-amber-900">Přestávka na oběd</span>
                  </label>
                  <span className="text-[10px] font-bold bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded">FIX 30 min</span>
                </div>
                
                {hasLunchBreak && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1.5">Začátek oběda</label>
                    <input
                      type="time"
                      value={lunchStartTime}
                      onChange={(e) => setLunchStartTime(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium"
                    />
                  </div>
                )}
              </div>

              <JobInput jobs={jobs} setJobs={setJobs} />
            </div>
          </div>

          <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100 flex gap-4">
             <div className="shrink-0 text-indigo-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
             </div>
             <p className="text-sm text-indigo-900 leading-snug">
              Aplikace nyní automaticky <strong>zaokrouhluje délku zakázek na celé minuty</strong>. Pokud výpočet nevychází přesně, koncový čas směny bude automaticky posunut.
             </p>
          </div>
        </aside>

        <section className="lg:col-span-7">
          <ResultsView result={result} />
        </section>
      </main>

      <footer className="mt-20 border-t border-slate-200 pt-8 pb-12 text-center text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Časový rozdělovač. Efektivní nástroj pro Vaši dílnu.</p>
      </footer>
    </div>
  );
};

export default App;
