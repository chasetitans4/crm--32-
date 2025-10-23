"use client"

import React, { useState, useEffect } from "react"

interface NavigationItem {
  id: string
  label: string
  href: string
}

interface QuickNavigationProps {
  isOpen: boolean
  onClose: () => void
  navigationItems: NavigationItem[]
  setActiveTab?: (tab: string) => void
}

const QuickNavigation: React.FC<QuickNavigationProps> = ({ isOpen, onClose, navigationItems = [], setActiveTab }) => {
  const [internalActiveTab, setInternalActiveTab] = useState<string | null>(null)

  useEffect(() => {
    if (typeof document === 'undefined') return
    
    if (isOpen) {
      document.body.classList.add("overflow-hidden")
    } else {
      document.body.classList.remove("overflow-hidden")
    }
    return () => {
      document.body.classList.remove("overflow-hidden")
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  const handleItemSelect = (item: NavigationItem) => {
    setActiveTab?.(item.id)
    onClose()

    // Scroll to top after navigation
    setTimeout(() => {
      if (typeof document === 'undefined') return
      
      const mainContent = document.querySelector('main[class*="overflow-auto"]') as HTMLElement
      if (mainContent) {
        mainContent.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth",
        })
      }
    }, 200) // Longer delay to account for modal closing animation
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50">
      <div className="absolute top-0 right-0 w-80 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out">
        <div className="p-4 h-full overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Quick Navigation</h2>
          <ul>
            {(navigationItems || []).map((item) => (
              <li key={item.id} className="mb-2">
                <button
                  onClick={() => handleItemSelect(item)}
                  className={`block w-full text-left py-2 px-4 rounded hover:bg-gray-100 ${
                    internalActiveTab === item.id ? "bg-gray-200" : ""
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
          <button onClick={onClose} className="mt-4 py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default QuickNavigation
