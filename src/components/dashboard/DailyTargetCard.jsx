import React, { useEffect, useMemo, useState } from 'react';
import { Target, Edit2, Check, X, Trophy, PartyPopper } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { Card } from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import { formatINR } from '../../utils/calculations';
import { isToday } from '../../utils/dates';

const todayKey = () => new Date().toDateString();

const Confetti = () => {
  const pieces = useMemo(
    () =>
      Array.from({ length: 60 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 2 + Math.random() * 2,
        color: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7'][i % 6],
        rotate: Math.random() * 360,
      })),
    []
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            top: '-20px',
            left: `${p.left}%`,
            width: '10px',
            height: '14px',
            background: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animation: `confetti-fall ${p.duration}s ${p.delay}s linear forwards`,
            borderRadius: '2px',
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

const DailyTargetCard = ({ todaySales, todayInvoicesCount }) => {
  const { settings, dispatch, success } = useAppContext();
  const target = Number(settings.dailyTarget) || 0;
  const targetSetToday =
    settings.dailyTargetSetDate && isToday(settings.dailyTargetSetDate);
  const activeTarget = targetSetToday ? target : 0;

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(target ? String(target) : '');
  const [showCelebration, setShowCelebration] = useState(false);

  const percent = activeTarget > 0 ? Math.min(100, (todaySales / activeTarget) * 100) : 0;
  const remaining = Math.max(0, activeTarget - todaySales);
  const achieved = activeTarget > 0 && todaySales >= activeTarget;

  // Auto-show celebration once per day when target is hit
  useEffect(() => {
    if (!achieved) return;
    if (settings.lastCelebratedDate === todayKey()) return;
    setShowCelebration(true);
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { lastCelebratedDate: todayKey() },
    });
  }, [achieved, settings.lastCelebratedDate, dispatch]);

  const saveTarget = () => {
    const value = Math.max(0, Math.round(Number(draft) || 0));
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: {
        dailyTarget: value,
        dailyTargetSetDate: new Date().toISOString(),
        lastCelebratedDate: null,
      },
    });
    setIsEditing(false);
    if (value > 0) success(`Today's target set: ${formatINR(value)}`);
  };

  const startEdit = () => {
    setDraft(activeTarget ? String(activeTarget) : '');
    setIsEditing(true);
  };

  // ---- Render: no target set ----
  if (activeTarget === 0 && !isEditing) {
    return (
      <Card className="bg-gradient-to-br from-brand-50 via-white to-indigo-50 border-brand-200">
        <div className="px-4 sm:px-5 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
              <Target size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Set today's target</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Set a daily sales goal and we'll celebrate when you hit it.
              </p>
            </div>
          </div>
          <Button icon={<Target size={16} />} onClick={startEdit}>
            Set Target
          </Button>
        </div>
      </Card>
    );
  }

  // ---- Render: editing ----
  if (isEditing) {
    return (
      <Card className="bg-gradient-to-br from-brand-50 via-white to-indigo-50 border-brand-200">
        <div className="px-4 sm:px-5 py-4 sm:py-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
              <Target size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Today's target</p>
              <p className="text-xs text-slate-500">Enter your sales goal in rupees</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="number"
              inputMode="numeric"
              placeholder="e.g. 60000"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && saveTarget()}
              className="flex-1"
            />
            <div className="flex gap-2">
              <Button icon={<Check size={16} />} onClick={saveTarget}>
                Save
              </Button>
              <Button
                variant="outline"
                icon={<X size={16} />}
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // ---- Render: target active (progress) ----
  return (
    <>
      <Card
        className={
          achieved
            ? 'bg-gradient-to-br from-success-50 via-white to-emerald-50 border-success-200'
            : 'bg-gradient-to-br from-brand-50 via-white to-indigo-50 border-brand-200'
        }
      >
        <div className="px-4 sm:px-5 py-4 sm:py-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  achieved
                    ? 'bg-success-100 text-success-700'
                    : 'bg-brand-100 text-brand-700'
                }`}
              >
                {achieved ? <Trophy size={20} /> : <Target size={20} />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  Today's Target {achieved && '🎉'}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {achieved
                    ? `Target smashed! ${todayInvoicesCount} ${
                        todayInvoicesCount === 1 ? 'bill' : 'bills'
                      } today.`
                    : `${formatINR(remaining)} to go`}
                </p>
              </div>
            </div>
            <button
              onClick={startEdit}
              className="shrink-0 p-1.5 rounded-md text-slate-400 hover:text-brand-600 hover:bg-white transition-colors"
              aria-label="Edit target"
              title="Edit target"
            >
              <Edit2 size={14} />
            </button>
          </div>

          {/* Numbers */}
          <div className="flex items-baseline justify-between mb-2">
            <p
              className={`text-2xl sm:text-3xl font-bold num-display ${
                achieved ? 'text-success-700' : 'text-brand-700'
              }`}
            >
              {formatINR(todaySales)}
            </p>
            <p className="text-sm text-slate-500 num-display">
              / {formatINR(activeTarget)}
            </p>
          </div>

          {/* Progress bar */}
          <div className="relative h-3 w-full rounded-full bg-white/70 overflow-hidden ring-1 ring-slate-200">
            <div
              className={`h-full transition-all duration-700 ease-out rounded-full ${
                achieved
                  ? 'bg-gradient-to-r from-success-500 to-emerald-500'
                  : 'bg-gradient-to-r from-brand-500 to-indigo-500'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <p className="text-xs text-slate-500">
              {percent.toFixed(0)}% achieved
            </p>
            {achieved && (
              <button
                onClick={() => setShowCelebration(true)}
                className="text-xs font-medium text-success-700 hover:text-success-800"
              >
                Celebrate again 🎉
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Celebration modal */}
      {showCelebration && <Confetti />}
      <Modal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        size="sm"
      >
        <div className="text-center py-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-4 shadow-lg animate-bounce">
            <Trophy size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1 flex items-center justify-center gap-2">
            Mubarak Ho! <PartyPopper size={24} className="text-amber-500" />
          </h2>
          <p className="text-base text-slate-700 mb-1">
            You hit today's target of <strong>{formatINR(activeTarget)}</strong>
          </p>
          <p className="text-sm text-slate-500 mb-5">
            Total sales so far: <strong className="text-success-700">{formatINR(todaySales)}</strong>
          </p>
          <div className="bg-success-50 border border-success-200 rounded-lg p-3 mb-5">
            <p className="text-xs text-success-800 font-medium">
              Keep going — every extra bill is pure bonus profit!
            </p>
          </div>
          <Button fullWidth onClick={() => setShowCelebration(false)}>
            Thanks!
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default DailyTargetCard;
