"use client"

import React, { useState, useCallback, useMemo } from "react"
import { MapPin, Search, Star, ExternalLink, Plus, X, Check, AlertTriangle, Download, RefreshCw } from "lucide-react"
import { useAppContext } from "../context/AppContext"
import type { Client, LocalSEOProfile } from "../types"

// Types
interface LocalDirectory {
  name: string
  icon: string
}

interface SEOSearchResult {
  clientName: string
  location: string
  date: string
  googleRating: number
  reviewCount: number
  directoryScore: number
}

// Constants
const LOCAL_DIRECTORIES: LocalDirectory[] = [
  { name: "Google Business Profile", icon: "google" },
  { name: "Yelp", icon: "yelp" },
  { name: "Facebook", icon: "facebook" },
  { name: "Bing Places", icon: "bing" },
  { name: "Yellow Pages", icon: "yp" },
  { name: "BBB", icon: "bbb" },
  { name: "Apple Maps", icon: "apple" },
  { name: "Foursquare", icon: "foursquare" },
  { name: "TripAdvisor", icon: "tripadvisor" },
  { name: "Angi", icon: "angi" },
]

// Mock data - should be moved to a separate file or API
const MOCK_RECENT_SEARCHES: SEOSearchResult[] = [
  {
    clientName: "Joe's Plumbing",
    location: "Austin, TX",
    date: "2025-05-10",
    googleRating: 4.7,
    reviewCount: 83,
    directoryScore: 8,
  },
  {
    clientName: "Smith Dental Care",
    location: "Portland, OR",
    date: "2025-05-08",
    googleRating: 4.9,
    reviewCount: 127,
    directoryScore: 10,
  },
  {
    clientName: "Green Lawn Services",
    location: "Miami, FL",
    date: "2025-05-05",
    googleRating: 4.2,
    reviewCount: 45,
    directoryScore: 6,
  },
]

