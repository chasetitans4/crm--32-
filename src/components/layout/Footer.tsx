'use client'

import React from 'react'

interface FooterProps {
  className?: string
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer className={`bg-white border-t border-gray-200 px-6 py-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          © 2024 CRM Dashboard. All rights reserved.
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Version 1.0.0</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer