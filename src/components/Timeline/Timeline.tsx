import type { CareerStop } from '../../api/types';
import { TimelineStop } from './TimelineStop';

interface TimelineProps {
  careerPath: CareerStop[];
}

export function Timeline({ careerPath }: TimelineProps) {
  if (careerPath.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-400">
        No career data available
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto py-4 px-2">
      <div className="flex items-center justify-center min-w-max px-4">
        {careerPath.map((stop, i) => (
          <TimelineStop
            key={`${stop.teamName}-${i}`}
            stop={stop}
            isLast={i === careerPath.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

export function TimelineSkeleton() {
  return (
    <div className="w-full py-4 px-2">
      <div className="flex items-center justify-center gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-1 min-w-[100px]">
              <div className="w-16 h-16 rounded-full bg-gray-700 animate-pulse" />
              <div className="w-20 h-3 bg-gray-700 rounded animate-pulse" />
              <div className="w-14 h-2 bg-gray-700 rounded animate-pulse" />
            </div>
            {i < 2 && <div className="w-12 h-0.5 bg-gray-700 mx-2 animate-pulse" />}
          </div>
        ))}
      </div>
    </div>
  );
}
