// Data constants for WebDesignQuote component

export const industries: { [key: string]: string[] } = {
  Healthcare: ["General Practice", "Dental", "Veterinary", "Mental Health", "Physical Therapy"],
  "Professional Services": ["Legal", "Accounting", "Consulting", "Insurance", "Financial Services"],
  "Real Estate": ["Residential Sales", "Commercial Sales", "Property Management", "Real Estate Investment"],
  Retail: ["Fashion", "Electronics", "Home & Garden", "Sports", "General Retail"],
  "Food & Dining": ["Restaurant", "Cafe", "Bakery", "Bar", "Food Truck"],
  "Home Services": ["Plumbing", "Electrical", "HVAC", "Landscaping", "Cleaning"],
  Technology: ["Software", "IT Services", "Web Development", "Tech Support", "SaaS"],
  Education: ["School", "Tutoring", "Online Learning", "Training Center", "University"],
  "Beauty & Wellness": ["Salon", "Spa", "Fitness", "Wellness Center", "Medical Spa"],
  Manufacturing: ["Industrial", "Food Processing", "Electronics", "Textiles", "Custom"],
  Childcare: ["Daycare Center", "Preschool", "After-School Program", "Summer Camp", "Nanny Services"],
  Nonprofit: ["Charity", "Foundation", "Religious Organization", "Community Service", "Advocacy Group"],
  Entertainment: ["Event Planning", "Photography", "Music/DJ Services", "Theater", "Recreation Center"],
  Transportation: ["Taxi/Rideshare", "Moving Services", "Logistics", "Car Rental", "Public Transit"],
  Construction: ["General Contractor", "Roofing", "Flooring", "Renovation", "Architecture"],
  Automotive: ["Auto Repair", "Car Dealership", "Auto Parts", "Car Wash", "Towing Services"],
  Agriculture: ["Farm", "Landscaping Supply", "Agricultural Equipment", "Nursery", "Farmers Market"],
  "Sports & Recreation": [
    "Gym/Fitness Center",
    "Sports Team",
    "Recreation Facility",
    "Outdoor Adventures",
    "Sports Equipment",
  ],
  Other: ["Please specify"],
}

export const baseGoals = [
  "Showcase services/products (informational)",
  "Generate leads and capture contact information",
  "Build brand awareness and credibility",
  "Provide customer support and resources",
  "Enable online transactions/sales",
]

export const industrySpecificGoalsData: { [key: string]: string[] } = {
  Healthcare: [
    "Enable online appointment booking and scheduling",
    "Provide patient portal for medical records access",
    "Offer telemedicine and virtual consultation services",
    "Display provider credentials and specialties",
    "Share health education and wellness resources",
  ],
  "Real Estate": [
    "Showcase property listings with detailed information",
    "Enable advanced property search and filtering",
    "Provide market analysis and neighborhood data",
    "Generate qualified buyer and seller leads",
    "Offer property valuation and market estimates",
  ],
  "Professional Services": [
    "Establish professional credibility and expertise",
    "Generate qualified consultation requests",
    "Showcase case studies and client success stories",
    "Provide service calculators and cost estimators",
    "Enable secure client portal access",
  ],
  "Food & Dining": [
    "Display menu with pricing and descriptions",
    "Enable online ordering and delivery",
    "Facilitate table reservations and booking",
    "Showcase restaurant atmosphere and dining experience",
    "Provide allergen and nutritional information",
  ],
  Technology: [
    "Comprehensive API documentation and guides",
    "Developer portal with resources and tools",
    "Interactive product demos and trials",
    "Integration showcase with partner platforms",
    "Support ticket system and help desk",
  ],
}

export const getIndustryGoals = (industry: string) => {
  return [...baseGoals, ...(industrySpecificGoalsData[industry] || [])]
}

// Export businessGoals for compatibility
export const businessGoals = baseGoals

export const generalFeatures = [
  // Included features
  "Basic Contact Form (Included)",
  "Photo gallery and image showcase (Included)",
  "About Us Page with Company Information (Included)",
  "Service/product descriptions and pricing (Included)",
  "Contact Information with Google Maps integration and directions (Included)",
  "Search functionality (Included)",
  "Mobile-responsive design (Included)",
  "Social media integration (Included)",
  "Basic SEO optimization (Included)",
  "SSL certificate and basic security (Included)",
  "Content management system (Included)",
  "Basic analytics setup (Included)",
  "Cross-browser compatibility (Included)",
  "Basic performance optimization (Included)",
  "Professional email setup (Included)",

  // Optional features
  "E-commerce functionality with shopping cart",
  "Online booking/appointment system",
  "Customer login/registration system",
  "Blog/news section with CMS",
  "Advanced SEO package",
  "Social media feed integration",
  "Live chat functionality",
  "Newsletter signup and email marketing integration",
  "Multi-language support",
  "Advanced analytics and reporting",
  "Custom forms and surveys",
  "Video integration and streaming",
  "Advanced security features",
  "API integrations",
  "Custom database functionality",
  "Advanced performance optimization",
  "Maintenance and support package"
]

// Export websiteFeatures for compatibility
export const websiteFeatures = generalFeatures

export const industrySpecificFeaturesData: { [key: string]: string[] } = {
  Healthcare: [
    "Online appointment booking and scheduling",
    "Patient portal with secure login",
    "Telemedicine integration and video consultations",
    "Insurance verification and billing portal",
    "Electronic prescription refill requests",
    "Medical records management",
    "Health screening questionnaires",
    "Provider directory and specialties",
    "Emergency contact information",
    "Health education resources",
    "Lab results and test reporting portal",
    "Medication management and reminders",
    "Appointment reminder and notification system",
    "HIPAA-compliant messaging system",
    "Insurance claims tracking",
    "Referral management system",
    "Symptom checker and health assessments",
    "Vaccination records and scheduling",
    "Chronic disease management tools",
    "Mental health resources and support",
    "Wellness program enrollment",
    "Medical device integration",
    "Emergency medical information access",
    "Multi-language support for diverse patients",
    "Accessibility features for disabled patients",
  ],
  // Add other industry-specific features as needed
}