// Question renderer component for WebDesignQuote
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { industries, businessGoals, websiteFeatures } from './data'
import { formatCurrency } from './utils'

interface QuestionRendererProps {
  currentStep: number
  answers: Record<string, any>
  onAnswer: (id: string, value: any) => void
  estimatedCost?: number
}

const questions = [
  {
    id: 'businessGoals',
    title: 'What are your primary business goals?',
    description: 'Select all that apply to help us understand your objectives.',
    type: 'checkbox',
    options: businessGoals,
  },
  {
    id: 'targetAudience',
    title: 'Who is your target audience?',
    description: 'Describe your ideal customers or users.',
    type: 'textarea',
    placeholder: 'e.g., Small business owners, young professionals, families with children...',
  },
  {
    id: 'industry',
    title: 'What industry are you in?',
    description: 'This helps us understand your specific needs and compliance requirements.',
    type: 'radio',
    options: Object.keys(industries),
  },
  {
    id: 'websiteType',
    title: 'What type of website do you need?',
    description: 'Choose the option that best describes your website.',
    type: 'radio',
    options: [
      'Business/Corporate Website',
      'E-commerce Store',
      'Portfolio/Personal Website',
      'Blog/Content Site',
      'Landing Page',
      'Web Application',
      'Other',
    ],
  },
  {
    id: 'features',
    title: 'What features do you need?',
    description: 'Select all features that are important for your website.',
    type: 'checkbox',
    options: websiteFeatures,
  },
  {
    id: 'budget',
    title: 'What is your budget range?',
    description: 'This helps us recommend the best solution for your needs.',
    type: 'radio',
    options: [
      '$2,500 - $5,000',
      '$5,000 - $10,000',
      '$10,000 - $25,000',
      '$25,000 - $50,000',
      '$50,000+',
      'Not sure yet',
    ],
  },
  {
    id: 'timeline',
    title: 'When do you need this completed?',
    description: 'Choose your preferred timeline for project completion.',
    type: 'radio',
    options: [
      'Rush (2-4 weeks)',
      'Standard (4-8 weeks)',
      'Extended (8-12 weeks)',
      'Flexible (12+ weeks)',
    ],
  },
  {
    id: 'additionalRequirements',
    title: 'Any additional requirements?',
    description: 'Tell us about any specific needs, integrations, or special requirements.',
    type: 'textarea',
    placeholder: 'e.g., Integration with existing systems, specific design preferences, accessibility requirements...',
  },
]

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  currentStep,
  answers,
  onAnswer,
  estimatedCost,
}) => {
  const question = questions[currentStep]
  
  if (!question) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quote Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-green-600">
                Estimated Cost: {estimatedCost ? formatCurrency(estimatedCost) : 'Calculating...'}
              </h3>
              <p className="text-gray-600 mt-2">
                This is a preliminary estimate based on your requirements.
              </p>
            </div>
            
            <div className="grid gap-4">
              <div>
                <h4 className="font-semibold mb-2">Your Requirements:</h4>
                <div className="space-y-2">
                  {Object.entries(answers).map(([key, value]) => {
                    const questionData = questions.find(q => q.id === key)
                    if (!questionData || !value) return null
                    
                    return (
                      <div key={key} className="flex justify-between">
                        <span className="font-medium">{questionData.title.replace('?', '')}:</span>
                        <span className="text-gray-600">
                          {Array.isArray(value) ? value.join(', ') : value}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  const renderInput = () => {
    switch (question.type) {
      case 'checkbox':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  checked={answers[question.id]?.includes(option) || false}
                  onCheckedChange={(checked) => {
                    const currentValues = answers[question.id] || []
                    const newValues = checked
                      ? [...currentValues, option]
                      : currentValues.filter((v: string) => v !== option)
                    onAnswer(question.id, newValues)
                  }}
                />
                <Label htmlFor={option} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )
      
      case 'radio':
        return (
          <RadioGroup
            value={answers[question.id] || ''}
            onValueChange={(value) => onAnswer(question.id, value)}
          >
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )
      
      case 'textarea':
        return (
          <Textarea
            value={answers[question.id] || ''}
            onChange={(e) => onAnswer(question.id, e.target.value)}
            placeholder={question.placeholder}
            rows={4}
          />
        )
      
      case 'input':
      default:
        return (
          <Input
            value={answers[question.id] || ''}
            onChange={(e) => onAnswer(question.id, e.target.value)}
            placeholder={question.placeholder}
          />
        )
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{question.title}</CardTitle>
            <p className="text-gray-600 mt-2">{question.description}</p>
          </div>
          <Badge variant="outline">
            {currentStep + 1} of {questions.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {renderInput()}
          
          {estimatedCost && currentStep > 3 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Current Estimate:</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(estimatedCost)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                This estimate updates as you provide more details.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}