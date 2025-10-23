// Navigation controls component for WebDesignQuote
import React from 'react'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, Save, RotateCcw, Zap } from 'lucide-react'
import { NavigationControlsProps } from './types'
import { calculateProgress, isStepComplete } from './utils'

const TOTAL_STEPS = 8

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  currentStep,
  answers,
  onPrevStep,
  onNextStep,
  onSave,
  onReset,
  quickMode,
  onToggleQuickMode,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  isComplete,
}) => {
  const progress = calculateProgress(currentStep, TOTAL_STEPS)
  const stepComplete = isStepComplete(currentStep, answers)
  const canGoNext = stepComplete || currentStep >= TOTAL_STEPS
  const canGoPrev = currentStep > 0
  
  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span>{progress}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      {/* Quick Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleQuickMode}
            className={quickMode ? 'bg-yellow-50 border-yellow-200' : ''}
          >
            <Zap className="h-4 w-4 mr-1" />
            {quickMode ? 'Quick Mode On' : 'Quick Mode Off'}
          </Button>
          
          {/* Undo/Redo Controls */}
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
            >
              <RotateCcw className="h-4 w-4 scale-x-[-1]" />
            </Button>
          </div>
        </div>
        
        {/* Save and Reset */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            title="Save Progress"
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            title="Reset All"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>
      
      {/* Step Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={onPrevStep}
          disabled={!canGoPrev}
          className="flex items-center space-x-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </Button>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            Step {currentStep + 1} of {TOTAL_STEPS}
          </span>
          {!stepComplete && currentStep < TOTAL_STEPS && (
            <span className="text-xs text-orange-600">
              (Please complete this step)
            </span>
          )}
        </div>
        
        <Button
          onClick={onNextStep}
          disabled={!canGoNext && !isComplete}
          className="flex items-center space-x-2"
        >
          <span>{currentStep >= TOTAL_STEPS - 1 ? 'Finish' : 'Next'}</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Step Indicators */}
      <div className="flex justify-center space-x-2">
        {Array.from({ length: TOTAL_STEPS }, (_, index) => {
          const stepCompleted = index < currentStep || (index === currentStep && stepComplete)
          const isCurrentStep = index === currentStep
          
          return (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                stepCompleted
                  ? 'bg-green-500'
                  : isCurrentStep
                  ? 'bg-blue-500'
                  : 'bg-gray-300'
              }`}
              title={`Step ${index + 1}`}
            />
          )
        })}
      </div>
      
      {/* Quick Mode Info */}
      {quickMode && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              Quick Mode Active
            </span>
          </div>
          <p className="text-xs text-yellow-700 mt-1">
            You can skip optional questions and move faster through the form.
          </p>
        </div>
      )}
      
      {/* Keyboard Shortcuts Info */}
      <div className="text-xs text-gray-500 text-center space-y-1">
        <div>Keyboard shortcuts: ← → (navigate), Ctrl+S (save), Ctrl+Z (undo), Ctrl+Y (redo)</div>
        <div>Press 'Q' to toggle quick mode</div>
      </div>
    </div>
  )
}