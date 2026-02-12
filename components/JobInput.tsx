
import React, { useState } from 'react';
import { Job } from '../types';

interface JobInputProps {
  jobs: Job[];
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
}

const COLORS = [
  { id: 'indigo', class: 'bg-indigo-500' },
  { id: 'emerald', class: 'bg-emerald-500' },
  { id: 'rose', class: 'bg-rose-500' },
  { id: 'sky', class: 'bg-sky-500' },
  { id: 'violet', class: 'bg-violet-500' },
  { id: 'orange', class: 'bg-orange-500' },
];

const JobInput: React.FC<JobInputProps> = ({ jobs, setJobs }) => {
  const [activePicker, setActivePicker] = useState<string | null>(null);

  const addJob = () => {
    if (jobs.length < 6) {
      const unusedColor = COLORS.find(c => !jobs.some(j => j.color === c.id)) || COLORS[0];
      setJobs([...jobs, { id: crypto.randomUUID(), name: '', color: unusedColor.id }]);
    }
  };

  const removeJob = (id: string) => {
    if (jobs.length > 1) {
      setJobs(jobs.filter(j => j.id !== id));
    }
  };

  const updateJobName = (id: string, name: string) => {
    setJobs(jobs.map(j => j.id === id ? { ...j, name } : j));
  };

  const updateJobColor = (id: string, color: string) => {
    setJobs(jobs.map(j => j.id === id ? { ...j, color } : j));
    setActivePicker(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Seznam zakázek</h3>
        <span className="text-xs text-slate-400">{jobs.length} / 6</span>
      </div>
      
      <div className="space-y-2">
        {jobs.map((job, index) => (
          <div key={job.id} className="flex gap-2 group relative">
            <div className="relative">
              <button
                onClick={() => setActivePicker(activePicker === job.id ? null : job.id)}
                className={`h-10 w-10 flex items-center justify-center rounded-full border-2 border-white shadow-sm ring-1 ring-slate-200 transition-transform hover:scale-110 ${COLORS.find(c => c.id === job.color)?.class}`}
                title="Změnit barvu"
              />

              {activePicker === job.id && (
                <div className="absolute top-12 left-0 z-20 bg-white border border-slate-200 shadow-xl rounded-xl p-2 grid grid-cols-3 gap-2 animate-in fade-in zoom-in-95 duration-150">
                  {COLORS.map(color => (
                    <button
                      key={color.id}
                      onClick={() => updateJobColor(job.id, color.id)}
                      className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${color.class} ${job.color === color.id ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1">
              <input
                type="text"
                value={job.name}
                onChange={(e) => updateJobName(job.id, e.target.value)}
                placeholder={`Zakázka ${index + 1} (např. 225-037)`}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            {jobs.length > 1 && (
              <button
                onClick={() => removeJob(job.id)}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Odebrat zakázku"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {jobs.length < 6 && (
        <button
          onClick={addJob}
          className="w-full mt-2 py-2 border-2 border-dashed border-slate-200 text-slate-500 rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition-all text-sm font-medium"
        >
          + Přidat další zakázku
        </button>
      )}
    </div>
  );
};

export default JobInput;
