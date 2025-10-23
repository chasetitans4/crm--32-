import React, { useState, useMemo, useCallback, useEffect } from 'react'
import {
  BookOpen,
  Play,
  CheckCircle,
  Clock,
  Award,
  Target,
  TrendingUp,
  BarChart3,
  Settings,
  FileText,
  Shield,
  DollarSign,
  Briefcase,
  UserCheck,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
  Download,
  Bookmark,
  BookmarkCheck,
  StickyNote,
  Timer,
  Star,
  Share2,
  Printer,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Pause,
  SkipForward,
  SkipBack,
  Lightbulb,
  MessageSquare,
  Trophy,
  ThumbsUp,
  ThumbsDown,
  Calendar
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { motion, AnimatePresence } from 'framer-motion'

/* -------------------------------------------------------------------------- */
/* 1. Interfaces                                                              */
/* -------------------------------------------------------------------------- */

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface TrainingSlide {
  id: string
  title: string
  content: string
  type: 'text' | 'video' | 'interactive'
  videoUrl?: string
}

interface TrainingModule {
  id: string
  title: string
  description: string
  category: 'CRM Usage' | 'Company Policies' | 'Security' | 'Best Practices' | 'Sales' | 'Finance' | 'Project Management'
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  estimatedTime: number
  role: 'Admin' | 'Manager' | 'Sales Rep' | 'Contractor' | 'All'
  passingScore: number
  slides: TrainingSlide[]
  quiz: QuizQuestion[]
}

interface UserProgress {
  moduleId: string
  currentSlide: number
  completed: boolean
  lastAccessed: string
  timeSpent: number
  quizAttempts: QuizAttempt[]
  bookmarkedSlides: number[]
  notes: Record<string, string>
  rating?: number
  feedback?: string
  certificateEarned?: boolean
  certificateDate?: string
  studyStreak: number
  lastStudyDate?: string
  bestScore?: number
}

interface QuizAttempt {
  id: string
  moduleId: string
  userRole: string
  score: number
  totalQuestions: number
  answers: Array<{
    questionId: string
    selectedAnswer: number
    correct: boolean
  }>
  completedAt: string
  timeSpent: number
}

/* -------------------------------------------------------------------------- */
/* 2. Static data                                                             */
/* -------------------------------------------------------------------------- */

const TRAINING_MODULES: TrainingModule[] = [
  {
    id: "crm-basics",
    title: "CRM Fundamentals",
    description: "Master the core concepts and navigation of our CRM system",
    category: "CRM Usage",
    difficulty: "Beginner",
    estimatedTime: 45,
    role: "All",
    passingScore: 80,
    slides: [
      {
        id: "slide-1",
        title: "What is CRM?",
        content: "Customer Relationship Management (CRM) is a technology that helps businesses manage interactions with current and potential customers. Our CRM system centralizes customer data, tracks communications, manages sales pipelines, and automates various business processes to improve customer relationships and drive sales growth.",
        type: "text"
      },
      {
        id: "slide-2",
        title: "Dashboard Overview",
        content: "The CRM dashboard is your command center. Here you'll find: QUICK STATS - Key metrics at a glance including total leads, active deals, and revenue. RECENT ACTIVITY - Latest customer interactions and system updates. TASK REMINDERS - Upcoming follow-ups and deadlines. PERFORMANCE CHARTS - Visual representations of your sales progress and team performance.",
        type: "text"
      },
      {
        id: "slide-3",
        title: "Navigation Menu",
        content: "The main navigation includes: DASHBOARD - Your home base with key metrics. LEADS - Manage potential customers and prospects. CLIENTS - View and manage existing customer relationships. PIPELINE - Track deals through your sales process. TASKS - Manage follow-ups and to-dos. REPORTS - Analyze performance and generate insights. SETTINGS - Configure your CRM preferences.",
        type: "text"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "What is the primary purpose of a CRM system?",
        options: ["Manage finances", "Track inventory", "Manage customer relationships", "Create websites"],
        correctAnswer: 2,
        explanation: "CRM stands for Customer Relationship Management, which focuses on managing and improving customer relationships."
      },
      {
        id: "q2",
        question: "Where can you find your key performance metrics?",
        options: ["Settings", "Dashboard", "Reports only", "Pipeline"],
        correctAnswer: 1,
        explanation: "The Dashboard provides a quick overview of key metrics and performance indicators."
      }
    ]
  },
  {
    id: "lead-management-basics",
    title: "Lead Management for Sales Teams",
    description: "Learn how to effectively capture, qualify, and nurture leads in the CRM",
    category: "Sales",
    difficulty: "Beginner",
    estimatedTime: 35,
    role: "Sales Rep",
    passingScore: 80,
    slides: [
      {
        id: "slide-1",
        title: "Understanding Leads",
        content: "A lead is a potential customer who has shown interest in your product or service. In our CRM, leads are the starting point of your sales journey. Learn to identify different types of leads: COLD LEADS - No prior contact or engagement. WARM LEADS - Some interaction or referral. HOT LEADS - High interest and ready to buy. QUALIFIED LEADS - Meet your ideal customer criteria.",
        type: "text"
      },
      {
        id: "slide-2",
        title: "Adding New Leads",
        content: "To add a new lead: 1. Click 'Add Lead' button in the Leads section. 2. Fill in contact information (name, email, phone). 3. Add lead source (website, referral, cold call, etc.). 4. Set lead status and priority level. 5. Add notes about initial contact or interest. 6. Assign to appropriate sales rep if needed. Remember: Complete information helps with better follow-up!",
        type: "text"
      },
      {
        id: "slide-3",
        title: "Lead Qualification Process",
        content: "Qualifying leads helps prioritize your efforts: BUDGET - Can they afford your solution? AUTHORITY - Are they the decision maker? NEED - Do they have a genuine need? TIMELINE - When do they plan to buy? Use the lead scoring system to rank leads automatically. Update lead status as you gather more information. Schedule follow-up tasks to maintain momentum.",
        type: "text"
      },
      {
        id: "slide-4",
        title: "Lead Nurturing Best Practices",
        content: "Effective lead nurturing increases conversion rates: SET REMINDERS - Use the task system for timely follow-ups. PERSONALIZE COMMUNICATION - Reference previous conversations and specific needs. PROVIDE VALUE - Share relevant content, case studies, or solutions. TRACK INTERACTIONS - Log all calls, emails, and meetings in the CRM. MOVE QUALIFIED LEADS - Convert promising leads to opportunities in the pipeline.",
        type: "text"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "What information is most important when adding a new lead?",
        options: ["Only name and email", "Complete contact info and lead source", "Just the company name", "Only phone number"],
        correctAnswer: 1,
        explanation: "Complete contact information and lead source help with better qualification and follow-up strategies."
      },
      {
        id: "q2",
        question: "What does BANT stand for in lead qualification?",
        options: ["Budget, Authority, Need, Timeline", "Business, Account, Name, Territory", "Buyer, Agent, Number, Type", "Brand, Analysis, Notes, Tasks"],
        correctAnswer: 0,
        explanation: "BANT (Budget, Authority, Need, Timeline) is a proven framework for qualifying leads effectively."
      },
      {
        id: "q3",
        question: "When should you convert a lead to an opportunity?",
        options: ["Immediately after adding them", "After they show genuine interest and meet qualification criteria", "Only after they request a quote", "Never, keep them as leads"],
        correctAnswer: 1,
        explanation: "Convert leads to opportunities when they're qualified and show genuine buying intent."
      }
    ]
  },
  {
    id: "pipeline-management",
    title: "Sales Pipeline Management",
    description: "Master the art of managing deals through your sales pipeline",
    category: "Sales",
    difficulty: "Beginner",
    estimatedTime: 40,
    role: "Sales Rep",
    passingScore: 80,
    slides: [
      {
        id: "slide-1",
        title: "Understanding the Sales Pipeline",
        content: "The sales pipeline visualizes your deals from initial contact to closing. Our pipeline stages are: PROSPECTING - Identifying and qualifying potential customers. INITIAL CONTACT - First meaningful conversation with prospect. NEEDS ASSESSMENT - Understanding their requirements and pain points. PROPOSAL - Presenting your solution and pricing. NEGOTIATION - Discussing terms and addressing objections. CLOSING - Finalizing the deal and getting commitment.",
        type: "text"
      },
      {
        id: "slide-2",
        title: "Creating Opportunities",
        content: "To create a new opportunity: 1. Convert a qualified lead or click 'Add Opportunity'. 2. Enter deal details (name, value, close date). 3. Select the appropriate pipeline stage. 4. Add contact and company information. 5. Set probability percentage based on stage. 6. Add detailed notes about the opportunity. 7. Schedule next steps and follow-up tasks.",
        type: "text"
      },
      {
        id: "slide-3",
        title: "Moving Deals Through Stages",
        content: "Effective pipeline management requires regular updates: UPDATE STAGE - Move deals forward as they progress. ADJUST PROBABILITY - Reflect realistic chances of closing. SET CLOSE DATES - Keep timeline estimates current. LOG ACTIVITIES - Record all interactions and meetings. IDENTIFY BLOCKERS - Note any obstacles or concerns. PLAN NEXT STEPS - Always have a clear action plan.",
        type: "text"
      },
      {
        id: "slide-4",
        title: "Pipeline Analytics and Forecasting",
        content: "Use pipeline data to improve your sales performance: CONVERSION RATES - Track how leads move through each stage. AVERAGE DEAL SIZE - Monitor your typical deal value. SALES CYCLE LENGTH - Understand how long deals take to close. WIN/LOSS ANALYSIS - Learn from successful and failed deals. FORECAST ACCURACY - Predict future revenue based on pipeline health. BOTTLENECK IDENTIFICATION - Find stages where deals get stuck.",
        type: "text"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "What should you do when moving a deal to the next pipeline stage?",
        options: ["Just change the stage", "Update stage, probability, and add notes about progress", "Only update the close date", "Wait for the customer to tell you"],
        correctAnswer: 1,
        explanation: "Always update multiple fields and add context when advancing deals through the pipeline."
      },
      {
        id: "q2",
        question: "How often should you review and update your pipeline?",
        options: ["Once a month", "Only when deals close", "Weekly or more frequently", "Once a quarter"],
        correctAnswer: 2,
        explanation: "Regular pipeline reviews (weekly or more) ensure accuracy and help identify issues early."
      },
      {
        id: "q3",
        question: "What is the most important factor in accurate sales forecasting?",
        options: ["Having many deals in the pipeline", "Keeping deal information current and realistic", "Setting high close dates", "Only counting deals at 100% probability"],
        correctAnswer: 1,
        explanation: "Accurate, up-to-date deal information is crucial for reliable sales forecasting."
      }
    ]
  },
  {
    id: "client-communication",
    title: "Effective Client Communication",
    description: "Learn best practices for communicating with clients using CRM tools",
    category: "Sales",
    difficulty: "Beginner",
    estimatedTime: 30,
    role: "Sales Rep",
    passingScore: 80,
    slides: [
      {
        id: "slide-1",
        title: "Communication Channels in CRM",
        content: "Our CRM supports multiple communication methods: EMAIL INTEGRATION - Send and track emails directly from the CRM. CALL LOGGING - Record phone conversations and outcomes. MEETING SCHEDULER - Book and track appointments. TASK REMINDERS - Set follow-up activities. NOTES SYSTEM - Document all interactions and important details. DOCUMENT SHARING - Attach proposals, contracts, and presentations.",
        type: "text"
      },
      {
        id: "slide-2",
        title: "Email Best Practices",
        content: "Effective email communication drives results: PERSONALIZATION - Use client's name and reference previous conversations. CLEAR SUBJECT LINES - Make the purpose obvious. CONCISE CONTENT - Keep messages focused and actionable. CALL TO ACTION - Always include next steps. EMAIL TRACKING - Monitor opens and clicks. TEMPLATE USAGE - Use proven email templates for consistency. FOLLOW-UP SEQUENCES - Set automated reminders for responses.",
        type: "text"
      },
      {
        id: "slide-3",
        title: "Call Management",
        content: "Maximize the impact of your phone conversations: PREPARE BEFOREHAND - Review client history and notes. SET OBJECTIVES - Know what you want to achieve. ACTIVE LISTENING - Focus on understanding client needs. TAKE NOTES - Document key points during the call. CONFIRM NEXT STEPS - Agree on follow-up actions. LOG IMMEDIATELY - Record call details while fresh. SCHEDULE FOLLOW-UP - Set reminders for next contact.",
        type: "text"
      },
      {
        id: "slide-4",
        title: "Building Client Relationships",
        content: "Strong relationships lead to better sales outcomes: CONSISTENCY - Regular, valuable communication. RELIABILITY - Follow through on commitments. TRANSPARENCY - Be honest about timelines and capabilities. VALUE-FIRST - Always provide helpful information. PERSONAL TOUCH - Remember important details about clients. RESPONSIVENESS - Reply promptly to inquiries. PROFESSIONALISM - Maintain high standards in all interactions.",
        type: "text"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "What should you do immediately after a client phone call?",
        options: ["Move on to the next task", "Log call details and schedule follow-up", "Send a generic thank you email", "Wait for the client to contact you"],
        correctAnswer: 1,
        explanation: "Logging call details immediately and scheduling follow-up ensures nothing falls through the cracks."
      },
      {
        id: "q2",
        question: "What makes an effective sales email?",
        options: ["Long detailed explanations", "Generic mass-sent content", "Personalized, concise message with clear next steps", "Only product features"],
        correctAnswer: 2,
        explanation: "Personalized, concise emails with clear calls to action get better response rates."
      },
      {
        id: "q3",
        question: "How can you build stronger client relationships through the CRM?",
        options: ["Only contact them when you need something", "Document personal details and preferences for future reference", "Send the same message to everyone", "Avoid taking detailed notes"],
        correctAnswer: 1,
        explanation: "Documenting personal details helps you provide more personalized, relationship-building communication."
      }
    ]
  },
  {
    id: "sales-reporting-basics",
    title: "Sales Reporting and Analytics",
    description: "Learn to generate and interpret sales reports to improve performance",
    category: "Sales",
    difficulty: "Beginner",
    estimatedTime: 25,
    role: "Sales Rep",
    passingScore: 80,
    slides: [
      {
        id: "slide-1",
        title: "Understanding Sales Reports",
        content: "Sales reports help you track performance and identify opportunities: ACTIVITY REPORTS - Track calls, emails, and meetings. PIPELINE REPORTS - Monitor deal progress and forecasts. CONVERSION REPORTS - Analyze lead-to-customer ratios. REVENUE REPORTS - Track actual vs. projected sales. PERFORMANCE REPORTS - Compare individual and team metrics. TREND ANALYSIS - Identify patterns over time.",
        type: "text"
      },
      {
        id: "slide-2",
        title: "Key Sales Metrics",
        content: "Focus on metrics that drive results: LEAD CONVERSION RATE - Percentage of leads that become customers. AVERAGE DEAL SIZE - Typical value of closed deals. SALES CYCLE LENGTH - Time from first contact to close. WIN RATE - Percentage of opportunities won. ACTIVITY METRICS - Number of calls, emails, meetings. QUOTA ATTAINMENT - Progress toward sales goals. PIPELINE VELOCITY - How quickly deals move through stages.",
        type: "text"
      },
      {
        id: "slide-3",
        title: "Generating Reports",
        content: "Create reports to track your progress: ACCESS REPORTS - Navigate to the Reports section. SELECT REPORT TYPE - Choose from pre-built templates. SET DATE RANGE - Define the time period to analyze. APPLY FILTERS - Focus on specific products, regions, or clients. CUSTOMIZE VIEWS - Add or remove columns as needed. EXPORT DATA - Download reports for external analysis. SCHEDULE REPORTS - Set up automatic report generation.",
        type: "text"
      },
      {
        id: "slide-4",
        title: "Using Data to Improve Performance",
        content: "Turn insights into action: IDENTIFY TRENDS - Look for patterns in your data. SPOT OPPORTUNITIES - Find areas for improvement. SET GOALS - Use data to establish realistic targets. ADJUST STRATEGIES - Modify approach based on results. TRACK PROGRESS - Monitor improvement over time. SHARE INSIGHTS - Discuss findings with your team. CELEBRATE WINS - Recognize successful strategies and results.",
        type: "text"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "What is the most important benefit of regular sales reporting?",
        options: ["Impressing management", "Identifying trends and opportunities for improvement", "Creating more paperwork", "Comparing with competitors"],
        correctAnswer: 1,
        explanation: "Regular reporting helps identify patterns and opportunities to improve sales performance."
      },
      {
        id: "q2",
        question: "Which metric best indicates the health of your sales pipeline?",
        options: ["Number of leads only", "Total deal value only", "Combination of deal value, stage distribution, and conversion rates", "Number of closed deals only"],
        correctAnswer: 2,
        explanation: "Pipeline health requires looking at multiple metrics together for a complete picture."
      },
      {
        id: "q3",
        question: "How often should sales reps review their performance reports?",
        options: ["Once a year", "Monthly only", "Weekly or bi-weekly", "Only when asked by management"],
        correctAnswer: 2,
        explanation: "Regular review (weekly or bi-weekly) allows for timely adjustments and continuous improvement."
      }
    ]
  },
  {
    id: "objection-handling",
    title: "Mastering Objection Handling",
    description: "Learn proven techniques to handle common sales objections and turn them into opportunities",
    category: "Sales",
    difficulty: "Intermediate",
    estimatedTime: 50,
    role: "Sales Rep",
    passingScore: 80,
    slides: [
      {
        id: "slide-1",
        title: "Understanding Objections",
        content: "Objections are natural parts of the sales process, not roadblocks. Common types include: PRICE OBJECTIONS - 'It's too expensive' or 'We don't have budget'. AUTHORITY OBJECTIONS - 'I need to check with my boss'. NEED OBJECTIONS - 'We don't really need this right now'. TRUST OBJECTIONS - 'I'm not sure about your company'. TIMING OBJECTIONS - 'This isn't a good time'. Remember: Objections often indicate interest, not rejection.",
        type: "text"
      },
      {
        id: "slide-2",
        title: "The HEAR Method",
        content: "Use the HEAR framework to handle objections effectively: HALT - Stop talking and listen completely. EMPATHIZE - Acknowledge their concern and show understanding. ASK - Ask clarifying questions to understand the real issue. RESPOND - Address the objection with relevant information or solutions. Example: 'I understand budget is a concern. Can you help me understand what budget range you're working with so I can show you options that fit?'",
        type: "text"
      },
      {
        id: "slide-3",
        title: "Common Objections and Responses",
        content: "Price: 'I understand cost is important. Let's look at the ROI and how this pays for itself.' Authority: 'That makes sense. What information would help you present this to your decision maker?' Need: 'Help me understand your current process and where you see room for improvement.' Trust: 'I appreciate your caution. Here are some references from similar companies.' Timing: 'When would be a better time? Let's discuss what's driving that timeline.'",
        type: "text"
      },
      {
        id: "slide-4",
        title: "Advanced Objection Techniques",
        content: "FEEL, FELT, FOUND - 'I understand how you feel. Others have felt the same way. Here's what they found...' BOOMERANG - Turn the objection into a reason to buy. 'That's exactly why you need this solution.' QUESTION THE OBJECTION - 'Help me understand what you mean by too expensive?' ISOLATE THE OBJECTION - 'If we could solve the budget issue, is there anything else preventing you from moving forward?' REFRAME - Present the objection from a different perspective.",
        type: "text"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "What does the HEAR method stand for?",
        options: ["Halt, Empathize, Ask, Respond", "Hear, Evaluate, Answer, Resolve", "Hold, Engage, Argue, Reject", "Help, Explain, Agree, Recommend"],
        correctAnswer: 0,
        explanation: "HEAR stands for Halt, Empathize, Ask, Respond - a proven framework for handling objections."
      },
      {
        id: "q2",
        question: "When a prospect says 'It's too expensive', what should you do first?",
        options: ["Immediately offer a discount", "Ask clarifying questions to understand their budget concerns", "List all the features to justify the price", "End the conversation"],
        correctAnswer: 1,
        explanation: "Always ask clarifying questions first to understand the real concern behind price objections."
      },
      {
        id: "q3",
        question: "What does it mean to 'isolate the objection'?",
        options: ["Ignore the objection completely", "Confirm that this is the only concern preventing a purchase", "Argue against the objection", "Change the subject"],
        correctAnswer: 1,
        explanation: "Isolating the objection means confirming it's the only barrier to moving forward."
      }
    ]
  },
  {
    id: "closing-techniques",
    title: "Advanced Closing Techniques",
    description: "Master various closing strategies to successfully convert prospects into customers",
    category: "Sales",
    difficulty: "Intermediate",
    estimatedTime: 45,
    role: "Sales Rep",
    passingScore: 80,
    slides: [
      {
        id: "slide-1",
        title: "When to Close",
        content: "Recognize buying signals that indicate readiness to close: VERBAL SIGNALS - 'How soon could we start?' 'What's included in the price?' 'Can you do better on the price?' PHYSICAL SIGNALS - Leaning forward, taking notes, nodding agreement. BEHAVIORAL SIGNALS - Asking detailed questions, discussing implementation, involving others in the conversation. Don't wait for the 'perfect moment' - look for these signals throughout the conversation.",
        type: "text"
      },
      {
        id: "slide-2",
        title: "Assumptive Close",
        content: "Act as if the prospect has already decided to buy: 'When would you like to get started?' 'Should we schedule the implementation for next week?' 'Would you prefer the monthly or annual payment plan?' This technique works well when you've built strong rapport and addressed their needs. Use confident, positive language and assume they're ready to move forward. If they object, treat it as a normal part of the process.",
        type: "text"
      },
      {
        id: "slide-3",
        title: "Alternative Choice Close",
        content: "Give prospects two positive options instead of yes/no: 'Would you prefer the standard package or the premium package?' 'Should we start with a 3-month or 6-month contract?' 'Would Tuesday or Thursday work better for implementation?' This technique makes the decision easier by focusing on details rather than whether to buy. Both options lead to a sale, giving the prospect control while guiding them toward a purchase.",
        type: "text"
      },
      {
        id: "slide-4",
        title: "Urgency and Scarcity Closes",
        content: "Create legitimate urgency to encourage immediate action: TIME-LIMITED OFFERS - 'This pricing is only available until the end of the month.' LIMITED AVAILABILITY - 'We only have two implementation slots left this quarter.' SEASONAL URGENCY - 'To be ready for your busy season, we need to start by...' COMPETITIVE URGENCY - 'Your competitor just implemented a similar solution.' Always be honest and ethical - false urgency damages trust and relationships.",
        type: "text"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "What is a buying signal?",
        options: ["A sign the prospect is not interested", "An indication the prospect is ready to purchase", "A request for more information", "A price objection"],
        correctAnswer: 1,
        explanation: "Buying signals indicate the prospect is ready to make a purchase decision."
      },
      {
        id: "q2",
        question: "Which is an example of an assumptive close?",
        options: ["'Are you ready to buy?'", "'When would you like to get started?'", "'Do you have any questions?'", "'What do you think?'"],
        correctAnswer: 1,
        explanation: "Assumptive closes act as if the decision to buy has already been made."
      },
      {
        id: "q3",
        question: "What makes urgency closes effective?",
        options: ["They pressure prospects into quick decisions", "They create fear of missing out on legitimate opportunities", "They always result in immediate sales", "They eliminate the need for other closing techniques"],
        correctAnswer: 1,
        explanation: "Effective urgency closes create legitimate fear of missing out, not artificial pressure."
      }
    ]
  },
  {
    id: "customer-retention",
    title: "Customer Retention and Upselling",
    description: "Learn strategies to retain existing customers and identify upselling opportunities",
    category: "Sales",
    difficulty: "Intermediate",
    estimatedTime: 40,
    role: "Sales Rep",
    passingScore: 80,
    slides: [
      {
        id: "slide-1",
        title: "The Value of Customer Retention",
        content: "Retaining customers is more profitable than acquiring new ones: COST EFFICIENCY - It costs 5-25x more to acquire new customers than retain existing ones. REVENUE GROWTH - Existing customers spend 67% more than new customers. REFERRAL POTENTIAL - Satisfied customers refer others, reducing acquisition costs. PREDICTABLE REVENUE - Retained customers provide stable, recurring revenue. MARKET INSIGHTS - Long-term customers provide valuable feedback for improvement.",
        type: "text"
      },
      {
        id: "slide-2",
        title: "Building Customer Loyalty",
        content: "Create strong relationships that encourage long-term partnerships: REGULAR CHECK-INS - Schedule quarterly business reviews and health checks. PROACTIVE SUPPORT - Anticipate needs and offer solutions before problems arise. PERSONAL RELATIONSHIPS - Remember important details and celebrate their successes. VALUE DELIVERY - Continuously demonstrate ROI and business impact. EXCLUSIVE BENEFITS - Offer special pricing, early access, or premium support. FEEDBACK LOOPS - Ask for input and act on their suggestions.",
        type: "text"
      },
      {
        id: "slide-3",
        title: "Identifying Upselling Opportunities",
        content: "Look for natural expansion opportunities: USAGE PATTERNS - Monitor how they use your product/service. GROWTH INDICATORS - Track their business growth and changing needs. PAIN POINTS - Listen for new challenges your solutions could address. SUCCESS METRICS - When they achieve goals, they may be ready for more. COMPETITIVE THREATS - Protect accounts by offering additional value. RENEWAL PERIODS - Natural times to discuss expanded partnerships.",
        type: "text"
      },
      {
        id: "slide-4",
        title: "Upselling Best Practices",
        content: "Approach upselling as problem-solving, not selling: FOCUS ON VALUE - Show how additional services solve specific problems. TIMING MATTERS - Upsell when customers are seeing success and value. START SMALL - Begin with logical, incremental additions. BUNDLE SOLUTIONS - Package complementary services together. DEMONSTRATE ROI - Show clear return on additional investment. INVOLVE STAKEHOLDERS - Include decision-makers in expansion discussions. DOCUMENT SUCCESS - Track and share results from current services.",
        type: "text"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "How much more do existing customers typically spend compared to new customers?",
        options: ["25% more", "50% more", "67% more", "100% more"],
        correctAnswer: 2,
        explanation: "Studies show existing customers spend 67% more than new customers on average."
      },
      {
        id: "q2",
        question: "What is the best time to approach a customer about upselling?",
        options: ["Immediately after they sign up", "When they're experiencing problems", "When they're seeing success and value from current services", "Only during renewal periods"],
        correctAnswer: 2,
        explanation: "Customers are most receptive to upselling when they're already seeing value and success."
      },
      {
        id: "q3",
        question: "What should be the primary focus when upselling?",
        options: ["Increasing revenue", "Solving additional customer problems", "Meeting sales quotas", "Competing with other vendors"],
        correctAnswer: 1,
        explanation: "Successful upselling focuses on solving additional customer problems and providing value."
      }
    ]
  },
  {
    id: "sales-psychology",
    title: "Sales Psychology and Persuasion",
    description: "Understand the psychological principles that drive purchasing decisions",
    category: "Sales",
    difficulty: "Advanced",
    estimatedTime: 55,
    role: "Sales Rep",
    passingScore: 80,
    slides: [
      {
        id: "slide-1",
        title: "Understanding Buyer Psychology",
        content: "People buy based on emotion and justify with logic: EMOTIONAL DRIVERS - Fear, desire, pride, security, status, convenience. LOGICAL JUSTIFIERS - ROI, features, specifications, comparisons. DECISION-MAKING PROCESS - Emotional reaction first, then logical evaluation. COGNITIVE BIASES - Loss aversion, social proof, authority, scarcity. PAIN VS. GAIN - People are more motivated to avoid pain than gain pleasure. Understanding these principles helps you connect with prospects on a deeper level.",
        type: "text"
      },
      {
        id: "slide-2",
        title: "The Principle of Reciprocity",
        content: "People feel obligated to return favors: GIVE FIRST - Provide value before asking for anything in return. FREE RESOURCES - Share useful content, tools, or insights. PERSONAL INVESTMENT - Spend time understanding their business. INTRODUCTIONS - Connect them with valuable contacts. SMALL FAVORS - Help with non-sales related requests. EXPERTISE SHARING - Offer industry knowledge and best practices. The key is genuine helpfulness, not manipulation.",
        type: "text"
      },
      {
        id: "slide-3",
        title: "Social Proof and Authority",
        content: "People follow the actions of others and defer to experts: CUSTOMER TESTIMONIALS - Share success stories from similar companies. CASE STUDIES - Provide detailed examples of positive outcomes. INDUSTRY RECOGNITION - Mention awards, certifications, and rankings. EXPERT ENDORSEMENTS - Reference thought leaders who recommend your solution. USAGE STATISTICS - Share adoption rates and customer satisfaction scores. PEER REFERENCES - Connect prospects with existing customers. Position yourself as a trusted advisor, not just a salesperson.",
        type: "text"
      },
      {
        id: "slide-4",
        title: "Creating Urgency and Scarcity",
        content: "Scarcity increases perceived value and motivates action: LIMITED TIME OFFERS - Genuine deadlines for special pricing or terms. EXCLUSIVE OPPORTUNITIES - Limited availability or early access. COMPETITIVE PRESSURE - Risk of competitors gaining advantage. SEASONAL FACTORS - Timing related to business cycles or events. RESOURCE CONSTRAINTS - Limited implementation capacity or support slots. MARKET CONDITIONS - Economic or industry factors affecting timing. Always be honest and ethical - false scarcity destroys trust and credibility.",
        type: "text"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "What drives most purchasing decisions?",
        options: ["Logic and rational analysis", "Emotion justified by logic", "Price comparisons", "Feature lists"],
        correctAnswer: 1,
        explanation: "People buy based on emotion and then justify their decision with logic."
      },
      {
        id: "q2",
        question: "What is the principle of reciprocity in sales?",
        options: ["Always ask for referrals", "Match the prospect's communication style", "People feel obligated to return favors", "Negotiate win-win deals"],
        correctAnswer: 2,
        explanation: "Reciprocity means people feel obligated to return favors when you provide value first."
      },
      {
        id: "q3",
        question: "Which is the most effective form of social proof?",
        options: ["Company awards and recognition", "Detailed case studies from similar companies", "General customer testimonials", "Industry statistics"],
        correctAnswer: 1,
        explanation: "Detailed case studies from similar companies provide the most relevant and convincing social proof."
      }
    ]
  },
  {
    id: "consultative-selling",
    title: "Consultative Selling Mastery",
    description: "Learn to position yourself as a trusted advisor rather than a traditional salesperson",
    category: "Sales",
    difficulty: "Advanced",
    estimatedTime: 60,
    role: "Sales Rep",
    passingScore: 80,
    slides: [
      {
        id: "slide-1",
        title: "The Consultative Approach",
        content: "Shift from selling products to solving problems: ADVISOR MINDSET - Focus on the customer's success, not your commission. DEEP DISCOVERY - Understand their business, challenges, and goals thoroughly. CUSTOM SOLUTIONS - Tailor recommendations to their specific situation. LONG-TERM THINKING - Build relationships that extend beyond single transactions. INDUSTRY EXPERTISE - Become a valuable resource for market insights. COLLABORATIVE PROCESS - Work together to find the best solutions.",
        type: "text"
      },
      {
        id: "slide-2",
        title: "Advanced Questioning Techniques",
        content: "Use strategic questions to uncover deeper insights: SITUATION QUESTIONS - Understand their current state and context. PROBLEM QUESTIONS - Identify pain points and challenges. IMPLICATION QUESTIONS - Explore the consequences of not solving problems. NEED-PAYOFF QUESTIONS - Help them visualize the benefits of solutions. HYPOTHETICAL QUESTIONS - 'What if we could reduce your costs by 20%?' PRIORITY QUESTIONS - 'What's most important to you in a solution?' DECISION QUESTIONS - 'How do you typically evaluate these types of investments?'",
        type: "text"
      },
      {
        id: "slide-3",
        title: "Building Trust and Credibility",
        content: "Establish yourself as a trusted business partner: INDUSTRY KNOWLEDGE - Stay current on trends, challenges, and best practices. PREPARATION - Research their company, industry, and competitors thoroughly. HONESTY - Admit when your solution isn't the best fit. FOLLOW-THROUGH - Always do what you say you'll do. CONFIDENTIALITY - Respect sensitive information and maintain discretion. RESOURCE SHARING - Provide valuable insights even when not selling. PROFESSIONAL NETWORK - Make valuable introductions and connections.",
        type: "text"
      },
      {
        id: "slide-4",
        title: "Solution Development Process",
        content: "Collaborate to create customized solutions: NEEDS ANALYSIS - Document all requirements and priorities. STAKEHOLDER MAPPING - Identify all decision-makers and influencers. SOLUTION DESIGN - Create proposals that address specific needs. BUSINESS CASE DEVELOPMENT - Help them justify the investment internally. IMPLEMENTATION PLANNING - Outline the path to success. RISK MITIGATION - Address potential concerns and obstacles. SUCCESS METRICS - Define how success will be measured and tracked.",
        type: "text"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "What is the primary goal of consultative selling?",
        options: ["Close deals faster", "Sell more products", "Solve customer problems and build long-term relationships", "Increase profit margins"],
        correctAnswer: 2,
        explanation: "Consultative selling focuses on solving customer problems and building long-term relationships."
      },
      {
        id: "q2",
        question: "What type of questions help prospects visualize the benefits of your solution?",
        options: ["Situation questions", "Problem questions", "Implication questions", "Need-payoff questions"],
        correctAnswer: 3,
        explanation: "Need-payoff questions help prospects visualize and articulate the benefits of your solution."
      },
      {
        id: "q3",
        question: "When should you admit your solution isn't the best fit?",
        options: ["Never, always try to make a sale", "Only when directly asked", "When it's genuinely not the right solution", "Only after trying all closing techniques"],
        correctAnswer: 2,
        explanation: "Honesty about fit builds trust and credibility, leading to better long-term relationships."
      }
    ]
  },
  {
    id: "web-design-quote-phone",
    title: "Web Design Quote Component - Phone Sales",
    description: "Master the art of using the web design quote component effectively during phone conversations with leads",
    category: "Sales",
    difficulty: "Intermediate",
    estimatedTime: 65,
    role: "Sales Rep",
    passingScore: 80,
    slides: [
      {
        id: "slide-1",
        title: "Introduction to Web Design Quote Component",
        content: "The web design quote component is a powerful tool for real-time pricing and proposal generation during phone calls. Key features include: REAL-TIME PRICING - Instant calculations based on client requirements. VERBAL PRESENTATION - Clearly describe pricing breakdown over the phone. CUSTOMIZABLE OPTIONS - Adjust features and services on the fly. PROFESSIONAL PROPOSALS - Generate polished quotes immediately. CONVERSION TRACKING - Monitor quote-to-sale ratios. FOLLOW-UP AUTOMATION - Schedule automatic follow-ups after quote delivery. VISUAL MEETINGS - Schedule separate meetings if clients request to see the screen.",
        type: "text"
      },
      {
        id: "slide-2",
        title: "Pre-Call Preparation",
        content: "Successful quote calls require thorough preparation: RESEARCH THE LEAD - Review their business, industry, and current website. UNDERSTAND THEIR NEEDS - Check previous conversations and notes. PREPARE YOUR WORKSPACE - Have CRM open with quote component ready. GATHER EXAMPLES - Have relevant portfolio pieces ready to show. SET OBJECTIVES - Know what you want to achieve in the call. PREPARE QUESTIONS - Have discovery questions ready to uncover specific needs. NOTE: If the lead requests to see your screen, schedule a separate meeting for screen sharing.",
        type: "text"
      },
      {
        id: "slide-3",
        title: "Opening the Quote Discussion",
        content: "Start the quote process professionally: TRANSITION SMOOTHLY - 'Based on what you've told me, let me show you some options.' EXPLAIN THE PROCESS - 'I'm going to walk through pricing options with you over the phone.' DESCRIBE AS YOU GO - Clearly explain each option and feature verbally. ENGAGE THEM - 'Feel free to ask questions as we go through this together.' MAINTAIN CONTROL - Guide the conversation while staying responsive to their input. IF REQUESTED - If they want to see the screen, offer to schedule a separate meeting for a visual walkthrough.",
        type: "text"
      },
      {
        id: "slide-4",
        title: "Navigating the Quote Component",
        content: "Master the technical aspects of the quote tool: BASIC INFORMATION - Start with business name, industry, and contact details. PROJECT TYPE - Select from templates: basic website, e-commerce, custom design, etc. FEATURE SELECTION - Walk through options: number of pages, custom forms, SEO, etc. DESIGN COMPLEXITY - Explain different design tiers and their benefits. TIMELINE OPTIONS - Show how timeline affects pricing. ADD-ON SERVICES - Present additional services like hosting, maintenance, marketing. REAL-TIME UPDATES - Show how selections affect the total price.",
        type: "text"
      },
      {
        id: "slide-5",
        title: "Presenting Pricing Strategically",
        content: "Present pricing to maximize conversion: START WITH VALUE - Explain benefits before showing price. USE ANCHORING - Show premium option first, then present recommended package. BREAK DOWN COSTS - Explain what's included in each price tier. COMPARE OPTIONS - Use side-by-side comparison to highlight value. ADDRESS BUDGET - 'What budget range were you considering for this project?' PAYMENT OPTIONS - Show monthly payment plans to reduce sticker shock. JUSTIFY PRICING - Explain why quality web design is an investment, not an expense.",
        type: "text"
      },
      {
        id: "slide-6",
        title: "Handling Price Objections",
        content: "Turn price concerns into opportunities: ACKNOWLEDGE CONCERNS - 'I understand budget is important to you.' FOCUS ON ROI - 'Let's look at how this investment will pay for itself.' BREAK DOWN VALUE - 'This works out to just $X per day for a 24/7 sales tool.' OFFER ALTERNATIVES - 'We can phase the project to fit your budget.' COMPARE COSTS - 'Compare this to the cost of losing customers to competitors.' USE SOCIAL PROOF - 'Similar businesses typically see X% increase in leads.' CREATE URGENCY - 'We have a special rate available this month.'",
        type: "text"
      },
      {
        id: "slide-7",
        title: "Customizing Quotes in Real-Time",
        content: "Adapt quotes based on client feedback: LISTEN ACTIVELY - Pay attention to their reactions and concerns. ADJUST FEATURES - Remove or add features based on their needs. MODIFY TIMELINES - Show how faster delivery affects pricing. BUNDLE SERVICES - Create packages that provide better value. SHOW ALTERNATIVES - 'If that's outside your budget, here's another option.' EXPLAIN TRADE-OFFS - Help them understand what they get at each price point. SAVE MULTIPLE VERSIONS - Create different quote options for comparison.",
        type: "text"
      },
      {
        id: "slide-8",
        title: "Closing with the Quote",
        content: "Convert quotes into signed contracts: SUMMARIZE BENEFITS - Recap what they'll receive and the value. CREATE URGENCY - 'To secure this pricing, we need to move forward by...' ASK FOR THE SALE - 'Which option works best for your business?' HANDLE FINAL OBJECTIONS - Address any remaining concerns. EXPLAIN NEXT STEPS - 'Once you approve this quote, here's what happens next.' SEND IMMEDIATELY - 'I'm sending this quote to your email right now.' SCHEDULE FOLLOW-UP - 'When would be a good time to discuss any questions?'",
        type: "text"
      },
      {
        id: "slide-9",
        title: "Post-Quote Follow-Up",
        content: "Maximize conversion after sending the quote: IMMEDIATE CONFIRMATION - Send quote via email within minutes of the call. PERSONALIZED MESSAGE - Include a summary of what was discussed. SET EXPECTATIONS - 'I'll follow up in 2 days to answer any questions.' PROVIDE RESOURCES - Include portfolio examples and testimonials. MAKE IT EASY - Include clear next steps and contact information. TRACK ENGAGEMENT - Monitor if they open and review the quote. STRATEGIC FOLLOW-UP - Call back at the promised time with additional value.",
        type: "text"
      },
      {
        id: "slide-10",
        title: "Advanced Quote Strategies",
        content: "Elevate your quote presentations: MULTIPLE OPTIONS - Always present 3 tiers (good, better, best). PSYCHOLOGICAL PRICING - Use prices ending in 7 or 9 for better perception. SEASONAL PROMOTIONS - Leverage holidays and business cycles. COMPETITOR COMPARISONS - Show value against cheaper alternatives. CASE STUDIES - Share success stories during the quote process. VISUAL MOCKUPS - Show quick design concepts to increase excitement. PARTNERSHIP APPROACH - Position yourself as a business partner, not just a vendor.",
        type: "text"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "What should you do before starting the quote process on a call?",
        options: ["Jump straight into pricing", "Research the lead and prepare your workspace", "Only ask about their budget", "Start with the most expensive option"],
        correctAnswer: 1,
        explanation: "Proper preparation including lead research and workspace setup is crucial for successful quote calls."
      },
      {
        id: "q2",
        question: "What is the best way to present pricing options?",
        options: ["Show the cheapest option first", "Only show one option", "Present 3 tiers with the premium option first", "Focus only on features, not price"],
        correctAnswer: 2,
        explanation: "Presenting 3 tiers with anchoring (premium first) helps clients see value and choose the middle option."
      },
      {
        id: "q3",
        question: "How should you handle price objections during a quote call?",
        options: ["Immediately offer a discount", "Acknowledge concerns and focus on ROI and value", "End the call quickly", "Argue about the pricing"],
        correctAnswer: 1,
        explanation: "Acknowledging concerns and redirecting to ROI and value helps overcome price objections effectively."
      },
      {
        id: "q4",
        question: "What should you do immediately after completing a quote call?",
        options: ["Wait a week before following up", "Send the quote via email with a personalized message", "Only call them back if they contact you first", "Send a generic quote template"],
        correctAnswer: 1,
        explanation: "Immediate follow-up with a personalized quote email maintains momentum and shows professionalism."
      },
      {
        id: "q5",
        question: "What is the most effective way to customize quotes in real-time?",
        options: ["Stick to pre-made packages only", "Listen actively and adjust features based on client feedback", "Always recommend the most expensive option", "Avoid making any changes during the call"],
        correctAnswer: 1,
        explanation: "Active listening and real-time customization shows responsiveness and helps create the perfect solution."
      }
    ]
  },
  {
    id: "building-value-sales",
    title: "Building Value - Advanced Sales Techniques",
    description: "Master the art of building value with prospects using ROI calculators, competitor analysis tools, and website audit component",
    category: "Sales",
    difficulty: "Advanced",
    estimatedTime: 85,
    role: "Sales Rep",
    passingScore: 80,
    slides: [
      {
        id: "slide-1",
        title: "Introduction to Value Building",
        content: "Value building is the foundation of successful sales. It's about demonstrating how your solution provides more benefit than it costs. Key principles include: QUANTIFIABLE BENEFITS - Show measurable returns on investment. EMOTIONAL CONNECTION - Address pain points and aspirations. COMPETITIVE DIFFERENTIATION - Highlight unique advantages over alternatives. RISK MITIGATION - Demonstrate how you reduce business risks. FUTURE VISION - Help prospects see their improved future state. COST OF INACTION - Show what happens if they don't act.",
        type: "text"
      },
      {
        id: "slide-2",
        title: "Understanding Value Perception",
        content: "Value is subjective and varies by stakeholder. Consider different perspectives: CFO PERSPECTIVE - Focus on ROI, cost savings, and financial metrics. CEO PERSPECTIVE - Strategic advantages, competitive edge, growth potential. OPERATIONS PERSPECTIVE - Efficiency gains, time savings, process improvements. IT PERSPECTIVE - Technical benefits, security, scalability, integration. END USER PERSPECTIVE - Ease of use, productivity gains, job satisfaction. PROCUREMENT PERSPECTIVE - Total cost of ownership, vendor reliability, contract terms.",
        type: "text"
      },
      {
        id: "slide-3",
        title: "Value Discovery Process",
        content: "Uncover value opportunities through strategic questioning: CURRENT STATE ANALYSIS - 'What challenges are you facing with your current solution?' IMPACT ASSESSMENT - 'How much time/money does this problem cost you monthly?' PRIORITY IDENTIFICATION - 'What would solving this problem mean for your business?' STAKEHOLDER MAPPING - 'Who else is affected by this challenge?' SUCCESS METRICS - 'How would you measure success with a new solution?' TIMELINE URGENCY - 'What happens if this isn't resolved in the next 6 months?' BUDGET IMPLICATIONS - 'What's the cost of maintaining the status quo?'",
        type: "text"
      },
      {
        id: "slide-4",
        title: "Using the ROI Calculator - Setup",
        content: "The ROI calculator is a powerful tool for quantifying value. Setup process: ACCESS THE TOOL - Navigate to Tools > ROI Calculator in the CRM. CLIENT INFORMATION - Enter prospect's company name and industry. BASELINE DATA - Input current costs, time spent, and efficiency metrics. PROBLEM AREAS - Identify specific pain points and their costs. SOLUTION MAPPING - Match your services to their problems. TIMEFRAME - Set realistic implementation and payback periods. ASSUMPTIONS - Document all assumptions for transparency.",
        type: "text"
      },
      {
        id: "slide-5",
        title: "ROI Calculator - Data Input",
        content: "Accurate data input ensures credible ROI projections: CURRENT COSTS - Labor costs, software licenses, maintenance fees, opportunity costs. EFFICIENCY METRICS - Time spent on manual processes, error rates, rework costs. REVENUE IMPACT - Lost sales due to inefficiencies, customer churn costs. GROWTH CONSTRAINTS - Limitations preventing business expansion. RISK FACTORS - Compliance costs, security vulnerabilities, downtime expenses. COMPETITIVE DISADVANTAGES - Market share loss, pricing pressure. Always validate numbers with the prospect and document sources.",
        type: "text"
      },
      {
        id: "slide-6",
        title: "ROI Calculator - Benefit Projection",
        content: "Project realistic benefits from your solution: DIRECT SAVINGS - Reduced labor costs, eliminated software fees, lower maintenance. EFFICIENCY GAINS - Time savings converted to dollar value, reduced errors, faster processes. REVENUE INCREASES - New sales opportunities, improved customer retention, upselling potential. RISK REDUCTION - Avoided compliance fines, reduced security breaches, minimized downtime. COMPETITIVE ADVANTAGES - Market share gains, premium pricing ability. Use conservative estimates and provide best/worst case scenarios.",
        type: "text"
      },
      {
        id: "slide-7",
        title: "ROI Calculator - Presenting Results",
        content: "Present ROI calculations professionally and persuasively: EXECUTIVE SUMMARY - Lead with key metrics: ROI percentage, payback period, net benefit. METHODOLOGY - Explain how calculations were performed and assumptions made. VISUAL CHARTS - Use graphs to show ROI over time, break-even analysis, cumulative benefits. SENSITIVITY ANALYSIS - Show how results change with different assumptions. COMPARISON SCENARIOS - Present multiple options with different investment levels. RISK MITIGATION - Address potential concerns about projections. NEXT STEPS - Clear path forward to realize these benefits.",
        type: "text"
      },
      {
        id: "slide-8",
        title: "Competitor Analysis Tool - Overview",
        content: "The competitor analysis tool helps position your solution effectively: TOOL ACCESS - Navigate to Tools > Competitor Analysis in the CRM. COMPETITOR DATABASE - Pre-loaded information on major competitors. FEATURE COMPARISON - Side-by-side comparison of capabilities. PRICING ANALYSIS - Cost comparison across different scenarios. STRENGTH/WEAKNESS MATRIX - Objective assessment of all options. CUSTOMER REVIEWS - Real feedback from users of competing solutions. WIN/LOSS TRACKING - Historical data on competitive situations.",
        type: "text"
      },
      {
        id: "slide-9",
        title: "Competitive Positioning Strategies",
        content: "Use competitor analysis to position your solution advantageously: DIRECT COMPARISON - When you have clear advantages, compare feature-by-feature. REFRAME THE CRITERIA - Shift focus to areas where you excel. TOTAL COST ANALYSIS - Include implementation, training, and ongoing costs. RISK ASSESSMENT - Highlight risks of choosing competitors. INNOVATION FOCUS - Emphasize your latest features and roadmap. SUPPORT QUALITY - Differentiate on service and support levels. CASE STUDIES - Share success stories from competitive wins.",
        type: "text"
      },
      {
        id: "slide-10",
        title: "Handling Competitive Objections",
        content: "Turn competitive challenges into opportunities: ACKNOWLEDGE STRENGTHS - 'Yes, Competitor X does have that feature.' REDIRECT TO VALUE - 'However, let's look at what matters most to your business.' QUESTION ASSUMPTIONS - 'What specific aspect of their solution appeals to you?' HIGHLIGHT GAPS - 'Have you considered how they handle [specific scenario]?' REFERENCE CUSTOMERS - 'We've helped several clients switch from them because...' FUTURE VISION - 'While they focus on today's needs, we're building for tomorrow.' TOTAL EXPERIENCE - 'It's not just about features, but the entire partnership.'",
        type: "text"
      },
      {
        id: "slide-11",
        title: "Value Stacking Techniques",
        content: "Layer multiple value propositions for maximum impact: PRIMARY VALUE - The main benefit that solves their biggest problem. SECONDARY BENEFITS - Additional advantages that support the primary value. RISK MITIGATION - How you reduce various business risks. FUTURE OPPORTUNITIES - Potential for growth and expansion. INTANGIBLE BENEFITS - Improved morale, brand reputation, competitive positioning. EXCLUSIVE ADVANTAGES - Unique features or services only you provide. PARTNERSHIP VALUE - Long-term relationship benefits beyond the product.",
        type: "text"
      },
      {
        id: "slide-12",
        title: "Value Communication Best Practices",
        content: "Communicate value effectively to different audiences: EXECUTIVE PRESENTATIONS - Focus on strategic impact and financial returns. TECHNICAL DEMOS - Highlight capabilities and integration benefits. PROCUREMENT MEETINGS - Emphasize total cost of ownership and vendor stability. USER TRAINING - Show ease of use and productivity improvements. BOARD PRESENTATIONS - Connect to company goals and competitive advantage. FOLLOW-UP MATERIALS - Provide detailed ROI reports and case studies. PROPOSAL WRITING - Structure proposals around value themes, not just features.",
        type: "text"
      },
      {
        id: "slide-13",
        title: "Website Audit Component - Building Value Through Analysis",
        content: "The Website Audit Component is a powerful value-building tool that demonstrates expertise and uncovers opportunities: **ACCESSING THE WEBSITE AUDIT TOOL** • Navigate to Tools > Website Audit in the CRM • Enter prospect's website URL for comprehensive analysis • Generate detailed reports covering technical SEO, performance, and user experience • Use findings to build compelling value propositions **KEY AUDIT AREAS FOR VALUE BUILDING** • **Technical SEO Issues** - Broken links, missing meta tags, crawl errors that hurt search rankings • **Page Speed Performance** - Loading times that impact user experience and conversions • **Mobile Responsiveness** - Mobile optimization issues affecting 60% of web traffic • **Security Vulnerabilities** - SSL certificates, security headers, and trust signals • **Content Analysis** - Duplicate content, thin pages, missing optimization opportunities • **Competitor Comparison** - How their site performs against industry leaders **PRESENTING AUDIT RESULTS FOR MAXIMUM IMPACT** • **Problem Identification** - Clearly highlight critical issues affecting their business • **Impact Quantification** - Show how issues translate to lost revenue and opportunities • **Solution Mapping** - Connect each problem to specific services you provide • **Priority Matrix** - Rank issues by impact and effort to create actionable roadmap • **ROI Projections** - Calculate potential gains from fixing identified issues • **Competitive Advantage** - Show how improvements will outperform competitors **USING AUDIT DATA IN SALES CONVERSATIONS** • Lead with most impactful findings that resonate with their business goals • Use visual reports and screenshots to make technical issues understandable • Create urgency by highlighting security risks and competitive disadvantages • Position yourself as the expert who identified issues others missed • Provide quick wins alongside long-term strategic recommendations",
        type: "text"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "What is the most important principle of value building?",
        options: ["Showing the lowest price", "Demonstrating quantifiable benefits that exceed costs", "Highlighting all available features", "Focusing only on technical capabilities"],
        correctAnswer: 1,
        explanation: "Value building is about demonstrating how your solution provides more benefit than it costs, with quantifiable returns."
      },
      {
        id: "q2",
        question: "When using the ROI calculator, what should you do with your assumptions?",
        options: ["Keep them secret", "Use the most optimistic projections", "Document them transparently and validate with the prospect", "Only include conservative estimates"],
        correctAnswer: 2,
        explanation: "Transparency and validation of assumptions builds credibility and trust in your ROI projections."
      },
      {
        id: "q3",
        question: "How should you handle a competitor's strength during a sales conversation?",
        options: ["Ignore it completely", "Acknowledge it, then redirect to your unique value", "Attack the competitor directly", "Lower your price immediately"],
        correctAnswer: 1,
        explanation: "Acknowledging competitor strengths shows honesty, then redirecting to your value maintains competitive positioning."
      },
      {
        id: "q4",
        question: "What is value stacking?",
        options: ["Listing all product features", "Layering multiple value propositions for maximum impact", "Comparing prices with competitors", "Showing only the primary benefit"],
        correctAnswer: 1,
        explanation: "Value stacking involves layering multiple value propositions to create a compelling overall value proposition."
      },
      {
        id: "q5",
        question: "When presenting ROI calculations, what should you include?",
        options: ["Only the final ROI percentage", "Executive summary, methodology, visual charts, and sensitivity analysis", "Just the break-even point", "Only best-case scenarios"],
        correctAnswer: 1,
        explanation: "Comprehensive ROI presentations include summary, methodology, visuals, and sensitivity analysis for credibility."
      },
      {
        id: "q6",
        question: "What perspective should you consider when building value for a CFO?",
        options: ["Ease of use and productivity", "Technical capabilities and integration", "ROI, cost savings, and financial metrics", "Strategic advantages only"],
        correctAnswer: 2,
        explanation: "CFOs are primarily concerned with financial impact, ROI, cost savings, and measurable financial metrics."
      },
      {
        id: "q7",
        question: "What is the primary purpose of using the Website Audit Component in sales conversations?",
        options: ["To criticize the prospect's current website", "To demonstrate expertise and uncover value-building opportunities", "To show off technical knowledge", "To delay the sales process"],
        correctAnswer: 1,
        explanation: "The Website Audit Component helps demonstrate expertise while identifying specific problems that translate into value-building opportunities and solutions."
      }
    ]
  },
  {
    id: "creating-notes-basics",
    title: "Creating Notes",
    description: "Learn how to effectively create and manage notes using the Notes Component for better client relationship management",
    category: "Sales",
    difficulty: "Beginner",
    estimatedTime: 20,
    role: "Sales Rep",
    passingScore: 80,
    slides: [
      {
        id: "slide-1",
        title: "Introduction to Notes Component",
        content: "**WHY NOTES MATTER** • Track all client interactions and conversations • Build comprehensive client history for better service • Share important information with team members • Never forget important details or follow-up items **ACCESSING THE NOTES COMPONENT** • Navigate to the Notes section in the main menu • Click on 'Notes' in the sidebar navigation • The Notes interface will display all your existing notes",
        type: "text"
      },
      {
        id: "slide-2",
        title: "Creating Your First Note",
        content: "**STEP-BY-STEP NOTE CREATION** 1. Click the '+ New Note' button in the Notes interface 2. Select the client/lead from the dropdown menu 3. Choose the appropriate note category (Call, Meeting, Email, etc.) 4. Add a clear, descriptive title for your note 5. Write detailed content in the note body **BEST PRACTICES FOR NOTE TITLES** • Use clear, searchable titles • Include date and interaction type • Example: 'Initial Discovery Call - 12/15/2024' • Example: 'Follow-up Email Response - Project Requirements'",
        type: "text"
      },
      {
        id: "slide-3",
        title: "Note Categories and Organization",
        content: "**AVAILABLE NOTE CATEGORIES** • **Call Notes** - Phone conversations and outcomes • **Meeting Notes** - In-person or virtual meeting summaries • **Email Notes** - Important email exchanges • **Task Notes** - Action items and follow-ups • **General Notes** - Miscellaneous important information **ORGANIZING YOUR NOTES** • Use consistent categorization for easy filtering • Tag notes with relevant keywords • Link notes to specific clients or projects • Set priority levels for urgent follow-ups",
        type: "text"
      },
      {
        id: "slide-4",
        title: "Writing Effective Note Content",
        content: "**WHAT TO INCLUDE IN YOUR NOTES** • Date and time of interaction • Key discussion points and decisions made • Client concerns, objections, or questions • Next steps and action items • Important personal details about the client **NOTE WRITING BEST PRACTICES** • Be specific and detailed but concise • Use bullet points for easy scanning • Include exact quotes when relevant • Note client preferences and communication style • Always include follow-up actions with deadlines",
        type: "text"
      },
      {
        id: "slide-5",
        title: "Searching and Managing Notes",
        content: "**FINDING YOUR NOTES QUICKLY** • Use the search bar to find notes by keyword • Filter by client name, category, or date range • Sort notes by creation date or last modified • Use tags to group related notes together **EDITING AND UPDATING NOTES** • Click on any note to edit its content • Add updates as situations develop • Mark notes as resolved when action items are complete • Archive old notes to keep your workspace clean",
        type: "text"
      },
      {
        id: "slide-6",
        title: "Team Collaboration with Notes",
        content: "**SHARING NOTES WITH TEAM MEMBERS** • Use @mentions to notify specific team members • Share important client insights across the team • Collaborate on complex deals with shared notes • Maintain consistency in client communication **PRIVACY AND PERMISSIONS** • Understand which notes are private vs. shared • Respect client confidentiality in shared notes • Use appropriate access levels for sensitive information • Follow company policies for note sharing",
        type: "text"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "What is the first step to create a new note in the Notes Component?",
        options: ["Select a client from the dropdown", "Click the '+ New Note' button", "Choose a note category", "Write the note title"],
        correctAnswer: 1,
        explanation: "You must first click the '+ New Note' button to start the note creation process."
      },
      {
        id: "q2",
        question: "Which of these should always be included in your note content?",
        options: ["Client's personal hobbies", "Next steps and action items", "Weather conditions", "Your lunch plans"],
        correctAnswer: 1,
        explanation: "Next steps and action items are crucial for maintaining momentum and ensuring follow-through."
      },
      {
        id: "q3",
        question: "What is a best practice for note titles?",
        options: ["Keep them as short as possible", "Use only the client's name", "Include date and interaction type", "Use only numbers for organization"],
        correctAnswer: 2,
        explanation: "Including date and interaction type makes notes easily searchable and provides immediate context."
      },
      {
        id: "q4",
        question: "How can you quickly find specific notes in the system?",
        options: ["Scroll through all notes manually", "Use the search bar and filters", "Ask a colleague to find them", "Recreate the note from memory"],
        correctAnswer: 1,
        explanation: "The search bar and filtering options are the most efficient ways to locate specific notes quickly."
      }
    ]
  },
  {
    id: "email-component-basics",
    title: "Email Component Mastery",
    description: "Learn how to effectively use the Email Component for professional client communication and relationship building",
    category: "Sales",
    difficulty: "Beginner",
    estimatedTime: 25,
    role: "Sales Rep",
    passingScore: 80,
    slides: [
      {
        id: "slide-1",
        title: "Introduction to Email Component",
        content: "**WHY EMAIL MATTERS IN SALES** • Primary communication channel for most business interactions • Creates documented history of all client conversations • Enables professional, trackable communication • Integrates seamlessly with CRM for complete client view **ACCESSING THE EMAIL COMPONENT** • Navigate to the Email section in the main menu • Click on 'Email' in the sidebar navigation • Access integrated email directly from client profiles • Use quick email actions from leads and opportunities",
        type: "text"
      },
      {
        id: "slide-2",
        title: "Composing Professional Emails",
        content: "**EMAIL COMPOSITION BEST PRACTICES** 1. Click 'Compose' or '+ New Email' button 2. Select recipient from CRM contacts or enter manually 3. Write clear, specific subject lines 4. Use professional greeting and closing 5. Keep content focused and actionable **SUBJECT LINE GUIDELINES** • Be specific and descriptive • Include action items when relevant • Example: 'Follow-up: Web Design Proposal - Next Steps' • Example: 'Meeting Confirmation: Discovery Call Tomorrow 2PM' • Avoid spam trigger words and excessive punctuation",
        type: "text"
      },
      {
        id: "slide-3",
        title: "Email Templates and Personalization",
        content: "**USING EMAIL TEMPLATES** • Access pre-built templates for common scenarios • Customize templates with client-specific information • Save frequently used emails as new templates • Maintain consistent brand voice across communications **PERSONALIZATION STRATEGIES** • Use client's name and company details • Reference previous conversations and interactions • Include relevant case studies or examples • Mention specific pain points discussed • Add personal touches based on client preferences",
        type: "text"
      },
      {
        id: "slide-4",
        title: "Email Tracking and Analytics",
        content: "**TRACKING EMAIL PERFORMANCE** • Monitor email opens and click-through rates • Track when recipients view attachments • See response times and engagement patterns • Identify most effective subject lines and content **USING TRACKING DATA** • Follow up on opened but unanswered emails • Adjust timing based on open patterns • Improve content based on engagement metrics • Schedule follow-ups for unopened emails • Analyze which templates perform best",
        type: "text"
      },
      {
        id: "slide-5",
        title: "Managing Email Conversations",
        content: "**ORGANIZING EMAIL THREADS** • Keep related emails in organized threads • Use clear subject line updates for topic changes • Archive completed conversations • Flag important emails for follow-up • Link emails to specific deals or projects **EMAIL WORKFLOW MANAGEMENT** • Set up email filters and rules • Use labels and folders for organization • Schedule emails for optimal send times • Set reminders for follow-up actions • Integrate with task management system",
        type: "text"
      },
      {
        id: "slide-6",
        title: "Email Automation and Follow-up",
        content: "**AUTOMATED EMAIL SEQUENCES** • Set up drip campaigns for lead nurturing • Create automated follow-up sequences • Use triggers based on client actions • Schedule reminder emails for important dates • Automate thank you and confirmation emails **FOLLOW-UP BEST PRACTICES** • Follow up within 24 hours of meetings • Send recap emails after important calls • Set calendar reminders for follow-up timing • Use progressive follow-up strategies • Know when to stop following up and try different channels",
        type: "text"
      },
      {
        id: "slide-7",
        title: "Email Security and Compliance",
        content: "**EMAIL SECURITY MEASURES** • Use secure email protocols and encryption • Verify recipient addresses before sending • Be cautious with sensitive client information • Follow company data protection policies • Report suspicious emails or security concerns **COMPLIANCE CONSIDERATIONS** • Respect unsubscribe requests immediately • Include required legal disclaimers • Follow CAN-SPAM and GDPR regulations • Maintain email retention policies • Document consent for marketing communications",
        type: "text"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "What is the most important element of an effective email subject line?",
        options: ["Using all capital letters", "Being specific and descriptive", "Including multiple exclamation points", "Making it as long as possible"],
        correctAnswer: 1,
        explanation: "Specific and descriptive subject lines help recipients understand the email's purpose and increase open rates."
      },
      {
        id: "q2",
        question: "How should you personalize emails to clients?",
        options: ["Use the same template for everyone", "Only include their name", "Reference previous conversations and specific details", "Add random personal information"],
        correctAnswer: 2,
        explanation: "Referencing previous conversations and specific client details shows attention and builds stronger relationships."
      },
      {
        id: "q3",
        question: "What should you do with an email that was opened but not responded to?",
        options: ["Never follow up", "Send the same email again immediately", "Schedule a strategic follow-up", "Remove them from your contact list"],
        correctAnswer: 2,
        explanation: "Strategic follow-ups on opened emails can re-engage prospects who showed initial interest."
      },
      {
        id: "q4",
        question: "How quickly should you follow up after a client meeting?",
        options: ["Within a week", "Within 24 hours", "Within a month", "Only if they contact you first"],
        correctAnswer: 1,
        explanation: "Following up within 24 hours shows professionalism and keeps momentum from the meeting."
      },
      {
        id: "q5",
        question: "What is a key benefit of using email templates?",
        options: ["They eliminate the need for personalization", "They ensure consistent brand voice and save time", "They guarantee higher response rates", "They can be sent to anyone without modification"],
        correctAnswer: 1,
        explanation: "Email templates maintain consistent brand voice while saving time, but should still be personalized for each recipient."
      }
    ]
  },
  {
    id: "calendar-component-mastery",
    title: "Calendar Component Mastery",
    description: "Master the Calendar Component for efficient scheduling, appointment management, and time organization in your sales workflow",
    category: "CRM Usage",
    difficulty: "Intermediate",
    estimatedTime: 30,
    role: "All",
    passingScore: 80,
    slides: [
      {
        id: "slide-1",
        title: "Introduction to Calendar Component",
        content: "**WHY CALENDAR MANAGEMENT IS CRUCIAL** • Centralized scheduling prevents double-booking and missed appointments • Integrated calendar syncs with CRM for complete client timeline • Automated reminders reduce no-shows and improve client experience • Time blocking increases productivity and focus • Visual scheduling helps identify availability patterns **ACCESSING THE CALENDAR COMPONENT** • Navigate to Calendar in the main sidebar • Access from Dashboard quick actions • Integrate with client profiles for appointment scheduling • Use mobile app for on-the-go calendar management",
        type: "text"
      },
      {
        id: "slide-2",
        title: "Creating and Managing Appointments",
        content: "**CREATING NEW APPOINTMENTS** 1. Click '+ New Event' or click on desired time slot 2. Select appointment type (Call, Meeting, Demo, Follow-up) 3. Add client/lead from CRM contacts 4. Set date, time, and duration 5. Add location (office, virtual, client site) 6. Include agenda and preparation notes **APPOINTMENT TYPES AND SETTINGS** • **Discovery Calls** - Initial client meetings (60-90 minutes) • **Follow-up Calls** - Check-ins and updates (15-30 minutes) • **Demos** - Product presentations (45-60 minutes) • **Closing Meetings** - Contract discussions (60-90 minutes) • **Internal Meetings** - Team coordination (30-60 minutes)",
        type: "text"
      },
      {
        id: "slide-3",
        title: "Calendar Views and Navigation",
        content: "**CALENDAR VIEW OPTIONS** • **Day View** - Detailed hourly schedule for focused daily planning • **Week View** - 7-day overview for weekly planning and availability • **Month View** - High-level monthly planning and deadline tracking • **Agenda View** - List format for chronological appointment review **NAVIGATION BEST PRACTICES** • Use keyboard shortcuts for quick navigation • Color-code different appointment types • Set default view based on your planning style • Use mini-calendar for quick date jumping • Filter by appointment type or client for focused viewing",
        type: "text"
      },
      {
        id: "slide-4",
        title: "Time Blocking and Productivity",
        content: "**EFFECTIVE TIME BLOCKING STRATEGIES** • **Focus Blocks** - 2-3 hour periods for deep work and proposal writing • **Call Blocks** - Dedicated times for outbound prospecting • **Admin Blocks** - CRM updates, email, and administrative tasks • **Buffer Time** - 15-30 minutes between appointments for preparation • **Travel Time** - Account for commute between client meetings **PRODUCTIVITY OPTIMIZATION** • Block similar activities together for efficiency • Schedule demanding tasks during your peak energy hours • Use recurring events for regular activities • Set realistic time estimates to avoid rushing • Include preparation and follow-up time in scheduling",
        type: "text"
      },
      {
        id: "slide-5",
        title: "Client Scheduling and Availability",
        content: "**SHARING AVAILABILITY WITH CLIENTS** • Use calendar sharing links for client self-scheduling • Set availability windows that work for your schedule • Include buffer time between client appointments • Block personal time to maintain work-life balance • Update availability in real-time to prevent conflicts **CLIENT SCHEDULING BEST PRACTICES** • Offer 2-3 time options when proposing meetings • Confirm time zones for virtual meetings • Send calendar invites immediately after scheduling • Include meeting agenda and preparation materials • Set up automatic reminder sequences",
        type: "text"
      },
      {
        id: "slide-6",
        title: "Reminders and Notifications",
        content: "**SETTING UP EFFECTIVE REMINDERS** • **24-hour reminder** - Allows time for preparation and rescheduling • **2-hour reminder** - Final preparation and travel planning • **15-minute reminder** - Last-minute preparation and mindset shift • **Client reminders** - Automated emails/SMS to reduce no-shows **NOTIFICATION MANAGEMENT** • Customize notification preferences for different appointment types • Set up escalating reminders for important meetings • Use different notification methods (email, SMS, push) • Configure team notifications for shared appointments • Set quiet hours to avoid after-hours interruptions",
        type: "text"
      },
      {
        id: "slide-7",
        title: "Calendar Integration and Sync",
        content: "**EXTERNAL CALENDAR INTEGRATION** • Sync with Google Calendar, Outlook, or Apple Calendar • Two-way sync ensures all appointments are visible everywhere • Prevent double-booking across multiple calendar systems • Maintain consistent scheduling across all platforms **CRM INTEGRATION BENEFITS** • Automatic client history updates from calendar events • Link appointments to deals and opportunities • Track meeting outcomes and follow-up actions • Generate reports on time spent with different clients • Sync contact information and meeting notes",
        type: "text"
      },
      {
        id: "slide-8",
        title: "Team Calendar Coordination",
        content: "**TEAM SCHEDULING FEATURES** • View team member availability for collaborative scheduling • Schedule group meetings with automatic conflict detection • Share calendars with appropriate team members • Coordinate client handoffs and team meetings • Use resource booking for conference rooms and equipment **COLLABORATION BEST PRACTICES** • Respect team members' blocked time and focus periods • Use shared calendars for team events and deadlines • Communicate schedule changes promptly • Coordinate client meetings that require multiple team members • Maintain visibility into team capacity and workload",
        type: "text"
      },
      {
        id: "slide-9",
        title: "Mobile Calendar Management",
        content: "**MOBILE CALENDAR FEATURES** • Access full calendar functionality on mobile devices • Quick appointment creation and editing on-the-go • Real-time sync between desktop and mobile • GPS integration for location-based reminders • Offline access for viewing scheduled appointments **MOBILE BEST PRACTICES** • Enable location services for travel time estimates • Use voice-to-text for quick appointment notes • Set up mobile-specific notification preferences • Download offline maps for client locations • Keep mobile calendar app updated for best performance",
        type: "text"
      },
      {
        id: "slide-10",
        title: "Calendar Analytics and Reporting",
        content: "**TRACKING CALENDAR METRICS** • Monitor appointment-to-close ratios • Track time spent in different activity types • Analyze peak productivity hours and days • Measure client meeting frequency and outcomes • Identify scheduling patterns and optimization opportunities **USING CALENDAR DATA FOR IMPROVEMENT** • Optimize schedule based on energy and productivity patterns • Identify and eliminate time-wasting activities • Balance prospecting time with client service • Track progress toward activity-based goals • Use data to justify schedule changes and boundaries",
        type: "text"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "What is the recommended buffer time between client appointments?",
        options: ["5 minutes", "15-30 minutes", "1 hour", "No buffer time needed"],
        correctAnswer: 1,
        explanation: "15-30 minutes between appointments allows for preparation, travel time, and prevents rushing between meetings."
      },
      {
        id: "q2",
        question: "Which calendar view is best for detailed daily planning?",
        options: ["Month View", "Week View", "Day View", "Agenda View"],
        correctAnswer: 2,
        explanation: "Day View provides hourly detail that's essential for focused daily planning and time management."
      },
      {
        id: "q3",
        question: "What should you include when creating a new client appointment?",
        options: ["Only the time and date", "Time, date, client, type, location, and agenda", "Just the client name", "Only the appointment duration"],
        correctAnswer: 1,
        explanation: "Complete appointment details ensure proper preparation and professional client experience."
      },
      {
        id: "q4",
        question: "How far in advance should you send the first reminder for important client meetings?",
        options: ["15 minutes", "2 hours", "24 hours", "1 week"],
        correctAnswer: 2,
        explanation: "24-hour reminders give both you and the client time for preparation and allow for rescheduling if needed."
      },
      {
        id: "q5",
        question: "What is a key benefit of time blocking in your calendar?",
        options: ["It makes your calendar look busy", "It groups similar activities for increased efficiency", "It prevents all meetings", "It eliminates the need for reminders"],
        correctAnswer: 1,
        explanation: "Time blocking groups similar activities together, reducing context switching and increasing overall productivity."
      },
      {
        id: "q6",
        question: "Why is calendar integration with CRM important?",
        options: ["It makes the calendar look more professional", "It automatically updates client history and links to deals", "It changes the calendar colors", "It only works with specific calendar apps"],
        correctAnswer: 1,
        explanation: "CRM integration ensures client interactions are tracked, linked to opportunities, and contribute to comprehensive client history."
      }
    ]
  },
  {
    id: "local-seo-mastery",
    title: "Local SEO Component Mastery",
    description: "Master the Local SEO Component to help clients dominate local search results and drive more local business through strategic optimization",
    category: "Best Practices",
    difficulty: "Advanced",
    estimatedTime: 45,
    role: "All",
    passingScore: 80,
    slides: [
      {
        id: "slide-1",
        title: "Introduction to Local SEO",
        content: "**WHY LOCAL SEO IS CRITICAL FOR BUSINESSES** • 46% of all Google searches are seeking local information • 76% of people who search for something nearby visit a business within 24 hours • 28% of local searches result in a purchase • Local SEO drives foot traffic and phone calls to physical businesses • Higher conversion rates compared to traditional SEO **ACCESSING THE LOCAL SEO COMPONENT** • Navigate to Local SEO in the main sidebar • Access from client profiles for location-specific optimization • Integrate with Google My Business management • Use analytics dashboard for performance tracking • Connect with review management systems",
        type: "text"
      },
      {
        id: "slide-2",
        title: "Google My Business Optimization",
        content: "**COMPLETE GMB PROFILE SETUP** 1. Verify business ownership through Google verification process 2. Add accurate business name, address, phone (NAP consistency) 3. Select precise business categories (primary + secondary) 4. Write compelling business description with local keywords 5. Add high-quality photos and videos 6. Set accurate business hours including holidays **GMB OPTIMIZATION BEST PRACTICES** • **Photos** - Upload 10+ high-quality images including exterior, interior, products, team • **Posts** - Regular updates about offers, events, news (weekly minimum) • **Q&A** - Monitor and respond to customer questions promptly • **Attributes** - Complete all relevant business attributes • **Services** - List all services with detailed descriptions",
        type: "text"
      },
      {
        id: "slide-3",
        title: "Local Keyword Research and Strategy",
        content: "**LOCAL KEYWORD RESEARCH PROCESS** • **Geographic Modifiers** - City, neighborhood, 'near me' variations • **Service + Location** - 'plumber in [city]', 'dentist near [landmark]' • **Local Intent Keywords** - 'best', 'top rated', 'reviews' combined with location • **Competitor Analysis** - Research what local competitors rank for • **Long-tail Opportunities** - Specific services + location combinations **KEYWORD IMPLEMENTATION STRATEGY** • **Title Tags** - Include primary keyword + location • **Meta Descriptions** - Compelling copy with local keywords • **Header Tags** - Structure content with local keyword hierarchy • **Content Optimization** - Natural integration throughout website copy • **URL Structure** - Include location in relevant page URLs",
        type: "text"
      },
      {
        id: "slide-4",
        title: "Local Citation Building and NAP Consistency",
        content: "**UNDERSTANDING LOCAL CITATIONS** • **Structured Citations** - Business directories with specific fields (name, address, phone) • **Unstructured Citations** - Mentions in blog posts, news articles, social media • **Industry-Specific Directories** - Niche directories relevant to business type • **Major Data Aggregators** - Infogroup, Localeze, Factual, Foursquare **NAP CONSISTENCY REQUIREMENTS** • **Exact Match** - Business name, address, phone must be identical across all platforms • **Format Standardization** - Consistent abbreviations, punctuation, spacing • **Phone Number Format** - Same format everywhere (xxx) xxx-xxxx vs xxx-xxx-xxxx • **Address Format** - Street vs St., Suite vs Ste., consistent formatting • **Regular Audits** - Monthly checks for accuracy and consistency",
        type: "text"
      },
      {
        id: "slide-5",
        title: "Local Content Marketing Strategy",
        content: "**LOCAL CONTENT TYPES AND STRATEGIES** • **Location Pages** - Dedicated pages for each service area with unique content • **Local News and Events** - Blog about community happenings and involvement • **Customer Success Stories** - Local case studies and testimonials • **Local Guides** - 'Best of [City]' guides related to your industry • **Community Involvement** - Sponsorships, charity work, local partnerships **CONTENT OPTIMIZATION TECHNIQUES** • **Local Schema Markup** - Structured data for business information • **Geo-targeted Landing Pages** - Specific pages for different service areas • **Local Link Building** - Partnerships with local businesses and organizations • **User-Generated Content** - Encourage customer photos and reviews • **Local Events Calendar** - Showcase participation in community events",
        type: "text"
      },
      {
        id: "slide-6",
        title: "Online Review Management",
        content: "**REVIEW PLATFORM STRATEGY** • **Google Reviews** - Primary focus for local search ranking • **Industry-Specific Platforms** - Yelp, TripAdvisor, Healthgrades, etc. • **Facebook Reviews** - Important for social proof and engagement • **Better Business Bureau** - Credibility and trust building • **Niche Review Sites** - Industry-specific review platforms **REVIEW ACQUISITION AND MANAGEMENT** • **Proactive Requests** - Systematic follow-up with satisfied customers • **Review Response Strategy** - Professional responses to all reviews (positive and negative) • **Review Monitoring** - Daily monitoring across all platforms • **Reputation Recovery** - Strategies for addressing negative reviews • **Review Analytics** - Track review volume, ratings, and sentiment trends",
        type: "text"
      },
      {
        id: "slide-7",
        title: "Local Link Building Strategies",
        content: "**LOCAL LINK BUILDING OPPORTUNITIES** • **Chamber of Commerce** - Local business organization memberships • **Local Newspapers** - Press releases and news coverage • **Community Organizations** - Sponsorships and partnerships • **Local Blogs** - Guest posting and collaboration • **Supplier and Vendor Relationships** - Mutual linking opportunities **ADVANCED LINK BUILDING TACTICS** • **Local Resource Pages** - Get listed on city and community resource pages • **Local Event Sponsorships** - Links from event websites and coverage • **Local Scholarship Programs** - Educational institution links • **HARO (Help a Reporter Out)** - Local expert positioning • **Broken Link Building** - Find and replace broken local links",
        type: "text"
      },
      {
        id: "slide-8",
        title: "Technical Local SEO Implementation",
        content: "**TECHNICAL SEO FUNDAMENTALS** • **Mobile Optimization** - Responsive design and fast mobile loading • **Page Speed Optimization** - Core Web Vitals and loading performance • **SSL Certificate** - Secure HTTPS implementation • **XML Sitemaps** - Include location pages and local content • **Robots.txt** - Proper crawling directives **LOCAL SCHEMA MARKUP** • **LocalBusiness Schema** - Structured data for business information • **Review Schema** - Markup for customer reviews • **Event Schema** - Local events and promotions • **FAQ Schema** - Common local questions and answers • **Breadcrumb Schema** - Navigation structure markup",
        type: "text"
      },
      {
        id: "slide-9",
        title: "Local SEO Analytics and Reporting",
        content: "**KEY LOCAL SEO METRICS** • **Local Pack Rankings** - Position in Google's local 3-pack • **Google My Business Insights** - Views, clicks, calls, direction requests • **Organic Local Rankings** - Position for local keyword terms • **Website Traffic from Local Search** - Geographic and local keyword traffic • **Conversion Tracking** - Calls, form fills, store visits from local search **REPORTING AND ANALYSIS TOOLS** • **Google Analytics** - Local traffic and conversion analysis • **Google Search Console** - Local search performance data • **GMB Insights** - Business profile performance metrics • **Local Rank Tracking Tools** - BrightLocal, Whitespark, Local Falcon • **Citation Tracking** - Monitor citation accuracy and growth",
        type: "text"
      },
      {
        id: "slide-10",
        title: "Local SEO Competitive Analysis",
        content: "**COMPETITOR RESEARCH METHODOLOGY** • **Local Pack Competitors** - Businesses appearing in local search results • **Organic Competitors** - Websites ranking for local keywords • **GMB Analysis** - Competitor Google My Business optimization • **Citation Analysis** - Where competitors are listed • **Review Analysis** - Competitor review strategies and reputation **COMPETITIVE INTELLIGENCE GATHERING** • **Keyword Gap Analysis** - Keywords competitors rank for that you don't • **Content Gap Analysis** - Local content opportunities competitors miss • **Link Gap Analysis** - Local link opportunities from competitor backlinks • **Local Ranking Factors** - What makes competitors successful locally • **Competitive Monitoring** - Regular tracking of competitor performance",
        type: "text"
      },
      {
        id: "slide-11",
        title: "Multi-Location SEO Management",
        content: "**MULTI-LOCATION STRATEGY FRAMEWORK** • **Individual Location Pages** - Unique content for each business location • **Location-Specific GMB Profiles** - Separate profiles for each location • **Localized Content Strategy** - Content tailored to each market • **Citation Management** - Consistent NAP for all locations • **Review Management** - Individual reputation management per location **SCALING LOCAL SEO EFFORTS** • **Template-Based Optimization** - Scalable processes for multiple locations • **Centralized vs. Localized Management** - Balance efficiency with local relevance • **Local Market Research** - Understanding each market's unique characteristics • **Performance Benchmarking** - Compare performance across locations • **Resource Allocation** - Prioritize locations based on opportunity and ROI",
        type: "text"
      },
      {
        id: "slide-12",
        title: "Local SEO Troubleshooting and Recovery",
        content: "**COMMON LOCAL SEO ISSUES** • **GMB Suspension** - Causes and recovery strategies • **Ranking Drops** - Identifying and addressing ranking declines • **Citation Inconsistencies** - Finding and fixing NAP discrepancies • **Duplicate Listings** - Identifying and merging duplicate business profiles • **Negative Reviews** - Reputation management and recovery strategies **RECOVERY AND OPTIMIZATION STRATEGIES** • **Algorithm Update Recovery** - Adapting to Google algorithm changes • **Penalty Recovery** - Addressing manual actions and algorithmic penalties • **Competitive Displacement** - Strategies to regain lost rankings • **Technical Issues** - Fixing crawling, indexing, and technical problems • **Performance Monitoring** - Ongoing monitoring and maintenance protocols",
        type: "text"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "What percentage of Google searches are seeking local information?",
        options: ["25%", "35%", "46%", "60%"],
        correctAnswer: 2,
        explanation: "46% of all Google searches are seeking local information, making local SEO crucial for businesses."
      },
      {
        id: "q2",
        question: "What does NAP stand for in local SEO?",
        options: ["Name, Address, Phone", "Network, Analytics, Performance", "Navigation, Accessibility, Performance", "News, Articles, Posts"],
        correctAnswer: 0,
        explanation: "NAP stands for Name, Address, Phone - the core business information that must be consistent across all online platforms."
      },
      {
        id: "q3",
        question: "Which is the most important review platform for local SEO?",
        options: ["Yelp", "Facebook", "Google Reviews", "TripAdvisor"],
        correctAnswer: 2,
        explanation: "Google Reviews are the most important for local SEO as they directly impact local search rankings and visibility."
      },
      {
        id: "q4",
        question: "What is the primary purpose of local schema markup?",
        options: ["Improve website design", "Provide structured data about business information", "Increase page loading speed", "Enhance social media presence"],
        correctAnswer: 1,
        explanation: "Local schema markup provides structured data that helps search engines understand and display business information correctly."
      },
      {
        id: "q5",
        question: "How often should you post updates to Google My Business?",
        options: ["Monthly", "Weekly minimum", "Daily", "Only when there are major updates"],
        correctAnswer: 1,
        explanation: "Regular GMB posts (weekly minimum) help maintain engagement and signal business activity to Google."
      },
      {
        id: "q6",
        question: "What is a local citation in SEO?",
        options: ["A legal document", "A mention of business NAP information online", "A customer review", "A social media post"],
        correctAnswer: 1,
        explanation: "A local citation is any online mention of a business's name, address, and phone number, which helps establish local authority."
      },
      {
        id: "q7",
        question: "Which factor is most critical for multi-location SEO success?",
        options: ["Using the same content for all locations", "Creating unique, localized content for each location", "Having one central GMB profile", "Focusing only on the main location"],
        correctAnswer: 1,
        explanation: "Unique, localized content for each location is critical for multi-location SEO success and avoiding duplicate content issues."
      },
      {
        id: "q8",
        question: "What should you do when responding to negative reviews?",
        options: ["Ignore them completely", "Argue with the customer publicly", "Respond professionally and offer to resolve the issue", "Delete the review"],
        correctAnswer: 2,
        explanation: "Professional responses to negative reviews that offer resolution demonstrate good customer service and can improve reputation."
      }
    ]
  },
  {
    id: "client-portal-mastery",
    title: "Client Portal Mastery for Sales Teams",
    description: "Master the client portal to enhance client relationships, streamline communication, and drive sales success through effective portal utilization",
    category: "Sales",
    difficulty: "Intermediate",
    estimatedTime: 40,
    role: "Sales Rep",
    passingScore: 80,
    slides: [
      {
        id: "slide-1",
        title: "Introduction to Client Portal",
        content: "**WHY THE CLIENT PORTAL IS ESSENTIAL FOR SALES SUCCESS** • Centralized hub for all client interactions and project information • 24/7 client access improves satisfaction and reduces support calls • Transparent project progress builds trust and credibility • Self-service capabilities free up sales time for revenue-generating activities • Professional presentation enhances your company's image **ACCESSING THE CLIENT PORTAL** • Navigate to Client Portal in the main CRM sidebar • Access from individual client profiles for direct portal management • Use the portal invitation system to onboard new clients • Monitor portal activity through analytics dashboard • Integrate portal access into your sales process",
        type: "text"
      },
      {
        id: "slide-2",
        title: "Setting Up Client Portal Access",
        content: "**CLIENT PORTAL SETUP PROCESS** 1. Navigate to the client's profile in your CRM 2. Click 'Invite Client to Portal' button 3. Customize the invitation message with personal touch 4. Set appropriate access permissions based on client needs 5. Send invitation and follow up to ensure successful login **PORTAL PERMISSION LEVELS** • **View Only** - Client can see project status and documents • **Interactive** - Client can comment, approve, and upload files • **Full Access** - Complete project collaboration capabilities • **Custom** - Tailored permissions for specific client requirements **BEST PRACTICES FOR PORTAL INVITATIONS** • Personalize invitation messages with client's name and project details • Include clear instructions for first-time login • Set expectations for portal usage and benefits • Follow up within 24 hours to ensure successful access • Provide training or walkthrough for complex projects",
        type: "text"
      },
      {
        id: "slide-3",
        title: "Portal Features and Client Benefits",
        content: "**KEY PORTAL FEATURES FOR CLIENTS** • **Project Dashboard** - Real-time project status and milestone tracking • **Document Library** - Secure access to all project files and deliverables • **Communication Hub** - Centralized messaging and comment system • **Approval Workflow** - Streamlined approval process for designs and content • **Invoice and Payment** - Easy access to billing information and payment options • **Timeline View** - Visual project timeline with key dates and deadlines **COMMUNICATING VALUE TO CLIENTS** • Emphasize 24/7 access to project information • Highlight improved communication and transparency • Demonstrate time savings through self-service features • Show professional presentation and organization • Explain security and data protection benefits • Position as premium service differentiator",
        type: "text"
      },
      {
        id: "slide-4",
        title: "Using Portal for Sales Presentations",
        content: "**PORTAL AS A SALES TOOL** • **Live Demonstrations** - Show portal during sales calls to demonstrate professionalism • **Competitive Advantage** - Highlight portal as differentiator from competitors • **Process Transparency** - Use portal to explain your project management approach • **Client Confidence** - Portal access builds trust in your capabilities • **Upselling Opportunities** - Portal features can justify premium pricing **SALES PRESENTATION STRATEGIES** • Screen share portal during virtual meetings • Create demo projects to showcase portal capabilities • Use portal analytics to show client engagement metrics • Demonstrate mobile accessibility for busy clients • Show integration with other business tools • Highlight security features for sensitive projects",
        type: "text"
      },
      {
        id: "slide-5",
        title: "Managing Client Communication Through Portal",
        content: "**EFFECTIVE PORTAL COMMUNICATION** • **Proactive Updates** - Regular project updates keep clients engaged • **Clear Messaging** - Use professional, clear language in all portal communications • **Timely Responses** - Respond to client portal messages within 4 hours • **Visual Communication** - Use screenshots and videos for complex explanations • **Status Updates** - Keep project status current to reduce client inquiries **COMMUNICATION BEST PRACTICES** • Set communication expectations upfront • Use portal messaging for project-related discussions • Keep email for urgent or sensitive matters • Document all decisions and approvals in portal • Create templates for common update messages • Use @mentions to direct attention to specific team members",
        type: "text"
      },
      {
        id: "slide-6",
        title: "Portal Analytics and Client Insights",
        content: "**UNDERSTANDING PORTAL ANALYTICS** • **Login Frequency** - Track how often clients access the portal • **Feature Usage** - See which portal features clients use most • **Document Downloads** - Monitor which files clients access • **Time Spent** - Understand client engagement levels • **Comment Activity** - Track client participation in discussions **USING ANALYTICS FOR SALES SUCCESS** • Identify highly engaged clients for upselling opportunities • Recognize clients who need more support or training • Use engagement data to improve portal experience • Track which features drive the most client satisfaction • Identify patterns in successful client relationships • Create data-driven proposals for portal improvements",
        type: "text"
      },
      {
        id: "slide-7",
        title: "Troubleshooting Common Portal Issues",
        content: "**COMMON CLIENT PORTAL PROBLEMS** • **Login Issues** - Password resets, account lockouts, browser compatibility • **Access Permissions** - Clients can't see expected content or features • **File Upload Problems** - Size limits, format restrictions, connection issues • **Mobile Access** - Responsive design issues or app-related problems • **Notification Settings** - Clients not receiving updates or receiving too many **RESOLUTION STRATEGIES** • Create step-by-step troubleshooting guides for common issues • Maintain updated FAQ section in portal • Provide multiple contact methods for technical support • Test portal functionality regularly from client perspective • Keep browser compatibility information current • Document solutions for recurring problems",
        type: "text"
      },
      {
        id: "slide-8",
        title: "Portal Integration with Sales Process",
        content: "**INTEGRATING PORTAL INTO SALES WORKFLOW** • **Proposal Stage** - Include portal access as part of service offering • **Contract Signing** - Set up portal access immediately after contract execution • **Project Kickoff** - Use portal for project initiation and client onboarding • **Progress Reviews** - Conduct regular portal-based progress meetings • **Project Completion** - Use portal for final deliverables and client feedback **SALES PROCESS OPTIMIZATION** • Create portal setup checklists for new clients • Develop standard operating procedures for portal management • Train clients on portal usage during onboarding • Use portal milestones to trigger sales follow-ups • Leverage portal success stories in future sales presentations • Track portal adoption rates and client satisfaction metrics",
        type: "text"
      },
      {
        id: "slide-9",
        title: "Advanced Portal Features for Power Users",
        content: "**ADVANCED PORTAL CAPABILITIES** • **Custom Branding** - White-label portal with client's branding • **API Integration** - Connect portal with client's existing systems • **Advanced Reporting** - Custom reports and analytics dashboards • **Workflow Automation** - Automated notifications and approval processes • **Multi-User Management** - Team access and role-based permissions **LEVERAGING ADVANCED FEATURES FOR SALES** • Position advanced features as premium service offerings • Use custom branding to strengthen client relationships • Demonstrate ROI through automation and efficiency gains • Create tiered service packages based on portal features • Use advanced analytics to provide strategic insights to clients • Develop case studies showcasing advanced feature benefits",
        type: "text"
      },
      {
        id: "slide-10",
        title: "Portal Success Metrics and ROI",
        content: "**KEY PERFORMANCE INDICATORS** • **Client Satisfaction** - Portal usage correlates with client happiness • **Project Efficiency** - Faster approvals and reduced revision cycles • **Communication Quality** - Fewer emails and phone calls needed • **Client Retention** - Portal users show higher retention rates • **Upselling Success** - Portal engagement predicts upselling opportunities **MEASURING AND REPORTING ROI** • Track time saved through portal automation • Monitor reduction in support tickets and calls • Measure improvement in project delivery times • Calculate increased client lifetime value • Document client testimonials about portal benefits • Create ROI reports for internal stakeholders and client presentations",
        type: "text"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "What is the primary benefit of using the client portal for sales teams?",
        options: ["Reducing project costs", "Improving client relationships and transparency", "Eliminating the need for meetings", "Automating all sales processes"],
        correctAnswer: 1,
        explanation: "The client portal primarily improves client relationships through transparency, better communication, and professional presentation."
      },
      {
        id: "q2",
        question: "When should you set up client portal access?",
        options: ["Only after project completion", "Immediately after contract signing", "When the client requests it", "During the final invoice"],
        correctAnswer: 1,
        explanation: "Portal access should be set up immediately after contract execution to maximize benefits throughout the project lifecycle."
      },
      {
        id: "q3",
        question: "How can portal analytics help with sales?",
        options: ["They replace the need for client communication", "They identify upselling opportunities and client engagement levels", "They automatically generate new leads", "They eliminate project management tasks"],
        correctAnswer: 1,
        explanation: "Portal analytics provide valuable insights into client engagement, helping identify upselling opportunities and clients who need more support."
      },
      {
        id: "q4",
        question: "What should you do if a client is having trouble accessing the portal?",
        options: ["Tell them to figure it out themselves", "Provide step-by-step troubleshooting and support", "Disable their portal access", "Switch to email-only communication"],
        correctAnswer: 1,
        explanation: "Providing excellent support for portal issues ensures clients can fully benefit from the portal and maintains professional relationships."
      },
      {
        id: "q5",
        question: "How can the client portal be used as a competitive advantage?",
        options: ["By hiding project information from clients", "By demonstrating professionalism and transparency during sales presentations", "By making projects more expensive", "By reducing the quality of deliverables"],
        correctAnswer: 1,
        explanation: "The portal serves as a powerful differentiator by showcasing professionalism, transparency, and superior client experience during sales presentations."
      }
    ]
  },
  {
    id: "client-dashboard-mastery",
    title: "Client Dashboard Mastery for Sales Teams",
    description: "Master the client dashboard to effectively manage client relationships, track project progress, and drive sales success through comprehensive client management",
    category: "Sales",
    difficulty: "Intermediate",
    estimatedTime: 35,
    role: "Sales Rep",
    passingScore: 80,
    slides: [
      {
        id: "slide-1",
        title: "Introduction to Client Dashboard",
        content: "**WHY THE CLIENT DASHBOARD IS ESSENTIAL FOR SALES SUCCESS** • Centralized view of all client information and project status • Real-time project tracking improves client communication • Comprehensive client history builds stronger relationships • Efficient project management increases client satisfaction • Professional presentation enhances your credibility **ACCESSING THE CLIENT DASHBOARD** • Navigate to 'Client Dashboard' in the main CRM sidebar • Access from individual client profiles for focused management • Use search functionality to quickly find specific clients • Monitor multiple clients simultaneously for better oversight • Integrate dashboard insights into your sales process",
        type: "text"
      },
      {
        id: "slide-2",
        title: "Client Selection and Search",
        content: "**EFFICIENT CLIENT NAVIGATION** • **Search Functionality** - Use the search bar to quickly locate specific clients • **Client Sidebar** - Browse all clients in an organized list format • **Quick Selection** - Click on any client name to view their dashboard • **Sorting Options** - Sort clients by name, company, or other criteria • **Recent Clients** - Access frequently viewed clients faster **SEARCH BEST PRACTICES** • Use partial names or company names for quick results • Search by project names to find clients with specific work • Utilize filters to narrow down client lists • Keep client names and company information updated for better searchability • Create naming conventions for consistent search results",
        type: "text"
      },
      {
        id: "slide-3",
        title: "Overview Tab - Client Summary",
        content: "**CLIENT OVERVIEW DASHBOARD** • **Total Projects** - See the complete project count for each client • **Active Projects** - Monitor currently running projects requiring attention • **Pending Projects** - Track projects waiting to start or requiring approval • **Project Status Distribution** - Visual representation of project health • **Quick Stats** - Key metrics at a glance for rapid assessment **USING OVERVIEW FOR SALES** • Identify clients with capacity for additional projects • Spot clients with only completed projects for upselling opportunities • Monitor active project load to manage client expectations • Use project counts in sales conversations to demonstrate value • Track client growth and project evolution over time",
        type: "text"
      },
      {
        id: "slide-4",
        title: "Projects Tab - Detailed Project Management",
        content: "**PROJECT TRACKING AND MANAGEMENT** • **Grid View** - Visual cards showing project status and progress bars • **List View** - Detailed table format with comprehensive project information • **Progress Tracking** - Real-time progress bars for each project • **Status Monitoring** - Active, completed, and pending project statuses • **Timeline Management** - Start and end dates for project planning **PROJECT MANAGEMENT STRATEGIES** • Use progress bars to identify projects needing attention • Monitor project timelines to prevent delays and manage expectations • Switch between grid and list views based on your workflow needs • Track milestone completion to ensure project success • Identify bottlenecks and resource allocation issues early",
        type: "text"
      },
      {
        id: "slide-5",
        title: "Messages Tab - Client Communication",
        content: "**EFFECTIVE CLIENT COMMUNICATION** • **Message History** - Complete conversation thread with timestamps • **Real-time Messaging** - Send and receive messages directly in the dashboard • **Message Threading** - Organized conversation flow for better context • **Response Tracking** - Monitor response times and communication patterns • **Professional Messaging** - Maintain professional tone and documentation **COMMUNICATION BEST PRACTICES** • Respond to client messages within 4 hours during business days • Use clear, professional language in all communications • Document important decisions and agreements in messages • Keep conversations project-focused and solution-oriented • Use messages to provide regular project updates and maintain engagement",
        type: "text"
      },
      {
        id: "slide-6",
        title: "Files Tab - Document Management",
        content: "**COMPREHENSIVE FILE MANAGEMENT** • **File Library** - Centralized storage for all client-related documents • **File Details** - Name, type, size, and upload date information • **Download Actions** - Easy access to download files when needed • **File Organization** - Systematic storage for easy retrieval • **Version Control** - Track document versions and updates **FILE MANAGEMENT STRATEGIES** • Organize files with clear, descriptive naming conventions • Regularly review and update file libraries • Use file sharing to demonstrate project progress • Maintain backup copies of critical client documents • Ensure file security and access permissions are properly set",
        type: "text"
      },
      {
        id: "slide-7",
        title: "Invoices Tab - Financial Tracking",
        content: "**INVOICE AND PAYMENT MANAGEMENT** • **Invoice Status** - Track paid, unpaid, and overdue invoices • **Payment Tracking** - Monitor payment patterns and client financial health • **Due Date Management** - Stay on top of payment deadlines • **Financial History** - Complete payment history for each client • **Revenue Tracking** - Monitor client value and payment reliability **FINANCIAL MANAGEMENT FOR SALES** • Identify clients with consistent payment patterns for upselling • Monitor overdue invoices to address payment issues proactively • Use payment history to assess client financial stability • Track invoice amounts to understand client spending patterns • Leverage good payment history in renewal and expansion conversations",
        type: "text"
      },
      {
        id: "slide-8",
        title: "Analytics Tab - Client Insights",
        content: "**CLIENT PERFORMANCE ANALYTICS** • **Project Completion Rates** - Track successful project delivery metrics • **Client Satisfaction Scores** - Monitor client happiness and feedback • **Revenue Analytics** - Analyze client value and profitability • **Engagement Metrics** - Track client interaction and communication patterns • **Performance Trends** - Identify patterns in client behavior and project success **LEVERAGING ANALYTICS FOR SALES** • Use completion rates to demonstrate reliability in sales presentations • Identify high-satisfaction clients for testimonials and referrals • Analyze revenue trends to identify upselling opportunities • Track engagement patterns to optimize communication strategies • Use performance data to justify pricing and service levels",
        type: "text"
      },
      {
        id: "slide-9",
        title: "Creating New Projects and Client Management",
        content: "**PROJECT INITIATION AND CLIENT GROWTH** • **New Project Button** - Quick access to create additional projects for existing clients • **Project Setup** - Efficient project creation with client context already loaded • **Scope Expansion** - Identify opportunities for additional services • **Client Capacity** - Assess client ability to handle multiple concurrent projects • **Resource Planning** - Allocate team resources based on client dashboard insights **GROWTH STRATEGIES** • Use dashboard insights to identify expansion opportunities • Propose additional projects based on current project success • Time new project proposals with project completion milestones • Leverage client satisfaction data to justify expanded engagements • Create project packages based on client history and preferences",
        type: "text"
      },
      {
        id: "slide-10",
        title: "Dashboard Integration with Sales Process",
        content: "**INTEGRATING DASHBOARD INTO SALES WORKFLOW** • **Client Review Meetings** - Use dashboard data for comprehensive client reviews • **Sales Presentations** - Demonstrate project management capabilities to prospects • **Account Management** - Regular dashboard reviews for proactive client management • **Renewal Preparation** - Use historical data for contract renewal discussions • **Upselling Strategy** - Identify opportunities based on project completion and satisfaction **SALES PROCESS OPTIMIZATION** • Schedule regular dashboard reviews for all active clients • Create dashboard-based reports for client meetings • Use project success stories from dashboard for new client presentations • Develop account growth strategies based on dashboard analytics • Track client lifecycle stages through dashboard metrics",
        type: "text"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "What is the primary benefit of using the client dashboard for sales teams?",
        options: ["Reducing project costs", "Centralized client management and relationship building", "Eliminating client communication", "Automating all project tasks"],
        correctAnswer: 1,
        explanation: "The client dashboard provides centralized client management, enabling better relationship building through comprehensive project tracking and communication."
      },
      {
        id: "q2",
        question: "Which tab in the client dashboard is best for tracking project progress?",
        options: ["Overview tab", "Projects tab", "Messages tab", "Files tab"],
        correctAnswer: 1,
        explanation: "The Projects tab provides detailed project tracking with progress bars, timelines, and status information in both grid and list views."
      },
      {
        id: "q3",
        question: "How can the Messages tab improve client relationships?",
        options: ["By hiding communication history", "By providing real-time communication and complete message history", "By automatically responding to clients", "By limiting client contact"],
        correctAnswer: 1,
        explanation: "The Messages tab enables real-time communication with complete conversation history, improving transparency and relationship building."
      },
      {
        id: "q4",
        question: "What information can you find in the Invoices tab?",
        options: ["Only current invoices", "Payment status, due dates, and financial history", "Project timelines", "Client contact information"],
        correctAnswer: 1,
        explanation: "The Invoices tab provides comprehensive financial tracking including payment status, due dates, and complete payment history."
      },
      {
        id: "q5",
        question: "How can the Analytics tab help with sales opportunities?",
        options: ["By hiding client data", "By identifying high-satisfaction clients and revenue trends for upselling", "By reducing client communication", "By eliminating the need for sales meetings"],
        correctAnswer: 1,
        explanation: "The Analytics tab provides insights into client satisfaction, revenue trends, and performance metrics that help identify upselling and expansion opportunities."
      }
    ]
  },
  {
    id: "invoicing-mastery-sales",
    title: "Invoicing Component Mastery for Sales Teams",
    description: "Master the complete invoicing workflow from web design quotes to contracts and invoices. Learn to convert quotes, manage payment schedules, and optimize the sales-to-payment process.",
    category: "Sales",
    difficulty: "Advanced",
    estimatedTime: 55,
    role: "Sales Rep",
    passingScore: 80,
    slides: [
      {
        id: "slide-1",
        title: "Introduction to the Invoicing Component",
        content: "The Invoicing Component is the financial backbone of your sales process, seamlessly converting web design quotes into professional contracts and invoices. KEY FEATURES: Unified invoice system with multiple invoice types (deposit, milestone, progress, final). Quote-to-contract conversion with automated payment schedules. Enhanced contract templates with industry-specific terms. Real-time invoice generation with detailed line items. Payment tracking and milestone management. Integration with the WebDesignQuote component for seamless workflow. BUSINESS IMPACT: Reduces quote-to-payment time by 60%. Increases payment compliance through structured milestones. Provides professional documentation that builds client trust. Automates complex pricing calculations and payment schedules.",
        type: "text"
      },
      {
        id: "slide-2",
        title: "Understanding the WebDesignQuote Component",
        content: "Before converting quotes to invoices, understand how the WebDesignQuote component works. QUOTE STRUCTURE: Business Information (name, industry, contact details). Project Specifications (page count, features, timeline). Pricing Breakdown (base cost, feature costs, total hours). Requirements and Additional Notes. QUOTE TYPES: Quick Mode - Streamlined for simple projects. Detailed Mode - Comprehensive for complex requirements. Industry-Specific - Tailored features for different sectors. QUOTE DATA CAPTURED: Client contact information and business details. Selected features from industry-specific catalogs. Timeline preferences and budget constraints. Technical requirements and design preferences. Lead scoring and project priority assessment.",
        type: "text"
      },
      {
        id: "slide-3",
        title: "Quote-to-Contract Conversion Process",
        content: "Learn the step-by-step process of converting approved quotes into professional contracts. CONVERSION WORKFLOW: 1. Access the Enhanced Contract Invoice Manager. 2. Select 'Available Quotes' from approved quotes list. 3. Click 'Convert' on the desired quote. 4. Review quote details (business name, industry, page count, features). 5. Configure conversion options (payment structure, terms, milestones). 6. Generate enhanced contract with automated terms. CONTRACT GENERATION: Automatic contract numbering (CON-YYYY-XXXXXX format). Project details extracted from quote data. Payment schedule based on project value and timeline. Industry-specific terms and conditions. Client and provider responsibilities clearly defined. Scope of work with detailed deliverables.",
        type: "text"
      },
      {
        id: "slide-4",
        title: "Payment Structure Configuration",
        content: "Master the art of configuring optimal payment structures for different project types. PAYMENT STRUCTURE TYPES: Deposit + Final (projects under $5,000) - 50% deposit, 50% on completion. Milestone-based (projects $5,000-$15,000) - 3-4 payment milestones. Progressive (projects over $15,000) - 4+ milestones with detailed phases. MILESTONE CONFIGURATION: Phase 1: Discovery & Planning (30% - Days 1-3). Phase 2: Design Development (30% - Days 4-14). Phase 3: Development & Testing (25% - Days 15-25). Phase 4: Launch & Handover (15% - Days 26-28). CUSTOMIZATION OPTIONS: Adjust percentages based on client cash flow. Modify timelines for project complexity. Add custom milestones for unique requirements. Configure payment terms (Net 15, Net 30, etc.).",
        type: "text"
      },
      {
        id: "slide-5",
        title: "Invoice Generation and Types",
        content: "Understand the different invoice types and when to use each for optimal cash flow. INVOICE TYPES: DEPOSIT INVOICE - Generated immediately after contract signing. Typically 40-50% of total project value. Secures project commitment and covers initial costs. MILESTONE INVOICES - Triggered by project phase completion. Based on predefined percentage of total value. Includes detailed line items for completed work. PROGRESS INVOICES - For ongoing work billing. Percentage-based on overall project completion. Useful for long-term projects with flexible timelines. FINAL INVOICE - Covers remaining project balance. Includes any additional work or change orders. Triggered by project completion and client approval.",
        type: "text"
      },
      {
        id: "slide-6",
        title: "Unified Invoice System Features",
        content: "Explore the advanced features of the Unified Invoice System for professional billing. INVOICE COMPONENTS: Professional invoice numbering (INV-YYYY-XXXXXX). Detailed line items with hours allocation. Tax calculations and compliance. Payment terms and due dates. Original quote data preservation. Contract milestone tracking. ADVANCED FEATURES: Automatic item generation from quote features. Category-based pricing (design, development, content). Hours allocation per milestone phase. Taxable vs. non-taxable item designation. Currency support and international billing. Payment tracking and amount due calculations. INTEGRATION BENEFITS: Seamless data flow from quote to contract to invoice. Consistent pricing and terms across all documents. Automated calculations reduce manual errors. Professional presentation builds client confidence.",
        type: "text"
      },
      {
        id: "slide-7",
        title: "Managing Invoice Line Items",
        content: "Master the creation and management of detailed invoice line items for transparency and professionalism. LINE ITEM STRUCTURE: Description - Clear, specific service description. Quantity - Usually 1 for service-based items. Unit Price - Cost per item or service component. Total - Calculated automatically. Category - Design, development, content, etc. Hours Allocated - Time estimation for each component. ITEM GENERATION STRATEGIES: Base Services (30% of milestone value) - Core web design services. Feature-Specific Items (70% of milestone value) - Individual quote features. Detailed Breakdown - Separate line items for each major feature. Consolidated Approach - Group similar features together. BEST PRACTICES: Use clear, client-friendly descriptions. Maintain consistency across all invoices. Include hours allocation for transparency. Categorize items for better tracking and reporting.",
        type: "text"
      },
      {
        id: "slide-8",
        title: "Payment Tracking and Management",
        content: "Learn to effectively track payments and manage outstanding balances throughout the project lifecycle. PAYMENT TRACKING FEATURES: Real-time payment status updates. Amount paid vs. amount due calculations. Payment history and transaction records. Automated payment reminders and notifications. Late fee calculations and management. PAYMENT MANAGEMENT WORKFLOW: 1. Generate invoice and send to client. 2. Track invoice delivery and client receipt. 3. Monitor payment due dates and send reminders. 4. Record payments and update balances. 5. Generate receipts and payment confirmations. 6. Handle partial payments and payment plans. OVERDUE MANAGEMENT: Automated reminder system at 7, 14, and 30 days. Late fee application based on contract terms. Escalation procedures for seriously overdue accounts. Payment plan negotiation and documentation. Collection agency referral procedures.",
        type: "text"
      },
      {
        id: "slide-9",
        title: "Contract Terms and Legal Considerations",
        content: "Understand the legal aspects of contracts and invoicing to protect your business and maintain client relationships. CONTRACT TERMS ESSENTIALS: Scope of Work - Detailed project deliverables and specifications. Payment Terms - Schedule, methods, and late fee policies. Intellectual Property - Rights transfer upon full payment. Revisions - Number of included revisions and additional costs. Timeline - Project phases and completion dates. Cancellation - Terms for project termination by either party. LEGAL PROTECTIONS: Clear payment terms and late fee structures. Intellectual property retention until full payment. Limitation of liability clauses. Force majeure and unforeseen circumstances. Dispute resolution procedures. COMPLIANCE CONSIDERATIONS: Tax collection and remittance requirements. Industry-specific regulations and standards. Data protection and privacy requirements. Professional licensing and insurance obligations.",
        type: "text"
      },
      {
        id: "slide-10",
        title: "Sales Process Integration and Best Practices",
        content: "Integrate the invoicing component seamlessly into your sales process for maximum efficiency and client satisfaction. SALES INTEGRATION WORKFLOW: 1. Complete WebDesignQuote component with client. 2. Present quote and discuss project details. 3. Upon approval, immediately convert to contract. 4. Review contract terms with client before signing. 5. Generate deposit invoice upon contract execution. 6. Set up milestone tracking and payment schedule. 7. Maintain regular communication about progress and upcoming invoices. BEST PRACTICES: Always explain the payment structure during the sales process. Provide clear timelines for each milestone and payment. Use the invoicing system to demonstrate professionalism. Maintain detailed records for all client communications. Follow up promptly on overdue payments. COMMON PITFALLS TO AVOID: Skipping contract review with clients. Unclear milestone definitions. Inconsistent payment terms across projects. Poor communication about upcoming invoices. Delayed invoice generation after milestone completion.",
        type: "text"
      }
    ],
    quiz: [
      {
        id: "q1",
        question: "What are the three main payment structure types available in the invoicing system?",
        options: [
          "Hourly, Fixed, and Retainer",
          "Deposit + Final, Milestone-based, and Progressive",
          "Weekly, Monthly, and Quarterly",
          "Upfront, Midpoint, and Completion"
        ],
        correctAnswer: 1,
        explanation: "The system offers Deposit + Final (under $5K), Milestone-based ($5K-$15K), and Progressive (over $15K) payment structures."
      },
      {
        id: "q2",
        question: "When should you generate a deposit invoice?",
        options: [
          "After the first milestone is completed",
          "Immediately after contract signing",
          "When the project is 50% complete",
          "Only when the client requests it"
        ],
        correctAnswer: 1,
        explanation: "Deposit invoices should be generated immediately after contract signing to secure project commitment and cover initial costs."
      },
      {
        id: "q3",
        question: "What percentage of milestone value is typically allocated to base services vs. feature-specific items?",
        options: [
          "50% base services, 50% features",
          "20% base services, 80% features",
          "30% base services, 70% features",
          "40% base services, 60% features"
        ],
        correctAnswer: 2,
        explanation: "The system allocates 30% of milestone value to base services and 70% to feature-specific items for detailed transparency."
      },
      {
        id: "q4",
        question: "What happens to intellectual property rights in the standard contract terms?",
        options: [
          "Rights transfer immediately upon contract signing",
          "Rights are shared between client and provider",
          "Rights transfer upon full payment completion",
          "Rights remain with the provider permanently"
        ],
        correctAnswer: 2,
        explanation: "Standard contract terms specify that intellectual property rights transfer to the client upon full payment completion."
      },
      {
        id: "q5",
        question: "Which invoice type is most appropriate for a $12,000 website project?",
        options: [
          "Single deposit + final payment",
          "Milestone-based with 3-4 payments",
          "Weekly progress invoices",
          "Monthly retainer invoices"
        ],
        correctAnswer: 1,
        explanation: "Projects between $5,000-$15,000 are best suited for milestone-based payment structures with 3-4 payment milestones."
      }
    ]
  }
]

/* -------------------------------------------------------------------------- */
/* 3. Utility helpers                                                         */
/* -------------------------------------------------------------------------- */

const getCategoryIcon = (category: TrainingModule["category"]) => {
  switch (category) {
    case "CRM Usage":
      return <Settings className="size-4" />
    case "Company Policies":
      return <FileText className="size-4" />
    case "Security":
      return <Shield className="size-4" />
    case "Best Practices":
      return <Target className="size-4" />
    case "Sales":
      return <DollarSign className="size-4" />
    case "Finance":
      return <TrendingUp className="size-4" />
    case "Project Management":
      return <Briefcase className="size-4" />
    default:
      return <BookOpen className="size-4" />
  }
}

const getDifficultyColor = (difficulty: TrainingModule["difficulty"]) => {
  switch (difficulty) {
    case "Beginner":
      return "bg-green-100 text-green-800"
    case "Intermediate":
      return "bg-yellow-100 text-yellow-800"
    case "Advanced":
      return "bg-red-100 text-red-800"
    case "Expert":
      return "bg-purple-100 text-purple-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

/* -------------------------------------------------------------------------- */
/* 4. TrainingDashboard component                                             */
/* -------------------------------------------------------------------------- */

const TrainingDashboard: React.FC = () => {
  /* ---------------------------- 4.a State --------------------------------- */
  const [role, setRole] = useState<TrainingModule["role"]>("Sales Rep")
  const [search, setSearch] = useState("")
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizScore, setQuizScore] = useState<number | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [activeTab, setActiveTab] = useState("modules")
  const [showNotes, setShowNotes] = useState(false)
  const [currentNote, setCurrentNote] = useState("")
  const [isAudioEnabled, setIsAudioEnabled] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [moduleRating, setModuleRating] = useState(0)
  const [moduleFeedback, setModuleFeedback] = useState("")
  const [showCertificate, setShowCertificate] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  
  // Persistent storage for progress and quiz results
  const [userProgress, setUserProgress] = useLocalStorage<Record<string, UserProgress>>('training-progress', {})
  const [allQuizResults, setAllQuizResults] = useLocalStorage<QuizAttempt[]>('quiz-results', [])
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now())
  const [studyAnalytics, setStudyAnalytics] = useLocalStorage<Record<string, any>>('study-analytics', {})

  /* ---------------------------- 4.b Memo data ----------------------------- */
  const visibleModules = useMemo(() => {
    return TRAINING_MODULES.filter(
      (m) => (m.role === role || m.role === "All") && m.title.toLowerCase().includes(search.toLowerCase()),
    )
  }, [role, search])

  const activeModule = useMemo(() => {
    return TRAINING_MODULES.find(m => m.id === activeId)
  }, [activeId])

  const currentProgress = useMemo(() => {
    return activeId ? userProgress[activeId] : null
  }, [activeId, userProgress])

  // Memoized analytics calculations for better performance
  const studyStatistics = useMemo(() => {
    const progressValues = Object.values(userProgress)
    
    const totalStudyTime = Math.round(progressValues.reduce((acc, p) => acc + (p.timeSpent || 0), 0) / 60000)
    
    const scoresWithValues = progressValues.filter(p => p.bestScore)
    const averageScore = scoresWithValues.length > 0
      ? Math.round(scoresWithValues.reduce((acc, p) => acc + (p.bestScore || 0), 0) / scoresWithValues.length)
      : 0
    
    const totalBookmarks = progressValues.reduce((acc, p) => acc + (p.bookmarkedSlides?.length || 0), 0)
    
    const totalNotes = progressValues.reduce((acc, p) => acc + Object.keys(p.notes || {}).length, 0)
    
    return {
      totalStudyTime,
      averageScore,
      totalBookmarks,
      totalNotes
    }
  }, [userProgress])

  // Memoized category progress calculations
  const categoryProgress = useMemo(() => {
    const categories = Array.from(new Set(TRAINING_MODULES.map(m => m.category)))
    
    return categories.map(category => {
      const categoryModules = TRAINING_MODULES.filter(m => m.category === category)
      const completedInCategory = categoryModules.filter(m => userProgress[m.id]?.completed).length
      const progressPercentage = categoryModules.length > 0 
        ? Math.round((completedInCategory / categoryModules.length) * 100) 
        : 0
      
      return {
        category,
        completed: completedInCategory,
        total: categoryModules.length,
        percentage: progressPercentage
      }
    })
  }, [userProgress])

  // Memoized recent activity data
  const recentActivity = useMemo(() => {
    return Object.entries(userProgress)
      .filter(([_, progress]) => progress.lastStudyDate)
      .sort(([_, a], [__, b]) => new Date(b.lastStudyDate!).getTime() - new Date(a.lastStudyDate!).getTime())
      .slice(0, 5)
      .map(([moduleId, progress]) => {
        const module = TRAINING_MODULES.find(m => m.id === moduleId)
        return module ? { moduleId, progress, module } : null
      })
      .filter(Boolean)
  }, [userProgress])

  // Memoized bookmarks data
  const bookmarksData = useMemo(() => {
    const totalBookmarkedSlides = Object.values(userProgress).reduce(
      (total, progress) => total + (progress.bookmarkedSlides?.length || 0), 0
    )
    
    const moduleBookmarks = TRAINING_MODULES.map(module => {
      const progress = userProgress[module.id]
      const bookmarkedSlides = progress?.bookmarkedSlides || []
      return bookmarkedSlides.length > 0 ? { module, bookmarkedSlides } : null
    }).filter(Boolean)
    
    return {
      totalBookmarkedSlides,
      moduleBookmarks
    }
  }, [userProgress])

  /* ------------------------- 4.c Event handlers --------------------------- */
  const saveProgress = useCallback((moduleId: string, slideIndex: number, timeSpent: number = 0) => {
    const today = new Date().toISOString().split('T')[0]
    const lastStudy = userProgress[moduleId]?.lastStudyDate?.split('T')[0]
    const streak = lastStudy === today ? userProgress[moduleId]?.studyStreak || 0 : 
                   lastStudy === new Date(Date.now() - 86400000).toISOString().split('T')[0] ? 
                   (userProgress[moduleId]?.studyStreak || 0) + 1 : 1
    
    setUserProgress(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        moduleId,
        currentSlide: slideIndex,
        lastAccessed: new Date().toISOString(),
        timeSpent: (prev[moduleId]?.timeSpent || 0) + timeSpent,
        completed: false,
        quizAttempts: prev[moduleId]?.quizAttempts || [],
        bookmarkedSlides: prev[moduleId]?.bookmarkedSlides || [],
        notes: prev[moduleId]?.notes || {},
        studyStreak: streak,
        lastStudyDate: new Date().toISOString()
      }
    }))
  }, [setUserProgress, userProgress])

  const startModule = useCallback((moduleId: string) => {
    setActiveId(moduleId)
    setCurrentSlide(userProgress[moduleId]?.currentSlide || 0)
    setShowQuiz(false)
    setQuizSubmitted(false)
    setQuizAnswers({})
    setQuizScore(null)
    setShowResults(false)
    setSessionStartTime(Date.now())
  }, [userProgress])

  const nextSlide = useCallback(() => {
    if (!activeModule) return
    const nextIndex = currentSlide + 1
    if (nextIndex < activeModule.slides.length) {
      setCurrentSlide(nextIndex)
      saveProgress(activeModule.id, nextIndex, Date.now() - sessionStartTime)
      setSessionStartTime(Date.now())
    } else {
      setShowQuiz(true)
    }
  }, [activeModule, currentSlide, saveProgress, sessionStartTime])

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
      if (activeModule) {
        saveProgress(activeModule.id, currentSlide - 1)
      }
    }
  }, [currentSlide, activeModule, saveProgress])

  const submitQuiz = useCallback(() => {
    if (!activeModule) return
    
    let correctAnswers = 0
    const answers = activeModule.quiz.map(question => {
      const selectedAnswer = quizAnswers[question.id] ?? -1
      const correct = selectedAnswer === question.correctAnswer
      if (correct) correctAnswers++
      return {
        questionId: question.id,
        selectedAnswer,
        correct
      }
    })
    
    const score = Math.round((correctAnswers / activeModule.quiz.length) * 100)
    const timeSpent = Date.now() - sessionStartTime
    
    const attempt: QuizAttempt = {
      id: `attempt-${Date.now()}`,
      moduleId: activeModule.id,
      userRole: role,
      score,
      totalQuestions: activeModule.quiz.length,
      answers,
      completedAt: new Date().toISOString(),
      timeSpent
    }
    
    setAllQuizResults(prev => [...prev, attempt])
    
    // Update user progress
    setUserProgress(prev => ({
      ...prev,
      [activeModule.id]: {
        ...prev[activeModule.id],
        moduleId: activeModule.id,
        currentSlide: activeModule.slides.length - 1,
        completed: score >= activeModule.passingScore,
        quizAttempts: [...(prev[activeModule.id]?.quizAttempts || []), attempt],
        lastAccessed: new Date().toISOString(),
        timeSpent: (prev[activeModule.id]?.timeSpent || 0) + timeSpent
      }
    }))
    
    setQuizScore(score)
    setQuizSubmitted(true)
    setShowResults(true)
  }, [activeModule, quizAnswers, sessionStartTime, role, setAllQuizResults, setUserProgress])

  const retakeQuiz = useCallback(() => {
    setQuizAnswers({})
    setQuizSubmitted(false)
    setQuizScore(null)
    setShowResults(false)
    setSessionStartTime(Date.now())
  }, [])

  const toggleBookmark = useCallback((slideIndex: number) => {
    if (!activeModule) return
    setUserProgress(prev => {
      const current = prev[activeModule.id] || {}
      const bookmarks = current.bookmarkedSlides || []
      const newBookmarks = bookmarks.includes(slideIndex) 
        ? bookmarks.filter(index => index !== slideIndex)
        : [...bookmarks, slideIndex]
      
      return {
        ...prev,
        [activeModule.id]: {
          ...current,
          moduleId: activeModule.id,
          bookmarkedSlides: newBookmarks,
          currentSlide: current.currentSlide || 0,
          completed: current.completed || false,
          lastAccessed: new Date().toISOString(),
          timeSpent: current.timeSpent || 0,
          quizAttempts: current.quizAttempts || [],
          notes: current.notes || {},
          studyStreak: current.studyStreak || 0
        }
      }
    })
  }, [activeModule, setUserProgress])

  const saveNote = useCallback((slideIndex: number, note: string) => {
    if (!activeModule) return
    setUserProgress(prev => {
      const current = prev[activeModule.id] || {}
      return {
        ...prev,
        [activeModule.id]: {
          ...current,
          moduleId: activeModule.id,
          notes: { ...current.notes, [slideIndex]: note },
          currentSlide: current.currentSlide || 0,
          completed: current.completed || false,
          lastAccessed: new Date().toISOString(),
          timeSpent: current.timeSpent || 0,
          quizAttempts: current.quizAttempts || [],
          bookmarkedSlides: current.bookmarkedSlides || [],
          studyStreak: current.studyStreak || 0
        }
      }
    })
  }, [activeModule, setUserProgress])

  const rateModule = useCallback((rating: number, feedback: string) => {
    if (!activeModule) return
    setUserProgress(prev => {
      const current = prev[activeModule.id] || {}
      return {
        ...prev,
        [activeModule.id]: {
          ...current,
          moduleId: activeModule.id,
          rating,
          feedback,
          currentSlide: current.currentSlide || 0,
          completed: current.completed || false,
          lastAccessed: new Date().toISOString(),
          timeSpent: current.timeSpent || 0,
          quizAttempts: current.quizAttempts || [],
          bookmarkedSlides: current.bookmarkedSlides || [],
          notes: current.notes || {},
          studyStreak: current.studyStreak || 0
        }
      }
    })
  }, [activeModule, setUserProgress])

  const generateCertificate = useCallback(() => {
    if (!activeModule || !currentProgress?.completed) return
    setUserProgress(prev => ({
      ...prev,
      [activeModule.id]: {
        ...prev[activeModule.id],
        certificateEarned: true,
        certificateDate: new Date().toISOString()
      }
    }))
    setShowCertificate(true)
  }, [activeModule, currentProgress, setUserProgress])

  const closeModule = useCallback(() => {
    if (activeModule) {
      saveProgress(activeModule.id, currentSlide, Date.now() - sessionStartTime)
    }
    setActiveId(null)
    setCurrentSlide(0)
    setShowQuiz(false)
    setQuizSubmitted(false)
    setQuizAnswers({})
    setQuizScore(null)
    setShowNotes(false)
    setCurrentNote("")
    setShowBookmarks(false)
    setModuleRating(0)
    setModuleFeedback("")
    setShowCertificate(false)
    setShowResults(false)
  }, [activeModule, currentSlide, saveProgress, sessionStartTime])

  // Auto-save progress every 30 seconds
  useEffect(() => {
    if (!activeModule) return
    
    const interval = setInterval(() => {
      saveProgress(activeModule.id, currentSlide, 30000) // 30 seconds
    }, 30000)
    
    return () => clearInterval(interval)
  }, [activeModule, currentSlide, saveProgress])

  /* ----------------------------- 4.d Render ------------------------------- */
  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">Training Dashboard</h1>
          <p className="text-gray-700 dark:text-gray-200 font-medium">Interactive learning with visual content and assessments</p>
        </div>
        <Badge variant="outline" className="bg-gradient-to-r from-blue-100 to-purple-100 border-blue-300 text-blue-700 font-semibold shadow-md">
          <UserCheck className="mr-1 size-4" />
          {role}
        </Badge>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="modules">Training Modules</TabsTrigger>
          <TabsTrigger value="progress">My Progress</TabsTrigger>
          <TabsTrigger value="results">Quiz Results</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search training modules..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="size-4" />
                Filters
              </Button>
            </div>
          </div>

          {showFilters && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Role Filter</Label>
                    <RadioGroup
                      value={role}
                      onValueChange={(value) => setRole(value as TrainingModule["role"])}
                      className="flex flex-wrap gap-4 mt-2"
                    >
                      {["All", "Admin", "Manager", "Sales Rep", "Contractor"].map((r) => (
                        <div key={r} className="flex items-center space-x-2">
                          <RadioGroupItem value={r} id={r} />
                          <Label htmlFor={r}>{r}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleModules.map((module) => {
              const progress = userProgress[module.id]
              const progressPercentage = progress ? Math.round((progress.currentSlide / module.slides.length) * 100) : 0
              
              return (
                <Card key={module.id} className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getCategoryIcon(module.category)}
                        <Badge variant="secondary" className={getDifficultyColor(module.difficulty)}>
                          {module.difficulty}
                        </Badge>
                        {progress?.bookmarkedSlides?.length > 0 && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                            <Bookmark className="size-3 mr-1" />
                            {progress.bookmarkedSlides.length}
                          </Badge>
                        )}
                        {progress?.studyStreak > 1 && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
                            <Timer className="size-3 mr-1" />
                            {progress.studyStreak}d
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {module.estimatedTime}m
                        </Badge>
                        {progress?.completed && progress.certificateEarned && (
                          <Trophy className="size-4 text-yellow-500" />
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                      {module.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {module.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{progressPercentage}%</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <BookOpen className="size-3" />
                          {module.slides.length} slides
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="size-3" />
                          {module.passingScore}% to pass
                        </div>
                        {progress?.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="size-3 text-yellow-500 fill-current" />
                            <span className="text-xs">{progress.rating}/5</span>
                          </div>
                        )}
                      </div>
                      {progress?.completed && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="size-3" />
                          <span>Completed</span>
                          {progress.certificateDate && (
                            <span className="text-gray-500 ml-1">
                              {new Date(progress.certificateDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <Button
                      onClick={() => startModule(module.id)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {progress?.completed ? (
                        <>
                          <CheckCircle className="mr-2 size-4" />
                          Review Module
                        </>
                      ) : progress ? (
                        <>
                          <Play className="mr-2 size-4" />
                          Continue
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 size-4" />
                          Start Module
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </section>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Learning Progress Overview</CardTitle>
              <CardDescription>Track your completion status across all training modules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {TRAINING_MODULES.filter(m => m.role === role || m.role === "All").map((module) => {
                  const progress = userProgress[module.id]
                  const progressPercentage = progress ? Math.round((progress.currentSlide / module.slides.length) * 100) : 0
                  
                  return (
                    <div key={module.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(module.category)}
                        <div>
                          <h3 className="font-medium">{module.title}</h3>
                          <p className="text-sm text-gray-600">{module.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{progressPercentage}%</div>
                          <div className="text-xs text-gray-500">
                            {progress?.completed ? "Completed" : "In Progress"}
                          </div>
                        </div>
                        <Progress value={progressPercentage} className="w-24 h-2" />
                        {progress?.completed && (
                          <CheckCircle className="size-5 text-green-600" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Results History</CardTitle>
              <CardDescription>Review your quiz performance and scores</CardDescription>
            </CardHeader>
            <CardContent>
              {allQuizResults.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Award className="mx-auto size-12 mb-4 opacity-50" />
                  <p>No quiz results yet. Complete some training modules to see your scores here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allQuizResults.map((result) => {
                    const module = TRAINING_MODULES.find(m => m.id === result.moduleId)
                    const passed = result.score >= (module?.passingScore || 80)
                    
                    return (
                      <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            passed ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                          }`}>
                            {passed ? <CheckCircle className="size-4" /> : <X className="size-4" />}
                          </div>
                          <div>
                            <h3 className="font-medium">{module?.title || "Unknown Module"}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(result.completedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${
                            passed ? "text-green-600" : "text-red-600"
                          }`}>
                            {result.score}%
                          </div>
                          <div className="text-sm text-gray-500">
                            {result.answers.filter(a => a.correct).length}/{result.totalQuestions} correct
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Modules</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {TRAINING_MODULES.filter(m => m.role === role || m.role === "All").length}
                    </p>
                  </div>
                  <BookOpen className="size-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-green-600">
                      {Object.values(userProgress).filter(p => p.completed).length}
                    </p>
                  </div>
                  <CheckCircle className="size-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Certificates</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {Object.values(userProgress).filter(p => p.certificateEarned).length}
                    </p>
                  </div>
                  <Trophy className="size-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Study Streak</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {Math.max(...Object.values(userProgress).map(p => p.studyStreak || 0), 0)}
                    </p>
                  </div>
                  <Timer className="size-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
                <CardDescription>Your completion rate across different categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["CRM Usage", "Sales", "Technical", "Management"].map(category => {
                    const categoryModules = TRAINING_MODULES.filter(m => 
                      m.category === category && (m.role === role || m.role === "All")
                    )
                    const completedInCategory = categoryModules.filter(m => 
                      userProgress[m.id]?.completed
                    ).length
                    const progressPercentage = categoryModules.length > 0 
                      ? Math.round((completedInCategory / categoryModules.length) * 100) 
                      : 0
                    
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{category}</span>
                          <span>{completedInCategory}/{categoryModules.length} ({progressPercentage}%)</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Study Statistics</CardTitle>
                <CardDescription>Your learning activity and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-blue-600" />
                      <span className="text-sm font-medium">Total Study Time</span>
                    </div>
                    <span className="font-bold text-blue-600">
                      {studyStatistics.totalStudyTime} min
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Target className="size-4 text-green-600" />
                      <span className="text-sm font-medium">Average Score</span>
                    </div>
                    <span className="font-bold text-green-600">
                      {studyStatistics.averageScore}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Bookmark className="size-4 text-yellow-600" />
                      <span className="text-sm font-medium">Total Bookmarks</span>
                    </div>
                    <span className="font-bold text-yellow-600">
                      {studyStatistics.totalBookmarks}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-purple-600" />
                      <span className="text-sm font-medium">Notes Created</span>
                    </div>
                    <span className="font-bold text-purple-600">
                      {studyStatistics.totalNotes}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest learning activities and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity) => {
                    if (!activity) return null
                    const { moduleId, progress, module } = activity
                    
                    return (
                      <div key={moduleId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getCategoryIcon(module.category)}
                          <div>
                            <p className="font-medium text-sm">{module.title}</p>
                            <p className="text-xs text-gray-500">
                              {progress.completed ? 'Completed' : 'In Progress'} • {new Date(progress.lastStudyDate!).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {progress.completed && <CheckCircle className="size-4 text-green-600" />}
                          {progress.certificateEarned && <Trophy className="size-4 text-yellow-500" />}
                          {progress.studyStreak > 1 && (
                            <Badge variant="outline" className="text-xs">
                              {progress.studyStreak}d streak
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })
                }
                {Object.values(userProgress).filter(p => p.lastStudyDate).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="size-12 mx-auto mb-3 opacity-50" />
                    <p>No recent activity. Start a training module to see your progress here!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookmarks" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">My Bookmarks</h2>
            <div className="text-sm text-gray-500">
              {studyStatistics.totalBookmarks} bookmarked slides
            </div>
          </div>

          {studyStatistics.totalBookmarks > 0 ? (
            <div className="space-y-6">
              {bookmarksData.moduleBookmarks.map((bookmark) => {
                if (!bookmark) return null
                const { module, bookmarkedSlides } = bookmark
                
                return (
                  <Card key={module.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {getCategoryIcon(module.category)}
                        {module.title}
                        <span className="text-sm font-normal text-gray-500">({bookmarkedSlides.length} bookmarks)</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {bookmarkedSlides.map(slideIndex => {
                          const slide = module.slides[slideIndex]
                          if (!slide) return null
                          
                          return (
                            <div key={slideIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{slide.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  Slide {slideIndex + 1} of {module.slides.length}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    startModule(module.id)
                                    setCurrentSlide(slideIndex)
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newBookmarks = bookmarkedSlides.filter(i => i !== slideIndex)
                                    setUserProgress(prev => ({
                                      ...prev,
                                      [module.id]: {
                                        ...prev[module.id],
                                        bookmarkedSlides: newBookmarks
                                      }
                                    }))
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookmarks Yet</h3>
                <p className="text-gray-600 mb-4">
                  Start bookmarking slides during your training to quickly access them later.
                </p>
                <Button onClick={() => setActiveTab('modules')}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse Modules
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Training Module Modal */}
      <AnimatePresence>
        {activeModule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeModule()
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h2 className="text-2xl font-bold">{activeModule.title}</h2>
                  <p className="text-gray-600 dark:text-gray-300">{activeModule.description}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={closeModule}>
                  <X className="size-4" />
                </Button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {!showQuiz ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">
                          Slide {currentSlide + 1} of {activeModule.slides.length}
                        </span>
                        <Progress 
                          value={((currentSlide + 1) / activeModule.slides.length) * 100} 
                          className="w-32 h-2" 
                        />
                      </div>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={prevSlide}
                            disabled={currentSlide === 0}
                          >
                            <ChevronLeft className="size-4" />
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowQuiz(true)}
                            className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
                          >
                            <Award className="size-4 mr-1" />
                            Take Quiz
                          </Button>
                          <Button
                            size="sm"
                            onClick={nextSlide}
                            disabled={currentSlide === activeModule.slides.length - 1}
                          >
                            {currentSlide === activeModule.slides.length - 1 ? "Finish Slides" : "Next"}
                            <ChevronRight className="size-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleBookmark(currentSlide)}
                            className={currentProgress?.bookmarkedSlides?.includes(currentSlide) ? 
                              "bg-yellow-50 text-yellow-700 border-yellow-300" : ""}
                          >
                            {currentProgress?.bookmarkedSlides?.includes(currentSlide) ? 
                              <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowNotes(!showNotes)}
                            className={showNotes ? "bg-blue-50 text-blue-700 border-blue-300" : ""}
                          >
                            <StickyNote className="size-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                            className={isAudioEnabled ? "bg-purple-50 text-purple-700 border-purple-300" : ""}
                          >
                            {isAudioEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setFocusMode(!focusMode)}
                            className={focusMode ? "bg-gray-50 text-gray-700 border-gray-300" : ""}
                          >
                            {focusMode ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>{activeModule.slides[currentSlide].title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose max-w-none">
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {activeModule.slides[currentSlide].content}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowQuiz(false)}
                        className="flex items-center gap-2"
                      >
                        <ChevronLeft className="size-4" />
                        Back to Slides
                      </Button>
                      <div className="text-center">
                        <h3 className="text-xl font-bold mb-2">Knowledge Check</h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          Answer all questions to complete the module. You need {activeModule.passingScore}% to pass.
                        </p>
                      </div>
                      <div className="w-24"></div>
                    </div>

                    {!showResults ? (
                      <div className="space-y-6">
                        {activeModule.quiz.map((question, index) => (
                          <Card key={question.id}>
                            <CardHeader>
                              <CardTitle className="text-lg">
                                Question {index + 1}: {question.question}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <RadioGroup
                                value={quizAnswers[question.id]?.toString() || ""}
                                onValueChange={(value) => {
                                  setQuizAnswers(prev => ({
                                    ...prev,
                                    [question.id]: parseInt(value)
                                  }))
                                }}
                                disabled={quizSubmitted}
                              >
                                {question.options.map((option, optionIndex) => (
                                  <div key={optionIndex} className="flex items-center space-x-2">
                                    <RadioGroupItem 
                                      value={optionIndex.toString()} 
                                      id={`${question.id}-${optionIndex}`} 
                                    />
                                    <Label htmlFor={`${question.id}-${optionIndex}`}>
                                      {option}
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </CardContent>
                          </Card>
                        ))}

                        <div className="flex justify-center">
                          <Button
                            onClick={submitQuiz}
                            disabled={Object.keys(quizAnswers).length !== activeModule.quiz.length}
                            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                          >
                            Submit Quiz
                          </Button>
                        </div>
                      
                      {/* Notes Panel */}
                      {showNotes && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-blue-900">Notes for this slide</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                saveNote(currentSlide, currentNote)
                                setCurrentNote("")
                              }}
                              disabled={!currentNote.trim()}
                            >
                              Save Note
                            </Button>
                          </div>
                          <textarea
                            value={currentNote || currentProgress?.notes?.[currentSlide] || ""}
                            onChange={(e) => setCurrentNote(e.target.value)}
                            placeholder="Add your notes for this slide..."
                            className="w-full h-20 p-2 border border-blue-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {currentProgress?.notes?.[currentSlide] && (
                            <div className="mt-2 p-2 bg-white rounded border border-blue-200">
                              <p className="text-sm text-gray-700">
                                {currentProgress.notes[currentSlide]}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  ) : (
                      <div className="space-y-6">
                        <Card className={`border-2 ${
                          (quizScore || 0) >= activeModule.passingScore 
                            ? "border-green-500 bg-green-50" 
                            : "border-red-500 bg-red-50"
                        }`}>
                          <CardContent className="pt-6 text-center">
                            {(quizScore || 0) >= activeModule.passingScore && (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", duration: 0.8 }}
                                className="mb-4"
                              >
                                <Trophy className="size-16 mx-auto text-yellow-500" />
                              </motion.div>
                            )}
                            <div className={`text-6xl font-bold mb-4 ${
                              (quizScore || 0) >= activeModule.passingScore ? "text-green-600" : "text-red-600"
                            }`}>
                              {quizScore}%
                            </div>
                            <h3 className="text-xl font-bold mb-2">
                              {(quizScore || 0) >= activeModule.passingScore ? "Congratulations!" : "Keep Learning!"}
                            </h3>
                            <p className="text-gray-600 mb-4">
                              {(quizScore || 0) >= activeModule.passingScore 
                                ? "You've successfully completed this module." 
                                : `You need ${activeModule.passingScore}% to pass. Review the material and try again.`
                              }
                            </p>
                            
                            {(quizScore || 0) >= activeModule.passingScore && (
                              <div className="space-y-4">
                                <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Timer className="size-4" />
                                    Study Streak: {currentProgress?.studyStreak || 1} days
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="size-4" />
                                    Time Spent: {Math.round((currentProgress?.timeSpent || 0) / 60000)} min
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Target className="size-4" />
                                    Attempts: {currentProgress?.quizAttempts?.length || 1}
                                  </span>
                                </div>
                                
                                <div className="flex justify-center gap-3">
                                  <Button
                                    onClick={generateCertificate}
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                                  >
                                    <Award className="size-4 mr-2" />
                                    Generate Certificate
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setModuleRating(0)
                                      setModuleFeedback("")
                                      // Show rating modal (would need to implement)
                                    }}
                                  >
                                    <Star className="size-4 mr-2" />
                                    Rate Module
                                  </Button>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        <div className="space-y-4">
                          {activeModule.quiz.map((question, index) => {
                            const userAnswer = quizAnswers[question.id]
                            const isCorrect = userAnswer === question.correctAnswer
                            
                            return (
                              <Card key={question.id} className={`border-l-4 ${
                                isCorrect ? "border-l-green-500" : "border-l-red-500"
                              }`}>
                                <CardHeader>
                                  <CardTitle className="text-lg flex items-center gap-2">
                                    {isCorrect ? (
                                      <CheckCircle className="size-5 text-green-600" />
                                    ) : (
                                      <X className="size-5 text-red-600" />
                                    )}
                                    Question {index + 1}: {question.question}
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div className="space-y-2">
                                    {question.options.map((option, optionIndex) => (
                                      <div key={optionIndex} className={`p-2 rounded ${
                                        optionIndex === question.correctAnswer
                                          ? "bg-green-100 text-green-800 font-medium"
                                          : optionIndex === userAnswer && !isCorrect
                                          ? "bg-red-100 text-red-800"
                                          : "bg-gray-50"
                                      }`}>
                                        {option}
                                        {optionIndex === question.correctAnswer && (
                                          <span className="ml-2 text-green-600">✓ Correct</span>
                                        )}
                                        {optionIndex === userAnswer && !isCorrect && (
                                          <span className="ml-2 text-red-600">✗ Your answer</span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                  <div className="bg-blue-50 p-3 rounded">
                                    <p className="text-sm text-blue-800">
                                      <strong>Explanation:</strong> {question.explanation}
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>

                        <div className="flex justify-center gap-4">
                          {(quizScore || 0) < activeModule.passingScore && (
                            <Button onClick={retakeQuiz} variant="outline">
                              <RotateCcw className="mr-2 size-4" />
                              Retake Quiz
                            </Button>
                          )}
                          <Button onClick={closeModule}>
                            Close Module
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Certificate Modal */}
      <AnimatePresence>
        {showCertificate && activeModule && currentProgress?.certificateEarned && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCertificate(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center space-y-6">
                <div className="border-4 border-yellow-400 p-8 bg-gradient-to-br from-yellow-50 to-orange-50">
                  <div className="mb-4">
                    <Trophy className="size-16 mx-auto text-yellow-500 mb-2" />
                    <h2 className="text-3xl font-bold text-gray-800">Certificate of Completion</h2>
                  </div>
                  
                  <div className="space-y-4 text-gray-700">
                    <p className="text-lg">This certifies that</p>
                    <p className="text-2xl font-bold text-blue-600">{role}</p>
                    <p className="text-lg">has successfully completed</p>
                    <p className="text-xl font-semibold text-purple-600">{activeModule.title}</p>
                    
                    <div className="flex justify-center gap-8 mt-6 text-sm">
                      <div className="text-center">
                        <p className="font-semibold">Score Achieved</p>
                        <p className="text-green-600 font-bold">{quizScore}%</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">Date Completed</p>
                        <p className="text-blue-600">{new Date(currentProgress.certificateDate!).toLocaleDateString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">Study Time</p>
                        <p className="text-purple-600">{Math.round((currentProgress.timeSpent || 0) / 60000)} minutes</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-yellow-300">
                    <p className="text-sm text-gray-600">Training Management System</p>
                    <p className="text-xs text-gray-500">Certificate ID: CERT-{activeModule.id.toUpperCase()}-{Date.now()}</p>
                  </div>
                </div>
                
                <div className="flex justify-center gap-3">
                  <Button
                    onClick={() => window.print()}
                    variant="outline"
                  >
                    <Printer className="size-4 mr-2" />
                    Print Certificate
                  </Button>
                  <Button
                    onClick={() => {
                      // Download functionality would go here
                      alert('Certificate download feature coming soon!')
                    }}
                    variant="outline"
                  >
                    <Download className="size-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button onClick={() => setShowCertificate(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TrainingDashboard
