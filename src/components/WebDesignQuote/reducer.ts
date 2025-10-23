// Reducer logic and action types for WebDesignQuote component
import { QuestionnaireState, QuestionnaireAction, QuoteResult } from './types'

export const ACTION_TYPES = {
  SET_INDUSTRY: "SET_INDUSTRY" as const,
  SET_SUB_INDUSTRY: "SET_SUB_INDUSTRY" as const,
  SET_GOALS: "SET_GOALS" as const,
  SET_FEATURES: "SET_FEATURES" as const,
  SET_PAGES: "SET_PAGES" as const,
  SET_TIMELINE: "SET_TIMELINE" as const,
  NEXT_STEP: "NEXT_STEP" as const,
  PREV_STEP: "PREV_STEP" as const,
  COMPLETE: "COMPLETE" as const,
  RESET: "RESET" as const,
  LOAD_STATE: "LOAD_STATE" as const,
  SET_ANSWER: "SET_ANSWER" as const,
  SAVE_PROGRESS: "SAVE_PROGRESS" as const,
  UNDO: "UNDO" as const,
  REDO: "REDO" as const,
  SET_QUICK_MODE: "SET_QUICK_MODE" as const,
}

export const initialState: QuestionnaireState = {
  currentStep: 0,
  industry: '',
  subIndustry: '',
  goals: [],
  features: [],
  pages: 1,
  timeline: '',
  isCompleted: false,
  quoteResult: null,
  answers: {},
  quickMode: false,
  historyIndex: 0,
  history: [],
  isComplete: false,
}

export const questionnaireReducer = (state: QuestionnaireState, action: QuestionnaireAction): QuestionnaireState => {
  switch (action.type) {
    case "SET_INDUSTRY":
      return {
        ...state,
        industry: action.payload,
      }
    case "SET_SUB_INDUSTRY":
      return {
        ...state,
        subIndustry: action.payload,
      }
    case "SET_GOALS":
      return {
        ...state,
        goals: action.payload,
      }
    case "SET_FEATURES":
      return {
        ...state,
        features: action.payload,
      }
    case "SET_PAGES":
      return {
        ...state,
        pages: action.payload,
      }
    case "SET_TIMELINE":
      return {
        ...state,
        timeline: action.payload,
      }
    case "NEXT_STEP":
      return {
        ...state,
        currentStep: state.currentStep + 1,
      }
    case "PREV_STEP":
      return {
        ...state,
        currentStep: Math.max(0, state.currentStep - 1),
      }
    case "COMPLETE":
      return {
        ...state,
        isCompleted: true,
        quoteResult: action.payload,
      }
    case "RESET":
      return initialState
    case "LOAD_STATE":
      return action.payload
    case "SET_ANSWER":
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.payload.id]: action.payload.value,
        },
      }
    case "SAVE_PROGRESS":
      // Save progress logic can be handled in the component
      return state
    case "UNDO":
      if (state.historyIndex > 0) {
        return {
          ...state.history[state.historyIndex - 1],
          historyIndex: state.historyIndex - 1,
          history: state.history,
        }
      }
      return state
    case "REDO":
      if (state.historyIndex < state.history.length - 1) {
        return {
          ...state.history[state.historyIndex + 1],
          historyIndex: state.historyIndex + 1,
          history: state.history,
        }
      }
      return state
    case "SET_QUICK_MODE":
      return {
        ...state,
        quickMode: action.payload,
      }
    default:
      return state
  }
}