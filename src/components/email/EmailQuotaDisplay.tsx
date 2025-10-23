"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Progress } from "../ui/progress"
import { Badge } from "../ui/badge"
import { emailService } from "../../services/emailService"
import { Mail, HardDrive, Calendar, AlertTriangle, CheckCircle } from "lucide-react"

interface EmailQuotaDisplayProps {
  userId: string
}

const EmailQuotaDisplay: React.FC<EmailQuotaDisplayProps> = ({ userId }) => {
  const [quotaStatus, setQuotaStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadQuotaStatus()
  }, [userId])

  const loadQuotaStatus = async () => {
    try {
      setLoading(true)
      const status = await emailService.getQuotaStatus(userId)
      setQuotaStatus(status)
    } catch (error) {
      console.error("Failed to load quota status:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!quotaStatus) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
            <p>Unable to load quota information</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getDailyPercentage = () => (quotaStatus.daily.used / quotaStatus.daily.limit) * 100
  const getMonthlyPercentage = () => (quotaStatus.monthly.used / quotaStatus.monthly.limit) * 100
  const getStoragePercentage = () => (quotaStatus.storage.used / quotaStatus.storage.limit) * 100

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600"
    if (percentage >= 75) return "text-yellow-600"
    return "text-green-600"
  }

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 90) return <AlertTriangle className="h-4 w-4" />
    return <CheckCircle className="h-4 w-4" />
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Usage Overview
          </CardTitle>
          <CardDescription>Monitor your email sending limits and storage usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Daily Quota */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Daily Emails</span>
                {getDailyPercentage() >= 90 && (
                  <Badge variant="destructive" className="text-xs">
                    Critical
                  </Badge>
                )}
              </div>
              <div className={`flex items-center gap-1 ${getStatusColor(getDailyPercentage())}`}>
                {getStatusIcon(getDailyPercentage())}
                <span className="text-sm font-medium">
                  {quotaStatus.daily.used} / {quotaStatus.daily.limit}
                </span>
              </div>
            </div>
            <Progress value={getDailyPercentage()} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{quotaStatus.daily.remaining} remaining today</span>
              <span>{getDailyPercentage().toFixed(1)}% used</span>
            </div>
          </div>

          {/* Monthly Quota */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Monthly Emails</span>
                {getMonthlyPercentage() >= 90 && (
                  <Badge variant="destructive" className="text-xs">
                    Critical
                  </Badge>
                )}
              </div>
              <div className={`flex items-center gap-1 ${getStatusColor(getMonthlyPercentage())}`}>
                {getStatusIcon(getMonthlyPercentage())}
                <span className="text-sm font-medium">
                  {quotaStatus.monthly.used} / {quotaStatus.monthly.limit}
                </span>
              </div>
            </div>
            <Progress value={getMonthlyPercentage()} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{quotaStatus.monthly.remaining} remaining this month</span>
              <span>{getMonthlyPercentage().toFixed(1)}% used</span>
            </div>
          </div>

          {/* Storage Quota */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-orange-600" />
                <span className="font-medium">Email Storage</span>
                {getStoragePercentage() >= 90 && (
                  <Badge variant="destructive" className="text-xs">
                    Critical
                  </Badge>
                )}
              </div>
              <div className={`flex items-center gap-1 ${getStatusColor(getStoragePercentage())}`}>
                {getStatusIcon(getStoragePercentage())}
                <span className="text-sm font-medium">
                  {quotaStatus.storage.used.toFixed(1)} / {quotaStatus.storage.limit} MB
                </span>
              </div>
            </div>
            <Progress value={getStoragePercentage()} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{quotaStatus.storage.remaining.toFixed(1)} MB available</span>
              <span>{getStoragePercentage().toFixed(1)}% used</span>
            </div>
          </div>

          {/* Warnings */}
          {(getDailyPercentage() >= 90 || getMonthlyPercentage() >= 90 || getStoragePercentage() >= 90) && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Quota Warning</span>
              </div>
              <div className="text-sm text-red-700 space-y-1">
                {getDailyPercentage() >= 90 && <p>• Daily email limit almost reached. Resets tomorrow.</p>}
                {getMonthlyPercentage() >= 90 && (
                  <p>• Monthly email limit almost reached. Consider upgrading your plan.</p>
                )}
                {getStoragePercentage() >= 90 && (
                  <p>• Email storage almost full. Clean up old emails or upgrade storage.</p>
                )}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Tips to Optimize Usage</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use email templates to save time and maintain consistency</li>
              <li>• Enable attachment compression to save storage space</li>
              <li>• Clean up old emails regularly to free up storage</li>
              <li>• Schedule bulk emails to spread usage across days</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EmailQuotaDisplay
