import { useState, useEffect, useRef, useCallback } from 'react'
import { Timer, Play, Pause, RotateCcw, Settings, Check } from 'lucide-react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'

type TimerMode = 'work' | 'break'

export default function PomodoroPage() {
  const [minutes, setMinutes] = useState(25)
  const [breakMinutes, setBreakMinutes] = useState(5)
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState<TimerMode>('work')
  const [sessionCount, setSessionCount] = useState(() => {
    const saved = localStorage.getItem('pomodoro-sessions')
    return saved ? parseInt(saved) : 0
  })
  const [showSettings, setShowSettings] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Create audio element for notification
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTQIG2m98OScTgwOUKzk8rllHAY4k9Xyy3ktBSh+zPDck0IEFFm05OqrWxUJQJzg8LxsIAUngM/2yYo0CBtqpvDsnE4ODlKp5PK5ZRwGOJPV8st5KwUof8vw3JNCBBRZuOTqq1sVCUI')
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {
        // Audio play failed (likely browser autoplay policy)
        toast('Timer complete!', { icon: <Check className="w-4 h-4" /> })
      })
    }
  }, [])

  // Handle timer complete
  const handleTimerComplete = useCallback(() => {
    setIsActive(false)
    playNotificationSound()

    if (mode === 'work') {
      const newCount = sessionCount + 1
      setSessionCount(newCount)
      localStorage.setItem('pomodoro-sessions', newCount.toString())
      toast.success(`🎉 Work session complete! Take a break.`)
      setMode('break')
      setSecondsLeft(breakMinutes * 60)
    } else {
      toast.success('⏰ Break over! Ready to focus?')
      setMode('work')
      setSecondsLeft(minutes * 60)
    }
  }, [mode, sessionCount, breakMinutes, minutes, playNotificationSound])

  // Timer countdown
  useEffect(() => {
    if (isActive && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => prev - 1)
      }, 1000)
    } else if (secondsLeft === 0 && isActive) {
      // Timer complete - use setTimeout to avoid cascading renders
      setTimeout(() => handleTimerComplete(), 0)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, secondsLeft, handleTimerComplete])

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    setMode('work')
    setSecondsLeft(minutes * 60)
  }

  const updateSettings = () => {
    setIsActive(false)
    setMode('work')
    setSecondsLeft(minutes * 60)
    setShowSettings(false)
  }

  // Format time as MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Calculate progress percentage
  const progress = mode === 'work'
    ? ((minutes * 60 - secondsLeft) / (minutes * 60)) * 100
    : ((breakMinutes * 60 - secondsLeft) / (breakMinutes * 60)) * 100

  // Update document title
  useEffect(() => {
    const timeStr = formatTime(secondsLeft)
    document.title = isActive ? `${timeStr} - Pomodoro` : 'Pomodoro - OmniToys'
    return () => {
      document.title = 'OmniToys'
    }
  }, [secondsLeft, isActive])

  return (
    <ToolLayout
      title="Pomodoro Timer"
      description="Productivity timer with 25/5 work/break intervals"
      icon={<Timer className="w-5 h-5" />}
    >
      <div className="space-y-8">
        {/* Timer Display */}
        <div className="flex flex-col items-center">
          {/* Mode Badge */}
          <div className="mb-4">
            <span
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-semibold",
                mode === 'work'
                  ? "bg-omni-primary text-white"
                  : "bg-green-500 text-white"
              )}
            >
              {mode === 'work' ? '🎯 Focus Time' : '☕ Break Time'}
            </span>
          </div>

          {/* Circular Progress */}
          <div className="relative">
            <svg className="w-64 h-64 transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-omni-text/10"
              />
              {/* Progress circle */}
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 120}`}
                strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                strokeLinecap="round"
                className={cn(
                  "transition-all duration-300",
                  mode === 'work' ? "text-omni-primary" : "text-green-500"
                )}
              />
            </svg>

            {/* Time in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl font-bold text-omni-text font-mono">
                  {formatTime(secondsLeft)}
                </div>
                <div className="text-sm text-omni-text/60 mt-1">
                  {mode === 'work' ? `${minutes}min focus` : `${breakMinutes}min break`}
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={toggleTimer}
              className={cn(
                "flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all",
                isActive
                  ? "bg-omni-text/10 text-omni-text hover:bg-omni-text/20"
                  : mode === 'work'
                  ? "bg-omni-primary text-white hover:bg-omni-primary/90"
                  : "bg-green-500 text-white hover:bg-green-600"
              )}
            >
              {isActive ? (
                <>
                  <Pause className="w-5 h-5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Start
                </>
              )}
            </button>

            <button
              onClick={resetTimer}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-omni-text/10 text-omni-text hover:bg-omni-text/20 transition-all font-semibold"
            >
              <RotateCcw className="w-5 h-5" />
              Reset
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-omni-text/10 text-omni-text hover:bg-omni-text/20 transition-all"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="p-6 bg-omni-text/5 rounded-xl">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Timer Settings
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-omni-text/80 mb-2">
                  Work Duration (minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={minutes}
                  onChange={(e) => setMinutes(Math.min(120, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-full px-4 py-2 rounded-lg bg-omni-bg border border-omni-text/20 text-omni-text focus:outline-none focus:ring-2 focus:ring-omni-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-omni-text/80 mb-2">
                  Break Duration (minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={breakMinutes}
                  onChange={(e) => setBreakMinutes(Math.min(60, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-full px-4 py-2 rounded-lg bg-omni-bg border border-omni-text/20 text-omni-text focus:outline-none focus:ring-2 focus:ring-omni-primary/50"
                />
              </div>
            </div>
            <button
              onClick={updateSettings}
              className="mt-4 w-full py-2 rounded-lg bg-omni-primary text-white hover:bg-omni-primary/90 transition-colors font-medium"
            >
              Apply Settings
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-omni-text/5 rounded-xl">
            <p className="text-3xl font-bold text-omni-primary">{sessionCount}</p>
            <p className="text-sm text-omni-text/60 mt-1">Sessions Today</p>
          </div>
          <div className="text-center p-4 bg-omni-text/5 rounded-xl">
            <p className="text-3xl font-bold text-omni-primary">{sessionCount * 25}</p>
            <p className="text-sm text-omni-text/60 mt-1">Minutes Focused</p>
          </div>
          <div className="text-center p-4 bg-omni-text/5 rounded-xl">
            <p className="text-3xl font-bold text-omni-primary">{Math.floor(sessionCount / 4)}</p>
            <p className="text-sm text-omni-text/60 mt-1">Pomodoro Cycles</p>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 bg-omni-text/5 rounded-xl">
          <h3 className="text-sm font-semibold mb-2">About Pomodoro Technique</h3>
          <p className="text-xs text-omni-text/70 leading-relaxed">
            The Pomodoro Technique uses a timer to break work into intervals, traditionally 25 minutes
            in length, separated by short breaks. Each interval is known as a pomodoro, from the
            Italian word for tomato. After four pomodoros, take a longer break of 15-30 minutes.
          </p>
        </div>
      </div>
    </ToolLayout>
  )
}
