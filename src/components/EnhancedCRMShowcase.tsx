"use client";

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import {
  CreditCard,
  FileCheck,
  Users,
  BarChart3,
  Bell,
  FolderOpen,
  ArrowRight,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Zap,
  Star,
  Target,
  Calendar,
  MessageSquare,
} from "lucide-react"

interface FeatureCard {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  status: "new" | "enhanced" | "improved"
  benefits: string[]
  demoAction: string
}

const EnhancedCRMShowcase: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null)

  const enhancedFeatures: FeatureCard[] = [
    {
      id: "payment-system",
      title: "Enhanced Payment Processing",
      description: "Multi-gateway payment processing with partial payments and automated invoicing",
      icon: <CreditCard className="h-6 w-6" />,
      status: "new",
      benefits: [
        "Multiple payment gateways (Stripe, PayPal, Square)",
        "Partial payment support",
        "Automated payment reminders",
        "Real-time payment tracking",
        "Payment link generation",
      ],
      demoAction: "View Payment System",
    },
    {
      id: "contract-approval",
      title: "Contract Approval Workflow",
      description: "Streamlined contract approval process with digital signatures and version control",
      icon: <FileCheck className="h-6 w-6" />,
      status: "new",
      benefits: [
        "Multi-stage approval process",
        "Digital signature integration",
        "Version control and history",
        "Automated notifications",
        "Approval analytics",
      ],
      demoAction: "View Approval Workflow",
    },
    {
      id: "client-portal",
      title: "Enhanced Client Portal",
      description: "Real-time project tracking with improved collaboration and communication tools",
      icon: <Users className="h-6 w-6" />,
      status: "enhanced",
      benefits: [
        "Real-time project updates",
        "Milestone tracking",
        "Change request management",
        "Direct client communication",
        "File sharing and collaboration",
      ],
      demoAction: "View Client Portal",
    },
    {
      id: "financial-dashboard",
      title: "Financial Analytics Dashboard",
      description: "Comprehensive financial insights with cash flow projections and revenue analytics",
      icon: <BarChart3 className="h-6 w-6" />,
      status: "new",
      benefits: [
        "Real-time financial metrics",
        "Cash flow projections",
        "Revenue trend analysis",
        "Profit margin tracking",
        "Financial forecasting",
      ],
      demoAction: "View Financial Dashboard",
    },
    {
      id: "smart-notifications",
      title: "Automated Notification System",
      description: "Intelligent notifications with customizable rules and multi-channel delivery",
      icon: <Bell className="h-6 w-6" />,
      status: "new",
      benefits: [
        "Smart notification rules",
        "Multi-channel delivery",
        "Customizable preferences",
        "Priority-based alerts",
        "Notification analytics",
      ],
      demoAction: "View Notification System",
    },
    {
      id: "project-management",
      title: "Advanced Project Management",
      description: "Comprehensive project management with Gantt charts and resource allocation",
      icon: <FolderOpen className="h-6 w-6" />,
      status: "enhanced",
      benefits: [
        "Gantt chart visualization",
        "Resource allocation tracking",
        "Task dependencies",
        "Milestone management",
        "Team collaboration tools",
      ],
      demoAction: "View Project Management",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-green-100 text-green-800"
      case "enhanced":
        return "bg-blue-100 text-blue-800"
      case "improved":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <Star className="h-3 w-3" />
      case "enhanced":
        return <TrendingUp className="h-3 w-3" />
      case "improved":
        return <Zap className="h-3 w-3" />
      default:
        return <CheckCircle className="h-3 w-3" />
    }
  }

  const handleFeatureDemo = (featureId: string) => {
    // Map feature IDs to actual component routes
    const routeMap: Record<string, string> = {
      "payment-system": "enhancedpaymentsystem",
      "contract-approval": "contractapprovalworkflow",
      "client-portal": "enhancedclientportal",
      "financial-dashboard": "financialdashboard",
      "smart-notifications": "automatednotificationsystem",
      "project-management": "advancedprojectmanagement",
    }

    // This would typically use a router or state management
    // For now, we'll just show an alert
    alert(`Navigating to ${routeMap[featureId]} component...`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Enhanced CRM Features</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Discover the powerful new features that transform your CRM experience with advanced automation, enhanced
          workflows, and comprehensive analytics.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">6</div>
            <div className="text-sm text-gray-600">New Features</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">50%</div>
            <div className="text-sm text-gray-600">Time Saved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">30%</div>
            <div className="text-sm text-gray-600">Revenue Increase</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <MessageSquare className="h-8 w-8 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">95%</div>
            <div className="text-sm text-gray-600">Client Satisfaction</div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Showcase */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Feature Overview</TabsTrigger>
          <TabsTrigger value="benefits">Business Benefits</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enhancedFeatures.map((feature) => (
              <Card
                key={feature.id}
                className={`transition-all duration-200 hover:shadow-lg cursor-pointer ${
                  selectedFeature === feature.id ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => setSelectedFeature(selectedFeature === feature.id ? null : feature.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">{feature.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <Badge className={`mt-1 text-xs ${getStatusColor(feature.status)}`} variant="secondary">
                          <span className="flex items-center space-x-1">
                            {getStatusIcon(feature.status)}
                            <span className="capitalize">{feature.status}</span>
                          </span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="mt-2">{feature.description}</CardDescription>
                </CardHeader>

                {selectedFeature === feature.id && (
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Key Benefits:</h4>
                      <ul className="space-y-1">
                        {feature.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleFeatureDemo(feature.id)
                        }}
                        className="w-full mt-4"
                        variant="outline"
                      >
                        {feature.demoAction}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="benefits" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Operational Efficiency</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Process Automation</span>
                  <span className="text-sm font-medium">+65%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Manual Task Reduction</span>
                  <span className="text-sm font-medium">-40%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Response Time</span>
                  <span className="text-sm font-medium">-50%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                  <span>Financial Impact</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Revenue Growth</span>
                  <span className="text-sm font-medium">+30%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cost Reduction</span>
                  <span className="text-sm font-medium">-25%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Profit Margin</span>
                  <span className="text-sm font-medium">+20%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span>Client Experience</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Client Satisfaction</span>
                  <span className="text-sm font-medium">95%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Project Delivery</span>
                  <span className="text-sm font-medium">+35%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Communication</span>
                  <span className="text-sm font-medium">+60%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  <span>Project Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">On-time Delivery</span>
                  <span className="text-sm font-medium">92%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Resource Utilization</span>
                  <span className="text-sm font-medium">+45%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Team Productivity</span>
                  <span className="text-sm font-medium">+55%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Transform Your CRM Experience?</h3>
          <p className="text-gray-600 mb-4">
            Explore each feature in detail and see how they can revolutionize your business operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => handleFeatureDemo("payment-system")} className="bg-blue-600 hover:bg-blue-700">
              Start with Payment System
            </Button>
            <Button onClick={() => handleFeatureDemo("financial-dashboard")} variant="outline">
              View Financial Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EnhancedCRMShowcase
