import React from 'react';
import { Truck, Check, Package, Clock, AlertTriangle, ShieldCheck, CornerDownLeft, XCircle } from 'lucide-react';

const STATUS_ICONS = {
  PENDING: Package,
  CONFIRMED: ShieldCheck,
  PROCESSING: Clock,
  SHIPPED: Truck,
  DELIVERED: Check,
  CANCELLED: XCircle,
  RETURN_REQUESTED: CornerDownLeft,
  RETURNED: AlertTriangle
};

const STATUS_COLORS = {
  PENDING: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30',
  CONFIRMED: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30',
  PROCESSING: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/30',
  SHIPPED: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/30',
  DELIVERED: 'text-green-500 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30',
  CANCELLED: 'text-red-500 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30',
  RETURN_REQUESTED: 'text-slate-500 bg-slate-50 dark:bg-dark-800 border-slate-200 dark:border-slate-700',
  RETURNED: 'text-orange-500 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/30'
};

const ORDERED_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED'
];

export default function OrderTrackingTimeline({ events = [] }) {
  if (events.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 italic text-xs">
        No tracking events logged yet.
      </div>
    );
  }

  // Find the index of the latest tracking event status in our ordered path
  const latestEvent = events[events.length - 1];
  const isCancelled = events.some(e => e.status === 'CANCELLED');
  const isReturned = events.some(e => e.status === 'RETURNED' || e.status === 'RETURN_REQUESTED');

  return (
    <div className="space-y-6">
      {/* Visual Progress Header Line */}
      {!isCancelled && !isReturned && (
        <div className="flex items-center justify-between px-4 pb-6 border-b dark:border-slate-800">
          {ORDERED_STATUSES.map((status, idx) => {
            const hasPassed = events.some(e => e.status === status);
            const isCurrent = latestEvent.status === status;
            
            return (
              <React.Fragment key={status}>
                {idx > 0 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-colors duration-500 ${
                    hasPassed ? 'bg-brand-600' : 'bg-slate-200 dark:bg-dark-800'
                  }`} />
                )}
                <div className="flex flex-col items-center space-y-1">
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                    isCurrent 
                      ? 'bg-brand-600 text-white border-brand-600 ring-4 ring-brand-100 dark:ring-brand-950/50 scale-110' 
                      : hasPassed 
                      ? 'bg-brand-50 dark:bg-brand-950/20 text-brand-600 border-brand-200 dark:border-brand-900' 
                      : 'bg-slate-50 dark:bg-dark-900 text-slate-400 border-slate-200 dark:border-slate-800'
                  }`}>
                    {React.createElement(STATUS_ICONS[status] || Package, { className: 'w-4 h-4' })}
                  </div>
                  <span className={`text-[9px] font-bold tracking-tight uppercase hidden md:inline ${
                    isCurrent ? 'text-brand-600 font-extrabold' : 'text-slate-500'
                  }`}>
                    {status.toLowerCase()}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Vertical Timeline List */}
      <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-dark-800">
        {events.map((event, idx) => {
          const isLatest = idx === events.length - 1;
          const Icon = STATUS_ICONS[event.status] || Package;
          const badgeClass = STATUS_COLORS[event.status] || 'text-slate-500 bg-slate-50 border-slate-200';

          return (
            <div key={event.id} className="relative space-y-2 animate-fade-in">
              {/* Dot Icon marker on left line */}
              <div className={`absolute -left-6 top-1 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-all ${
                isLatest
                  ? 'bg-brand-600 border-brand-600 ring-4 ring-brand-100 dark:ring-brand-950/50 scale-115 text-white'
                  : 'bg-white dark:bg-dark-900 border-slate-300 dark:border-slate-700 text-slate-500'
              }`}>
                {isLatest ? (
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                ) : (
                  <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-600 rounded-full"></div>
                )}
              </div>

              {/* Box Details Card */}
              <div className={`p-4 border rounded-2xl bg-white dark:bg-dark-900 shadow-sm flex flex-col md:flex-row md:justify-between md:items-start gap-3 transition-all ${
                isLatest ? 'border-brand-500 dark:border-brand-700 ring-1 ring-brand-500/10' : 'border-slate-200 dark:border-slate-800'
              }`}>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${badgeClass}`}>
                      {event.status}
                    </span>
                    {event.location && (
                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-dark-800 px-2 py-0.5 rounded-full">
                        📍 {event.location}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    {event.note || 'No update description provided.'}
                  </p>
                  {event.updatedByName && (
                    <span className="text-[10px] text-slate-400 block pt-0.5">
                      Logged by {event.updatedByName}
                    </span>
                  )}
                </div>

                <div className="text-left md:text-right shrink-0">
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">
                    {new Date(event.timestamp).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="text-[9px] text-slate-400 block">
                    {new Date(event.timestamp).toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
