"use client"

import React, { useState, useEffect, useRef } from "react"
import { Clock, Coffee, Utensils, X, Maximize2, Minimize2, Move } from "lucide-react"
import { motion, useDragControls, AnimatePresence } from "framer-motion"

interface FocusModeProps {
  isOpen: boolean
  onClose: () => void
}

type ModeType = "focus" | "break" | "lunch"

interface ModeOption {
  type: ModeType
  label: string
  icon: React.ReactNode
  defaultDuration: number // in minutes
  color: string
}

const FocusMode: React.FC<FocusModeProps> = ({ isOpen, onClose }) => {
  const [selectedMode, setSelectedMode] = useState<ModeType | null>(null)
  const [duration, setDuration] = useState<number>(25) // default 25 minutes
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [isActive, setIsActive] = useState<boolean>(false)
  const [isMinimized, setIsMinimized] = useState<boolean>(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const dragControls = useDragControls()

  const modeOptions: ModeOption[] = [
    {
      type: "focus",
      label: "Focus Mode",
      icon: <Clock size={24} />,
      defaultDuration: 25,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      type: "break",
      label: "Break",
      icon: <Coffee size={24} />,
      defaultDuration: 5,
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      type: "lunch",
      label: "Lunch",
      icon: <Utensils size={24} />,
      defaultDuration: 30,
      color: "bg-amber-500 hover:bg-amber-600",
    },
  ]

  // Reset state when modal is opened
  useEffect(() => {
    if (isOpen) {
      setSelectedMode(null)
      setIsActive(false)
      setTimeRemaining(0)
      setIsMinimized(false)
    }
  }, [isOpen])

  // Handle timer
  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout)
            setIsActive(false)
            // Play sound notification with proper error handling
            const playNotificationSound = async () => {
              try {
                const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3")
                audio.volume = 0.5 // Set reasonable volume
                await audio.play()
              } catch (error) {
                console.warn("Audio notification failed:", error)
                // Fallback: Show visual notification if audio fails
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification('Focus Timer Complete!', {
                    body: 'Your focus session has ended.',
                    icon: '/favicon.ico'
                  })
                } else {
                  // Final fallback: Browser alert
                  alert('Focus Timer Complete! Your session has ended.')
                }
              }
            }
            playNotificationSound()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isActive, timeRemaining])

  const selectMode = (mode: ModeType) => {
    const selectedOption = modeOptions.find((option) => option.type === mode)
    if (selectedOption) {
      setSelectedMode(mode)
      setDuration(selectedOption.defaultDuration)
      setTimeRemaining(selectedOption.defaultDuration * 60) // Convert to seconds
    }
  }

  const startTimer = () => {
    setIsActive(true)
  }

  const pauseTimer = () => {
    setIsActive(false)
  }

  const resetTimer = () => {
    setIsActive(false)
    if (selectedMode) {
      const selectedOption = modeOptions.find((option) => option.type === selectedMode)
      if (selectedOption) {
        setTimeRemaining(selectedOption.defaultDuration * 60)
      }
    }
  }

  const handleClose = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    onClose()
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getProgressPercentage = (): number => {
    if (!selectedMode) return 0
    const selectedOption = modeOptions.find((option) => option.type === selectedMode)
    if (!selectedOption) return 0

    const totalSeconds = selectedOption.defaultDuration * 60
    return ((totalSeconds - timeRemaining) / totalSeconds) * 100
  }

  const getModeColor = (): string => {
    if (!selectedMode) return "bg-gray-200"
    const selectedOption = modeOptions.find((option) => option.type === selectedMode)
    return selectedOption ? selectedOption.color.replace("hover:", "") : "bg-gray-200"
  }

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = Number.parseInt(e.target.value, 10)
    setDuration(newDuration)
    setTimeRemaining(newDuration * 60)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: 1,
            scale: 1,
            x: position.x,
            y: position.y,
          }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className={`fixed z-50 ${
            isMinimized ? "w-auto h-auto" : "w-80"
          } bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200`}
          drag
          dragControls={dragControls}
          dragMomentum={false}
          onDragEnd={(event, info) => {
            setPosition({
              x: position.x + info.offset.x,
              y: position.y + info.offset.y,
            })
          }}
        >
          {/* Header */}
          <div
            className="bg-gray-100 p-3 flex justify-between items-center cursor-move"
            onPointerDown={(e) => dragControls.start(e)}
          >
            <div className="flex items-center gap-2">
              <Move size={16} className="text-gray-500" />
              <h3 className="font-medium text-sm">
                {selectedMode ? modeOptions.find((m) => m.type === selectedMode)?.label : "Productivity Timer"}
              </h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-gray-200 rounded-md transition-colors"
              >
                {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
              </button>
              <button onClick={handleClose} className="p-1 hover:bg-gray-200 rounded-md transition-colors">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Content */}
          {!isMinimized && (
            <div className="p-4">
              {!selectedMode ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">Select a productivity mode:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {modeOptions.map((option) => (
                      <button
                        key={option.type}
                        onClick={() => selectMode(option.type)}
                        className={`${option.color} text-white p-3 rounded-lg flex flex-col items-center justify-center transition-colors`}
                      >
                        {option.icon}
                        <span className="mt-2 text-xs font-medium">{option.label}</span>
                        <span className="text-xs opacity-80">{option.defaultDuration} min</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="relative w-32 h-32">
                      {/* Progress circle */}
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle
                          className="text-gray-200"
                          strokeWidth="8"
                          stroke="currentColor"
                          fill="transparent"
                          r="42"
                          cx="50"
                          cy="50"
                        />
                        <circle
                          className={`${getModeColor().replace("bg-", "text-")}`}
                          strokeWidth="8"
                          strokeDasharray={264}
                          strokeDashoffset={264 - (getProgressPercentage() * 264) / 100}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r="42"
                          cx="50"
                          cy="50"
                        />
                      </svg>
                      <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold">{formatTime(timeRemaining)}</span>
                        <span className="text-xs text-gray-500">{isActive ? "In progress" : "Paused"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Duration slider */}
                  {!isActive && (
                    <div className="space-y-2">
                      <label className="text-xs text-gray-500 flex justify-between">
                        <span>Duration: {duration} minutes</span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="60"
                        value={duration}
                        onChange={handleDurationChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Controls */}
                  <div className="flex justify-center gap-2">
                    {isActive ? (
                      <button
                        onClick={pauseTimer}
                        className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                      >
                        Pause
                      </button>
                    ) : (
                      <button
                        onClick={startTimer}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        {timeRemaining === modeOptions.find((m) => m.type === selectedMode)?.defaultDuration! * 60
                          ? "Start"
                          : "Resume"}
                      </button>
                    )}
                    <button
                      onClick={resetTimer}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Reset
                    </button>
                  </div>

                  {/* Back button */}
                  <div className="text-center">
                    <button onClick={() => setSelectedMode(null)} className="text-xs text-blue-500 hover:text-blue-700">
                      Choose a different mode
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Minimized view */}
          {isMinimized && selectedMode && (
            <div className="p-2 flex items-center gap-2">
              {modeOptions.find((m) => m.type === selectedMode)?.icon}
              <span className="font-bold">{formatTime(timeRemaining)}</span>
              {isActive ? (
                <button onClick={pauseTimer} className="p-1 bg-amber-100 text-amber-600 rounded hover:bg-amber-200">
                  <Coffee size={14} />
                </button>
              ) : (
                <button onClick={startTimer} className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200">
                  <Clock size={14} />
                </button>
              )}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default FocusMode
