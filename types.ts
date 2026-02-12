
export interface Job {
  id: string;
  name: string;
  color: string;
}

export type IntervalType = 'job' | 'break';

export interface CalculatedInterval {
  type: IntervalType;
  jobId?: string;
  jobName: string;
  color?: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

export interface CalculationResult {
  totalDurationMinutes: number;
  workingDurationMinutes: number;
  intervalMinutes: number;
  intervals: CalculatedInterval[];
  calculatedEndTime: string;
  originalEndTime: string;
}
