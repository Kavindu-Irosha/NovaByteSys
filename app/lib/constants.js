export const SERVICES = {
  WEBSITE_DEVELOPMENT: "Website Development",
  WEB_APPLICATIONS: "Web Applications",
  MOBILE_APPLICATIONS: "Mobile Applications",
  DESKTOP_APPLICATIONS: "Desktop Applications",
  POS_SYSTEMS: "POS Systems",
  GRAPHIC_DESIGNING: "Graphic Designing",
  UI_UX_DESIGN: "UI/UX Design",
  MAINTENANCE_SUPPORT: "Maintenance & Support"
};

export const PACKAGES = {
  [SERVICES.WEBSITE_DEVELOPMENT]: [
    { name: "Starter", price: 15000 },
    { name: "Business", price: 35000 },
    { name: "Premium", price: 60000 },
    { name: "Enterprise", price: 100000 },
  ],
  [SERVICES.WEB_APPLICATIONS]: [
    { name: "MVP Launch", price: 50000 },
    { name: "Growth", price: 100000 },
    { name: "Scale", price: 200000 },
    { name: "Enterprise", price: 400000 },
  ],
  [SERVICES.MOBILE_APPLICATIONS]: [
    { name: "Starter App", price: 60000 },
    { name: "Pro", price: 150000 },
    { name: "Business", price: 300000 },
    { name: "Enterprise", price: 500000 },
  ],
  [SERVICES.DESKTOP_APPLICATIONS]: [
    { name: "Basic Tool", price: 55000 },
    { name: "Professional", price: 110000 },
    { name: "Business", price: 220000 },
    { name: "Enterprise", price: 400000 },
  ],
  [SERVICES.POS_SYSTEMS]: [
    { name: "Basic POS", price: 45000 },
    { name: "Standard POS", price: 70000 },
    { name: "Advanced POS", price: 150000 },
    { name: "Enterprise", price: 350000 },
  ],
  [SERVICES.GRAPHIC_DESIGNING]: [
    { name: "Starter", price: 5000 },
    { name: "Brand Kit", price: 15000 },
    { name: "Creative Pro", price: 35000 },
    { name: "Enterprise", price: 80000 },
  ],
  [SERVICES.UI_UX_DESIGN]: [
    { name: "Essential", price: 15000 },
    { name: "Professional", price: 30000 },
    { name: "Premium", price: 60000 },
    { name: "Enterprise", price: 120000 },
  ],
  [SERVICES.MAINTENANCE_SUPPORT]: [
    { name: "Basic", price: 3000 },
    { name: "Standard", price: 8000 },
    { name: "Premium", price: 18000 },
    { name: "Enterprise", price: 35000 },
  ]
};
