import { useState, useRef, useEffect } from 'react';

const COMPONENTS_ORDER_KEY = 'dashboardComponentsOrder';

const DEFAULT_ORDER = [
  'subjectTimeline',
  'weeklyView',
  'weeklyProgressChart',
  'daySchedule',
  'monthlyProgressChart',
  'monthlyBarChart',
  'focusSessionReport',
];

const COMPONENT_LABELS = {
  subjectTimeline: { label: 'Subject Timeline', emoji: '📚' },
  weeklyView: { label: 'Weekly Overview', emoji: '📅' },
  weeklyProgressChart: { label: 'Weekly Progress Chart', emoji: '📈' },
  daySchedule: { label: 'Day Schedule', emoji: '🗓️' },
  monthlyProgressChart: { label: 'Monthly Progress Chart', emoji: '📊' },
  monthlyBarChart: { label: 'Monthly Bar Chart', emoji: '📉' },
  focusSessionReport: { label: 'Focus Session Report', emoji: '⚡' },
};

export default function DraggableDashboard({ components }) {
  const [order, setOrder] = useState(() => {
    try {
      const saved = localStorage.getItem(COMPONENTS_ORDER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge saved order with any new components
        const newComponents = DEFAULT_ORDER.filter(k => !parsed.includes(k));
        return [...parsed.filter(k => DEFAULT_ORDER.includes(k)), ...newComponents];
      }
    } catch {}
    return DEFAULT_ORDER;
  });

  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [showReorder, setShowReorder] = useState(false);
  const dragNodeRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(COMPONENTS_ORDER_KEY, JSON.stringify(order));
    } catch {}
  }, [order]);

  const handleDragStart = (e, key) => {
    setDragging(key);
    dragNodeRef.current = key;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, key) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (key !== dragging) setDragOver(key);
  };

  const handleDrop = (e, dropKey) => {
    e.preventDefault();
    if (!dragging || dragging === dropKey) return;

    setOrder(prev => {
      const newOrder = [...prev];
      const dragIndex = newOrder.indexOf(dragging);
      const dropIndex = newOrder.indexOf(dropKey);
      newOrder.splice(dragIndex, 1);
      newOrder.splice(dropIndex, 0, dragging);
      return newOrder;
    });

    setDragging(null);
    setDragOver(null);
  };

  const handleDragEnd = () => {
    setDragging(null);
    setDragOver(null);
  };

  const moveUp = (key) => {
    setOrder(prev => {
      const idx = prev.indexOf(key);
      if (idx === 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };

  const moveDown = (key) => {
    setOrder(prev => {
      const idx = prev.indexOf(key);
      if (idx === prev.length - 1) return prev;
      const next = [...prev];
      [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
      return next;
    });
  };

  const resetOrder = () => {
    setOrder(DEFAULT_ORDER);
    localStorage.removeItem(COMPONENTS_ORDER_KEY);
  };

  return (
    <div className="space-y-6">
      {/* Reorder Toggle Bar */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={() => setShowReorder(!showReorder)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
            showReorder
              ? 'bg-lime-400/10 border-lime-400/30 text-lime-400'
              : 'bg-gray-900 border-gray-800 text-gray-500 hover:text-white hover:border-gray-700'
          }`}
        >
          <span>{showReorder ? '✓' : '⠿'}</span>
          {showReorder ? 'Done Reordering' : 'Reorder Dashboard'}
        </button>

        {showReorder && (
          <button
            onClick={resetOrder}
            className="text-[10px] text-gray-600 hover:text-gray-400 border border-gray-800 px-2 py-1 rounded-lg transition"
          >
            ↺ Reset Order
          </button>
        )}
      </div>

      {/* Reorder Panel */}
      {showReorder && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3">
            Drag to reorder — or use arrows
          </p>
          <div className="space-y-1.5">
            {order.map((key, index) => {
              const meta = COMPONENT_LABELS[key];
              return (
                <div
                  key={key}
                  draggable
                  onDragStart={e => handleDragStart(e, key)}
                  onDragOver={e => handleDragOver(e, key)}
                  onDrop={e => handleDrop(e, key)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-grab active:cursor-grabbing transition-all ${
                    dragging === key
                      ? 'opacity-40 scale-95 border-lime-400/30 bg-lime-400/5'
                      : dragOver === key
                      ? 'border-indigo-500/50 bg-indigo-500/5 scale-[1.01]'
                      : 'border-gray-800 bg-gray-800/40 hover:border-gray-700'
                  }`}
                >
                  {/* Drag handle */}
                  <div className="flex flex-col gap-0.5 flex-shrink-0">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex gap-0.5">
                        <div className="w-1 h-1 rounded-full bg-gray-600" />
                        <div className="w-1 h-1 rounded-full bg-gray-600" />
                      </div>
                    ))}
                  </div>

                  {/* Index */}
                  <span className="text-[10px] font-mono text-gray-600 w-4">{index + 1}</span>

                  {/* Label */}
                  <span className="text-sm flex-shrink-0">{meta.emoji}</span>
                  <span className="flex-1 text-xs text-gray-300 font-medium">{meta.label}</span>

                  {/* Arrow controls */}
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => moveUp(key)}
                      disabled={index === 0}
                      className="w-6 h-6 rounded-lg bg-gray-900 border border-gray-700 text-gray-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center text-xs transition"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveDown(key)}
                      disabled={index === order.length - 1}
                      className="w-6 h-6 rounded-lg bg-gray-900 border border-gray-700 text-gray-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center text-xs transition"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rendered Components in Order */}
      {order.map(key => {
        const component = components[key];
        if (!component) return null;

        return (
          <div
            key={key}
            onDragOver={e => showReorder && handleDragOver(e, key)}
            onDrop={e => showReorder && handleDrop(e, key)}
            className={`transition-all duration-200 ${
              dragging && dragging !== key && showReorder ? 'opacity-70' : ''
            }`}
          >
            {component}
          </div>
        );
      })}
    </div>
  );
}