const LocalSEO: React.FC = () => {
  const { state } = useAppContext()
  const { clients } = state

  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [businessName, setBusinessName] = useState("")
  const [businessLocation, setBusinessLocation] = useState("")
  const [isRunningSearch, setIsRunningSearch] = useState(false)
  const [showNewSearchModal, setShowNewSearchModal] = useState(false)
  const [seoProfile, setSeoProfile] = useState<LocalSEOProfile | null>(null)
  const [recentSearches] = useState<SEOSearchResult[]>(MOCK_RECENT_SEARCHES)

  // Memoized local business clients
  const localBusinessClients = useMemo(
    () => clients.filter((client) => client.businessType && client.serviceArea),
    [clients],
  )

  // Generate mock SEO profile
  const generateMockSEOProfile = useCallback((name: string, location: string): LocalSEOProfile => {
    return {
      businessName: name,
      address: `123 Main St, ${location}`,
      phone: "(555) 123-4567",
      website: `https://${name.toLowerCase().replace(/\s+/g, "-")}.com`,
      categories: ["Business", "Service"],
      description: `Professional ${name} services in ${location}`,
      hours: {
        monday: "9:00 AM - 5:00 PM",
        tuesday: "9:00 AM - 5:00 PM",
        wednesday: "9:00 AM - 5:00 PM",
        thursday: "9:00 AM - 5:00 PM",
        friday: "9:00 AM - 5:00 PM",
        saturday: "Closed",
        sunday: "Closed"
      },
      photos: [],
      reviews: {
        rating: Math.random() * 2 + 3,
        count: Math.floor(Math.random() * 100) + 10
      },
      citations: [],
      rankings: [],
      googleBusinessProfile: {
        name: name,
        address: `123 Main St, ${location}`,
        phone: "(555) 123-4567",
        website: `https://${name.toLowerCase().replace(/\s+/g, "-")}.com`,
        categories: ["Business", "Service"],
        description: `Professional ${name} services in ${location}`,
        hours: {
          monday: "9:00 AM - 5:00 PM",
          tuesday: "9:00 AM - 5:00 PM",
          wednesday: "9:00 AM - 5:00 PM",
          thursday: "9:00 AM - 5:00 PM",
          friday: "9:00 AM - 5:00 PM",
          saturday: "Closed",
          sunday: "Closed"
        },
        photos: [],
        reviews: {
          rating: Math.random() * 2 + 3,
          count: Math.floor(Math.random() * 100) + 10
        },
        claimed: Math.random() > 0.2,
        url: `https://business.google.com/${name.toLowerCase().replace(/\s+/g, "-")}`,
        rating: Math.random() * 2 + 3,
        reviewCount: Math.floor(Math.random() * 100) + 10,
        lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      },
      localDirectories: LOCAL_DIRECTORIES.map((dir) => ({
        name: dir.name,
        claimed: Math.random() > 0.3,
        url: `https://${dir.icon.toLowerCase()}.com/${name.toLowerCase().replace(/\s+/g, "-")}`,
        status: Math.random() > 0.6 ? "complete" : Math.random() > 0.3 ? "incomplete" : "needs-update",
      })),
      localRankings: [
        {
          keyword: `${name.split(" ")[0]?.toLowerCase() || ""} ${location.split(",")[0]?.toLowerCase() || ""}`,
          position: Math.floor(Math.random() * 10) + 1,
          searchVolume: Math.floor(Math.random() * 1000) + 100,
          difficulty: Math.floor(Math.random() * 100) + 1,
          lastChecked: new Date().toISOString().split("T")[0],
        },
        {
          keyword: `best ${name.split(" ")[0]?.toLowerCase() || ""} ${location.split(",")[0]?.toLowerCase() || ""}`,
          position: Math.floor(Math.random() * 20) + 1,
          searchVolume: Math.floor(Math.random() * 800) + 50,
          difficulty: Math.floor(Math.random() * 100) + 1,
          lastChecked: new Date().toISOString().split("T")[0],
        },
        {
          keyword: `${name.split(" ")[0]?.toLowerCase() || ""} near me`,
          position: Math.floor(Math.random() * 30) + 1,
          searchVolume: Math.floor(Math.random() * 1500) + 200,
          difficulty: Math.floor(Math.random() * 100) + 1,
          lastChecked: new Date().toISOString().split("T")[0],
        },
      ],
    }
  }, [])

  // Handle running a new local SEO search
  const handleRunSearch = useCallback(async () => {
    if (!businessName || !businessLocation) {
      alert("Please enter both business name and location")
      return
    }

    setIsRunningSearch(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const mockResults = generateMockSEOProfile(businessName, businessLocation)
      setSeoProfile(mockResults)
      setShowNewSearchModal(false)

      // In a real app, save to backend
      // Search completed successfully
    } catch (error) {
      // Handle search error
      alert("Failed to run search. Please try again.")
    } finally {
      setIsRunningSearch(false)
    }
  }, [businessName, businessLocation, generateMockSEOProfile])

  // Handle viewing a client's SEO profile
  const handleViewClientSEO = useCallback((client: Client) => {
    setSelectedClient(client)

    if (client.localSEO) {
      setSeoProfile(client.localSEO)
    } else {
      setSeoProfile(null)
    }
  }, [])

  // Calculate directory score (0-10)
  const calculateDirectoryScore = useCallback((profile: LocalSEOProfile): number => {
    if (!profile.localDirectories || profile.localDirectories.length === 0) return 0

    const claimed = profile.localDirectories.filter((dir) => dir.claimed).length
    return Math.round((claimed / profile.localDirectories.length) * 10)
  }, [])

  // Get status color
  const getStatusColor = useCallback((status?: string): string => {
    switch (status) {
      case "complete":
        return "text-green-600"
      case "incomplete":
        return "text-yellow-600"
      case "needs-update":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }, [])

  // Get position color
  const getPositionColor = useCallback((position: number): string => {
    if (position <= 3) return "text-green-600"
    if (position <= 10) return "text-yellow-600"
    return "text-red-600"
  }, [])

  // Export report handler
  const handleExportReport = useCallback(() => {
    if (!seoProfile) return

    // In a real app, generate PDF or CSV
    // Export report functionality
    alert("Report export functionality would be implemented here")
  }, [seoProfile])

  // Refresh data handler
  const handleRefreshData = useCallback(async () => {
    if (!selectedClient) return

    try {
      // In a real app, fetch fresh data from API
      // Refresh data for client
      alert("Data refresh functionality would be implemented here")
    } catch (error) {
      // Handle refresh error
      alert("Failed to refresh data. Please try again.")
    }
  }, [selectedClient])

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Local SEO Tracker</h2>
        <button
          onClick={() => setShowNewSearchModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          New Search
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Local Business Clients */}
        <div className="bg-white p-6 rounded-lg shadow md:col-span-1">
          <h3 className="text-lg font-semibold mb-4">Local Business Clients</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {localBusinessClients.length > 0 ? (
              localBusinessClients.map((client) => (
                <button
                  key={client.id}
                  className="w-full p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-left"
                  onClick={() => handleViewClientSEO(client)}
                  aria-label={`View SEO profile for ${client.name}`}
                >
                  <div className="font-medium">{client.name}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin size={14} />
                    {client.serviceArea?.[0] || "Location not specified"}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{client.businessType}</div>
                  {client.localSEO?.googleBusinessProfile && (
                    <div className="mt-2 flex items-center gap-1 text-sm">
                      <Star size={14} className="text-yellow-500" />
                      <span className="font-medium">{client.localSEO.googleBusinessProfile.rating?.toFixed(1)}</span>
                      <span className="text-gray-500">
                        ({client.localSEO.googleBusinessProfile.reviewCount} reviews)
                      </span>
                    </div>
                  )}
                </button>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>No local business clients found.</p>
                <p className="text-sm mt-2">Add business type and service area to your clients.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Searches */}
        <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Recent Searches</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Google Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Directory Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentSearches.map((search, index) => (
                  <tr key={`${search.clientName}-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{search.clientName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{search.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{search.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-500" />
                        <span>{search.googleRating}</span>
                        <span className="text-gray-500">({search.reviewCount})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={
                          search.directoryScore >= 8
                            ? "text-green-600"
                            : search.directoryScore >= 5
                              ? "text-yellow-600"
                              : "text-red-600"
                        }
                      >
                        {search.directoryScore}/10
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-blue-600 hover:text-blue-800">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SEO Profile Display */}
      {seoProfile && (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Local SEO Profile {selectedClient && `for ${selectedClient.name}`}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleExportReport}
                className="text-blue-600 flex items-center gap-1 px-3 py-1 border rounded hover:bg-blue-50 transition-colors"
              >
                <Download size={16} />
                Export Report
              </button>
              <button
                onClick={handleRefreshData}
                className="text-blue-600 flex items-center gap-1 px-3 py-1 border rounded hover:bg-blue-50 transition-colors"
              >
                <RefreshCw size={16} />
                Refresh Data
              </button>
            </div>
          </div>

          {/* Google Business Profile */}
          {seoProfile.googleBusinessProfile && (
            <div className="border rounded-lg p-4 mb-6">
              <h4 className="font-medium mb-3">Google Business Profile</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Status</div>
                  <div className="font-medium flex items-center gap-1">
                    {seoProfile.googleBusinessProfile.claimed ? (
                      <>
                        <Check size={16} className="text-green-600" />
                        <span className="text-green-600">Claimed</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={16} className="text-red-600" />
                        <span className="text-red-600">Not Claimed</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Rating</div>
                  <div className="font-medium flex items-center gap-1">
                    <Star size={16} className="text-yellow-500" />
                    <span>{seoProfile.googleBusinessProfile.rating?.toFixed(1) || "N/A"}</span>
                    <span className="text-gray-500">({seoProfile.googleBusinessProfile.reviewCount || 0} reviews)</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Last Updated</div>
                  <div className="font-medium">{seoProfile.googleBusinessProfile.lastUpdated || "Unknown"}</div>
                </div>
              </div>
              {seoProfile.googleBusinessProfile.url && (
                <div className="mt-3">
                  <a
                    href={seoProfile.googleBusinessProfile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                  >
                    View Google Business Profile
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Local Directory Listings */}
          {seoProfile.localDirectories && seoProfile.localDirectories.length > 0 && (
            <div className="border rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium">Local Directory Listings</h4>
                <div className="text-sm">
                  <span className="font-medium">Directory Score: </span>
                  <span
                    className={
                      calculateDirectoryScore(seoProfile) >= 8
                        ? "text-green-600 font-medium"
                        : calculateDirectoryScore(seoProfile) >= 5
                          ? "text-yellow-600 font-medium"
                          : "text-red-600 font-medium"
                    }
                  >
                    {calculateDirectoryScore(seoProfile)}/10
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {seoProfile.localDirectories.map((directory: any, index: number) => (
                  <div
                    key={`${directory.name}-${index}`}
                    className="border rounded p-3 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">{directory.name}</div>
                      <div className={`text-sm ${getStatusColor(directory.status)}`}>
                        {directory.claimed ? "Claimed" : "Not Claimed"}
                        {directory.status &&
                          ` - ${directory.status ? directory.status.charAt(0).toUpperCase() + directory.status.slice(1) : 'Unknown'}`}
                      </div>
                    </div>
                    {directory.url && (
                      <a
                        href={directory.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                        aria-label={`View ${directory.name} listing`}
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Local Keyword Rankings */}
          {seoProfile.localRankings && seoProfile.localRankings.length > 0 && (
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Local Keyword Rankings</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Keyword
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Checked
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {seoProfile.localRankings.map((ranking: any, index: number) => (
                      <tr key={`${ranking.keyword}-${index}`}>
                        <td className="px-6 py-4 whitespace-nowrap">{ranking.keyword}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`font-medium ${getPositionColor(ranking.position)}`}>
                            {ranking.position}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{ranking.lastChecked}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* New Search Modal */}
      {showNewSearchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">New Local SEO Search</h3>
              <button
                onClick={() => setShowNewSearchModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleRunSearch()
              }}
            >
              <div className="mb-4">
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Joe's Plumbing"
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="businessLocation" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Location *
                </label>
                <input
                  type="text"
                  id="businessLocation"
                  value={businessLocation}
                  onChange={(e) => setBusinessLocation(e.target.value)}
                  placeholder="Austin, TX"
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="clientSelect" className="block text-sm font-medium text-gray-700 mb-1">
                  Associate with Client (Optional)
                </label>
                <select
                  id="clientSelect"
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => {
                    const client = clients.find((c) => c.id === e.target.value)
                    if (client) {
                      setSelectedClient(client)
                    }
                  }}
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <fieldset>
                  <legend className="block text-sm font-medium text-gray-700 mb-1">Search Options</legend>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        id="googleCheck"
                        className="rounded text-blue-600 focus:ring-blue-500"
                        defaultChecked
                      />
                      <span className="ml-2 text-sm text-gray-700">Google Business Profile</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        id="directoriesCheck"
                        className="rounded text-blue-600 focus:ring-blue-500"
                        defaultChecked
                      />
                      <span className="ml-2 text-sm text-gray-700">Local Directories</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        id="rankingsCheck"
                        className="rounded text-blue-600 focus:ring-blue-500"
                        defaultChecked
                      />
                      <span className="ml-2 text-sm text-gray-700">Local Keyword Rankings</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        id="reviewsCheck"
                        className="rounded text-blue-600 focus:ring-blue-500"
                        defaultChecked
                      />
                      <span className="ml-2 text-sm text-gray-700">Reviews Analysis</span>
                    </label>
                  </div>
                </fieldset>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewSearchModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRunningSearch || !businessName || !businessLocation}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                >
                  {isRunningSearch ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search size={16} />
                      Run Search
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default LocalSEO
