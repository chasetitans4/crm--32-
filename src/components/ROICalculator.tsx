"use client"

import type React from "react"
import { useState } from "react"
import { Calculator, Download, Share2, Save, RefreshCw } from "lucide-react"
import { useAppContext } from "../context/AppContext"

const ROICalculator: React.FC = () => {
  const { state } = useAppContext()
  const { clients } = state

  // State for calculator inputs
  const [calculatorInputs, setCalculatorInputs] = useState({
    // Client information
    clientName: "",
    businessType: "",

    // Current metrics
    currentWebsiteVisitors: 1000,
    currentConversionRate: 1.5,
    currentAverageValue: 500,

    // Projected improvements
    projectedVisitorIncrease: 30,
    projectedConversionIncrease: 50,
    customerLifetimeValue: 3,

    // Project costs
    projectCost: 5000,
    monthlyCost: 500,
    contractLength: 12,

    // Additional options
    includeLifetimeValue: true,
    includeBrandValue: false,
  })

  // State for calculation results
  const [results, setResults] = useState<any>(null)
  const [savedCalculations, setSavedCalculations] = useState([
    {
      id: 1,
      clientName: "TechCorp Solutions",
      date: "2025-05-10",
      projectType: "Website Redesign",
      roi: 285,
      paybackPeriod: 4.2,
    },
    {
      id: 2,
      clientName: "Smith Dental Care",
      date: "2025-05-08",
      projectType: "Local SEO Campaign",
      roi: 320,
      paybackPeriod: 3.8,
    },
    {
      id: 3,
      clientName: "Green Lawn Services",
      date: "2025-05-05",
      projectType: "Website + SEO Package",
      roi: 410,
      paybackPeriod: 3.1,
    },
  ])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement
      setCalculatorInputs({
        ...calculatorInputs,
        [name]: checkbox.checked,
      })
    } else if (type === "number") {
      setCalculatorInputs({
        ...calculatorInputs,
        [name]: Number.parseFloat(value) || 0,
      })
    } else {
      setCalculatorInputs({
        ...calculatorInputs,
        [name]: value,
      })
    }
  }

  // Calculate ROI
  const calculateROI = () => {
    const {
      currentWebsiteVisitors,
      currentConversionRate,
      currentAverageValue,
      projectedVisitorIncrease,
      projectedConversionIncrease,
      customerLifetimeValue,
      projectCost,
      monthlyCost,
      contractLength,
      includeLifetimeValue,
    } = calculatorInputs

    // Current metrics
    const currentMonthlyLeads = currentWebsiteVisitors * (currentConversionRate / 100)
    const currentMonthlyRevenue = currentMonthlyLeads * currentAverageValue

    // Projected metrics
    const projectedVisitors = currentWebsiteVisitors * (1 + projectedVisitorIncrease / 100)
    const projectedConversionRate = currentConversionRate * (1 + projectedConversionIncrease / 100)
    const projectedMonthlyLeads = projectedVisitors * (projectedConversionRate / 100)
    const projectedMonthlyRevenue = projectedMonthlyLeads * currentAverageValue

    // Additional revenue
    const additionalMonthlyLeads = projectedMonthlyLeads - currentMonthlyLeads
    const additionalMonthlyRevenue = projectedMonthlyRevenue - currentMonthlyRevenue
    const additionalAnnualRevenue = additionalMonthlyRevenue * 12

    // Lifetime value calculations
    const lifetimeValueMultiplier = includeLifetimeValue ? customerLifetimeValue : 1
    const totalAdditionalRevenue = additionalAnnualRevenue * lifetimeValueMultiplier

    // Cost calculations
    const totalCost = projectCost + monthlyCost * contractLength

    // ROI calculations
    const roi = ((totalAdditionalRevenue - totalCost) / totalCost) * 100
    const paybackPeriod = totalCost / additionalMonthlyRevenue

    // Monthly ROI
    const monthlyROI = ((additionalMonthlyRevenue - monthlyCost) / monthlyCost) * 100

    setResults({
      currentMetrics: {
        monthlyVisitors: currentWebsiteVisitors,
        conversionRate: currentConversionRate,
        monthlyLeads: currentMonthlyLeads.toFixed(1),
        monthlyRevenue: currentMonthlyRevenue.toFixed(2),
      },
      projectedMetrics: {
        monthlyVisitors: projectedVisitors,
        conversionRate: projectedConversionRate.toFixed(2),
        monthlyLeads: projectedMonthlyLeads.toFixed(1),
        monthlyRevenue: projectedMonthlyRevenue.toFixed(2),
      },
      additionalMetrics: {
        monthlyLeads: additionalMonthlyLeads.toFixed(1),
        monthlyRevenue: additionalMonthlyRevenue.toFixed(2),
        annualRevenue: additionalAnnualRevenue.toFixed(2),
        totalRevenue: totalAdditionalRevenue.toFixed(2),
      },
      costs: {
        projectCost,
        monthlyCost,
        contractLength,
        totalCost,
      },
      roi: {
        percentage: roi.toFixed(2),
        paybackPeriod: paybackPeriod.toFixed(1),
        monthlyROI: monthlyROI.toFixed(2),
      },
    })
  }

  // Save calculation
  const saveCalculation = () => {
    if (!results) return

    const newCalculation = {
      id: Date.now(),
      clientName: calculatorInputs.clientName || "Unnamed Client",
      date: new Date().toISOString().split("T")[0],
      projectType: calculatorInputs.businessType || "Website Project",
      roi: Number.parseFloat(results.roi.percentage),
      paybackPeriod: Number.parseFloat(results.roi.paybackPeriod),
    }

    setSavedCalculations([newCalculation, ...savedCalculations])
    alert("Calculation saved successfully!")
  }

  // Reset calculator
  const resetCalculator = () => {
    setCalculatorInputs({
      clientName: "",
      businessType: "",
      currentWebsiteVisitors: 1000,
      currentConversionRate: 1.5,
      currentAverageValue: 500,
      projectedVisitorIncrease: 30,
      projectedConversionIncrease: 50,
      customerLifetimeValue: 3,
      projectCost: 5000,
      monthlyCost: 500,
      contractLength: 12,
      includeLifetimeValue: true,
      includeBrandValue: false,
    })
    setResults(null)
  }

  // Generate PDF report
  const generatePDFReport = () => {
    alert("PDF report generation would be implemented here")
    // In a real implementation, this would generate a PDF with the calculation results
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">ROI Calculator</h2>
        <div className="flex gap-2">
          <button
            onClick={resetCalculator}
            className="px-4 py-2 border rounded flex items-center gap-1 hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            Reset
          </button>
          {results && (
            <button
              onClick={saveCalculation}
              className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-1 hover:bg-blue-700"
            >
              <Save size={16} />
              Save Calculation
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">ROI Calculator</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Client Information</h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                <select
                  name="clientName"
                  value={calculatorInputs.clientName}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select a client (optional)</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.name}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                <select
                  name="businessType"
                  value={calculatorInputs.businessType}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select project type</option>
                  <option value="Website Design">Website Design</option>
                  <option value="Website Redesign">Website Redesign</option>
                  <option value="Local SEO Campaign">Local SEO Campaign</option>
                  <option value="SEO + Content Marketing">SEO + Content Marketing</option>
                  <option value="Website + SEO Package">Website + SEO Package</option>
                  <option value="E-commerce Website">E-commerce Website</option>
                </select>
              </div>

              {/* Current Metrics */}
              <h4 className="font-medium text-gray-700 pt-2">Current Metrics</h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Website Visitors</label>
                <input
                  type="number"
                  name="currentWebsiteVisitors"
                  value={calculatorInputs.currentWebsiteVisitors}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Conversion Rate (%)</label>
                <input
                  type="number"
                  name="currentConversionRate"
                  value={calculatorInputs.currentConversionRate}
                  onChange={handleInputChange}
                  step="0.1"
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Average Customer Value ($)</label>
                <input
                  type="number"
                  name="currentAverageValue"
                  value={calculatorInputs.currentAverageValue}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            {/* Projected Improvements & Costs */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Projected Improvements</h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Projected Traffic Increase (%)</label>
                <input
                  type="number"
                  name="projectedVisitorIncrease"
                  value={calculatorInputs.projectedVisitorIncrease}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Projected Conversion Rate Increase (%)
                </label>
                <input
                  type="number"
                  name="projectedConversionIncrease"
                  value={calculatorInputs.projectedConversionIncrease}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Lifetime Value Multiplier
                </label>
                <input
                  type="number"
                  name="customerLifetimeValue"
                  value={calculatorInputs.customerLifetimeValue}
                  onChange={handleInputChange}
                  step="0.1"
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <h4 className="font-medium text-gray-700 pt-2">Project Costs</h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">One-time Project Cost ($)</label>
                <input
                  type="number"
                  name="projectCost"
                  value={calculatorInputs.projectCost}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Maintenance/Service Cost ($)
                </label>
                <input
                  type="number"
                  name="monthlyCost"
                  value={calculatorInputs.monthlyCost}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contract Length (months)</label>
                <input
                  type="number"
                  name="contractLength"
                  value={calculatorInputs.contractLength}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <h4 className="font-medium text-gray-700">Additional Options</h4>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeLifetimeValue"
                name="includeLifetimeValue"
                checked={calculatorInputs.includeLifetimeValue}
                onChange={(e) =>
                  setCalculatorInputs({
                    ...calculatorInputs,
                    includeLifetimeValue: e.target.checked,
                  })
                }
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="includeLifetimeValue" className="ml-2 text-sm text-gray-700">
                Include customer lifetime value in calculations
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeBrandValue"
                name="includeBrandValue"
                checked={calculatorInputs.includeBrandValue}
                onChange={(e) =>
                  setCalculatorInputs({
                    ...calculatorInputs,
                    includeBrandValue: e.target.checked,
                  })
                }
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="includeBrandValue" className="ml-2 text-sm text-gray-700">
                Include brand value and awareness benefits (estimated)
              </label>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={calculateROI}
              className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Calculator size={18} />
              Calculate ROI
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow md:col-span-1">
          <h3 className="text-lg font-semibold mb-4">Saved Calculations</h3>

          <div className="space-y-3 max-h-[300px] overflow-y-auto mb-6">
            {savedCalculations.map((calc) => (
              <div key={calc.id} className="border rounded-lg p-3 hover:bg-gray-50">
                <div className="font-medium">{calc.clientName}</div>
                <div className="text-sm text-gray-500">
                  {calc.date} - {calc.projectType}
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <div>
                    <span className="text-gray-600">ROI:</span>
                    <span className="ml-1 font-medium text-green-600">{calc.roi}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Payback:</span>
                    <span className="ml-1 font-medium">{calc.paybackPeriod} months</span>
                  </div>
                </div>
              </div>
            ))}

            {savedCalculations.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                No saved calculations yet. Calculate and save your first ROI analysis.
              </div>
            )}
          </div>

          {results && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Calculation Results</h4>

              <div className="space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm text-blue-800 font-medium mb-1">ROI</div>
                  <div className="text-2xl font-bold text-blue-800">{results.roi.percentage}%</div>
                  <div className="text-xs text-blue-600 mt-1">Over {calculatorInputs.contractLength} months</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm text-green-800 font-medium mb-1">Monthly Revenue Gain</div>
                    <div className="text-xl font-bold text-green-800">
                      ${Number.parseFloat(results.additionalMetrics.monthlyRevenue).toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-sm text-purple-800 font-medium mb-1">Payback Period</div>
                    <div className="text-xl font-bold text-purple-800">{results.roi.paybackPeriod} months</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Additional Monthly Leads:</span>
                    <span className="font-medium">{results.additionalMetrics.monthlyLeads}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Additional Revenue:</span>
                    <span className="font-medium">
                      ${Number.parseFloat(results.additionalMetrics.totalRevenue).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Cost:</span>
                    <span className="font-medium">${results.costs.totalCost.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Monthly ROI:</span>
                    <span className="font-medium">{results.roi.monthlyROI}%</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={generatePDFReport}
                    className="flex-1 py-2 border rounded flex items-center justify-center gap-1 hover:bg-gray-50 text-sm"
                  >
                    <Download size={14} />
                    Export PDF
                  </button>

                  <button
                    onClick={() => alert("Share functionality would be implemented here")}
                    className="flex-1 py-2 border rounded flex items-center justify-center gap-1 hover:bg-gray-50 text-sm"
                  >
                    <Share2 size={14} />
                    Share
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ROICalculator
