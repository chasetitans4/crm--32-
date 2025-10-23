import React, { useState, useEffect, useReducer, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Calculator } from 'lucide-react'
import { useAppContext } from "@/context/AppContext"
import { useRoleAccess } from "@/hooks/useRoleAccess"
import { handleError, handleSuccess } from "@/utils/errorHandler"

// Import extracted modules
import { QuestionnaireState, QuestionnaireAction } from './WebDesignQuote/types'
import { questionnaireReducer, initialState, ACTION_TYPES } from './WebDesignQuote/reducer'
import { requirementSchema, RequirementFormData } from './WebDesignQuote/schema'
import { calculateEstimatedCost, saveSessionToLocalStorage, loadSessionFromLocalStorage } from './WebDesignQuote/utils'
import { QuestionRenderer } from './WebDesignQuote/QuestionRenderer'
import { NavigationControls } from './WebDesignQuote/NavigationControls'

const WebDesignQuote = React.memo(() => {
  const { state: appState, dispatch: appDispatch } = useAppContext()
  const { userRole } = useRoleAccess('user')
  
  // Local state for the questionnaire
  const [questionnaireState, questionnaireDispatch] = useReducer<React.Reducer<QuestionnaireState, QuestionnaireAction>>(questionnaireReducer, initialState)
  const [saveMessage, setSaveMessage] = useState<string>('')  
  const [estimatedCost, setEstimatedCost] = useState<number>(0)
  
  // Form for requirements collection
  const form = useForm<RequirementFormData>({
    resolver: zodResolver(requirementSchema),
    defaultValues: {
      businessGoals: [],
      targetAudience: '',
      additionalRequirements: '',
    },
  })
  
  // Calculate estimated cost based on answers
  useEffect(() => {
    const cost = calculateEstimatedCost(questionnaireState.answers)
    setEstimatedCost(cost)
  }, [questionnaireState.answers])
  
  // Auto-save functionality
  useEffect(() => {
    const autoSave = () => {
      const sessionId = saveSessionToLocalStorage(questionnaireState)
      if (sessionId) {
        setSaveMessage('Progress saved automatically')
        setTimeout(() => setSaveMessage(''), 3000)
      }
    }
    
    const interval = setInterval(autoSave, 30000) // Auto-save every 30 seconds
    return () => clearInterval(interval)
  }, [questionnaireState])
  
  // Load saved session on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const sessionId = urlParams.get('session')
    
    if (sessionId) {
      const savedState = loadSessionFromLocalStorage(sessionId)
      if (savedState) {
        questionnaireDispatch({ type: ACTION_TYPES.LOAD_STATE, payload: savedState })
        handleSuccess('Session restored successfully')
      }
    }
  }, [])
  
  // Event handlers - defined before useEffect that uses them
  const handleAnswer = useCallback((id: string, value: any) => {
    questionnaireDispatch({ type: 'SET_ANSWER', payload: { id, value } })
  }, [])
  
  const handleNextStep = useCallback(() => {
    questionnaireDispatch({ type: 'NEXT_STEP' })
  }, [])
  
  const handlePrevStep = useCallback(() => {
    questionnaireDispatch({ type: 'PREV_STEP' })
  }, [])
  
  const handleSave = useCallback(() => {
    questionnaireDispatch({ type: ACTION_TYPES.SAVE_PROGRESS })
    setSaveMessage('Progress saved successfully!')
    setTimeout(() => setSaveMessage(''), 3000)
  }, [])
  
  const handleReset = useCallback(() => {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      questionnaireDispatch({ type: 'RESET' })
      handleSuccess('Form reset successfully')
    }
  }, [])
  
  const handleUndo = useCallback(() => {
    questionnaireDispatch({ type: 'UNDO' })
  }, [])
  
  const handleRedo = useCallback(() => {
    questionnaireDispatch({ type: 'REDO' })
  }, [])
  
  const handleToggleQuickMode = useCallback(() => {
    questionnaireDispatch({ type: 'SET_QUICK_MODE', payload: !questionnaireState.quickMode })
  }, [questionnaireState.quickMode])
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault()
            handleSave()
            break
          case 'z':
            e.preventDefault()
            if (e.shiftKey) {
              handleRedo()
            } else {
              handleUndo()
            }
            break
          case 'y':
            e.preventDefault()
            handleRedo()
            break
        }
      } else {
        switch (e.key) {
          case 'ArrowLeft':
            if (!e.target || (e.target as HTMLElement).tagName !== 'INPUT') {
              handlePrevStep()
            }
            break
          case 'ArrowRight':
          case 'Enter':
            if (!e.target || (e.target as HTMLElement).tagName !== 'INPUT') {
              handleNextStep()
            }
            break
          case 'q':
          case 'Q':
            if (!e.target || (e.target as HTMLElement).tagName !== 'INPUT') {
              handleToggleQuickMode()
            }
            break
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [questionnaireState.currentStep, handleSave, handleUndo, handleRedo, handlePrevStep, handleNextStep, handleToggleQuickMode])
  
  const handleSaveRequirements = async (data: RequirementFormData) => {
    try {
      // Save requirements logic here
      handleSuccess('Requirements saved successfully!')
    } catch (error) {
      handleError(error instanceof Error ? error : new Error(String(error)), 'Failed to save requirements')
    }
  }
  
  const canUndo = questionnaireState.historyIndex > 0
  const canRedo = questionnaireState.historyIndex < questionnaireState.history.length - 1
  
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Web Design Quote Generator
        </h1>
        <p className="text-gray-600">
          Get an instant quote for your web design project by answering a few questions.
        </p>
      </div>
      
      {saveMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {saveMessage}
        </div>
      )}
      
      <Tabs defaultValue="requirements" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="requirements" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Requirements</span>
          </TabsTrigger>
          <TabsTrigger value="quote" className="flex items-center space-x-2">
            <Calculator className="h-4 w-4" />
            <span>Get Quote</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="requirements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(handleSaveRequirements)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Goals *
                  </label>
                  <Textarea
                    {...form.register('businessGoals')}
                    placeholder="Describe your primary business goals for this website..."
                    rows={4}
                  />
                  {form.formState.errors.businessGoals && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.businessGoals.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience *
                  </label>
                  <Textarea
                    {...form.register('targetAudience')}
                    placeholder="Describe your target audience and ideal customers..."
                    rows={4}
                  />
                  {form.formState.errors.targetAudience && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.targetAudience.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Requirements
                  </label>
                  <Textarea
                    {...form.register('additionalRequirements')}
                    placeholder="Any specific features, integrations, or special requirements..."
                    rows={3}
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  Save Requirements
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="quote" className="space-y-6">
          <div className="grid gap-6">
            <QuestionRenderer
              currentStep={questionnaireState.currentStep}
              answers={questionnaireState.answers}
              onAnswer={handleAnswer}
              estimatedCost={estimatedCost}
            />
            
            <NavigationControls
              currentStep={questionnaireState.currentStep}
              answers={questionnaireState.answers}
              onPrevStep={handlePrevStep}
              onNextStep={handleNextStep}
              onSave={handleSave}
              onReset={handleReset}
              quickMode={questionnaireState.quickMode}
              onToggleQuickMode={handleToggleQuickMode}
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={handleUndo}
              onRedo={handleRedo}
              isComplete={questionnaireState.isComplete}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
})

WebDesignQuote.displayName = 'WebDesignQuote'

export default WebDesignQuote
