import type { CareerStop } from '../../api/types';

interface TimelineStopProps {
  stop: CareerStop;
  isLast: boolean;
}

export function TimelineStop({ stop, isLast }: TimelineStopProps) {
  return (
    <div className="flex items-center shrink-0">
      <div className="flex flex-col items-center gap-1 min-w-[100px]">
        <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-gray-600">
          {stop.logoUrl ? (
            <img
              src={stop.logoUrl}
              alt={stop.teamName}
              className="w-12 h-12 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <span className="text-xs text-gray-400 text-center px-1">
              {(stop.teamName || '???').slice(0, 3)}
            </span>
          )}
        </div>
        <span className="text-xs font-medium text-gray-200 text-center max-w-[120px] truncate">
          {stop.teamName}
        </span>
        {stop.seasons && (
          <span className="text-[10px] text-gray-400">{stop.seasons}</span>
        )}
        <span
          className={`text-[10px] font-semibold uppercase tracking-wider ${
            stop.type === 'college' ? 'text-blue-400' : 'text-green-400'
          }`}
        >
          {stop.type === 'college' ? 'College' : 'NFL'}
        </span>
      </div>

      {!isLast && (
        <div className="flex items-center mx-2">
          <div className="w-8 h-0.5 bg-gray-500" />
          <div className="w-0 h-0 border-t-4 border-b-4 border-l-6 border-t-transparent border-b-transparent border-l-gray-500" />
        </div>
      )}
    </div>
  );
}
