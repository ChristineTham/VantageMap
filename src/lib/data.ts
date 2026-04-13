// VantageMap - Business Strategy Modelling Data Models and Sample Data

export type CapabilityLevel = 1 | 2 | 3;

export type HealthStatus = "Excellent" | "Good" | "Fair" | "Poor" | "Critical";

export type LifecyclePhase =
  | "Plan"
  | "Phase In"
  | "Active"
  | "Phase Out"
  | "End of Life";

export type TechRing = "Adopt" | "Trial" | "Assess" | "Hold";

export type TechQuadrant =
  | "Techniques"
  | "Tools"
  | "Platforms"
  | "Languages & Frameworks";

export type StrategicPerspective =
  | "Financial"
  | "Customer"
  | "Internal Process"
  | "Learning & Growth";

export type InitiativeStatus =
  | "Not Started"
  | "In Progress"
  | "Completed"
  | "On Hold"
  | "Cancelled";

export interface BusinessCapability {
  id: string;
  name: string;
  description: string;
  level: CapabilityLevel;
  parentId?: string;
  health: HealthStatus;
  owner: string;
  tags: string[];
}

export interface Application {
  id: string;
  name: string;
  description: string;
  vendor: string;
  lifecycle: LifecyclePhase;
  health: HealthStatus;
  capabilityIds: string[];
  owner: string;
  businessCriticality: "Mission Critical" | "Business Critical" | "Business Operational" | "Administrative";
  tags: string[];
  cost?: number;
  users?: number;
}

export interface StrategicObjective {
  id: string;
  name: string;
  description: string;
  perspective: StrategicPerspective;
  kpis: KPI[];
  initiatives: string[];
  parentId?: string;
}

export interface KPI {
  name: string;
  target: string;
  current: string;
  status: "On Track" | "At Risk" | "Off Track";
}

export interface Initiative {
  id: string;
  name: string;
  description: string;
  status: InitiativeStatus;
  startDate: string;
  endDate: string;
  owner: string;
  budget?: number;
  objectiveIds: string[];
  capabilityIds: string[];
  tags: string[];
}

export interface TechEntry {
  id: string;
  name: string;
  description: string;
  ring: TechRing;
  quadrant: TechQuadrant;
  moved?: -1 | 0 | 1;
  tags: string[];
}

// ─── Sample Data ───────────────────────────────────────────────────────────────

export const capabilities: BusinessCapability[] = [
  // Level 1 – top-level capabilities
  {
    id: "cap-1",
    name: "Customer Management",
    description: "All capabilities related to managing customer relationships and interactions.",
    level: 1,
    health: "Good",
    owner: "Chief Customer Officer",
    tags: ["customer", "crm"],
  },
  {
    id: "cap-2",
    name: "Product & Service Management",
    description: "Capabilities for developing, managing, and delivering products and services.",
    level: 1,
    health: "Excellent",
    owner: "Chief Product Officer",
    tags: ["product", "service"],
  },
  {
    id: "cap-3",
    name: "Financial Management",
    description: "Capabilities covering financial planning, reporting, and control.",
    level: 1,
    health: "Good",
    owner: "CFO",
    tags: ["finance", "accounting"],
  },
  {
    id: "cap-4",
    name: "Human Capital Management",
    description: "Capabilities for managing the organisation's workforce.",
    level: 1,
    health: "Fair",
    owner: "CHRO",
    tags: ["hr", "people"],
  },
  {
    id: "cap-5",
    name: "Technology & Data Management",
    description: "Capabilities related to IT infrastructure, data governance, and digital platforms.",
    level: 1,
    health: "Fair",
    owner: "CTO",
    tags: ["it", "data", "technology"],
  },
  {
    id: "cap-6",
    name: "Supply Chain Management",
    description: "End-to-end supply chain and logistics capabilities.",
    level: 1,
    health: "Good",
    owner: "COO",
    tags: ["supply-chain", "logistics"],
  },
  // Level 2 – children of Customer Management
  {
    id: "cap-1-1",
    name: "Customer Acquisition",
    description: "Attracting and converting new customers.",
    level: 2,
    parentId: "cap-1",
    health: "Good",
    owner: "VP Marketing",
    tags: ["marketing", "sales"],
  },
  {
    id: "cap-1-2",
    name: "Customer Retention",
    description: "Keeping existing customers engaged and loyal.",
    level: 2,
    parentId: "cap-1",
    health: "Fair",
    owner: "VP Customer Success",
    tags: ["retention", "loyalty"],
  },
  {
    id: "cap-1-3",
    name: "Customer Service & Support",
    description: "Providing assistance and resolving customer issues.",
    level: 2,
    parentId: "cap-1",
    health: "Good",
    owner: "VP Customer Service",
    tags: ["support", "service-desk"],
  },
  // Level 2 – children of Product & Service Management
  {
    id: "cap-2-1",
    name: "Product Development",
    description: "Ideation, design, and development of new products.",
    level: 2,
    parentId: "cap-2",
    health: "Excellent",
    owner: "VP Engineering",
    tags: ["r&d", "innovation"],
  },
  {
    id: "cap-2-2",
    name: "Product Lifecycle Management",
    description: "Managing products from introduction to retirement.",
    level: 2,
    parentId: "cap-2",
    health: "Good",
    owner: "VP Product",
    tags: ["plm", "portfolio"],
  },
  {
    id: "cap-2-3",
    name: "Pricing & Revenue Management",
    description: "Setting and optimising pricing strategies.",
    level: 2,
    parentId: "cap-2",
    health: "Fair",
    owner: "VP Finance",
    tags: ["pricing", "revenue"],
  },
  // Level 2 – children of Financial Management
  {
    id: "cap-3-1",
    name: "Financial Planning & Analysis",
    description: "Budgeting, forecasting, and financial analysis.",
    level: 2,
    parentId: "cap-3",
    health: "Good",
    owner: "VP Finance",
    tags: ["fp&a", "budgeting"],
  },
  {
    id: "cap-3-2",
    name: "Accounting & Reporting",
    description: "General ledger, accounts payable/receivable, and financial reporting.",
    level: 2,
    parentId: "cap-3",
    health: "Good",
    owner: "Controller",
    tags: ["accounting", "reporting"],
  },
  // Level 2 – children of Human Capital Management
  {
    id: "cap-4-1",
    name: "Talent Acquisition",
    description: "Recruiting and onboarding new employees.",
    level: 2,
    parentId: "cap-4",
    health: "Fair",
    owner: "VP Talent",
    tags: ["recruiting", "onboarding"],
  },
  {
    id: "cap-4-2",
    name: "Learning & Development",
    description: "Training programmes and career development.",
    level: 2,
    parentId: "cap-4",
    health: "Poor",
    owner: "L&D Director",
    tags: ["training", "development"],
  },
  // Level 2 – children of Technology & Data Management
  {
    id: "cap-5-1",
    name: "Data & Analytics",
    description: "Data management, business intelligence, and advanced analytics.",
    level: 2,
    parentId: "cap-5",
    health: "Fair",
    owner: "Chief Data Officer",
    tags: ["data", "analytics", "bi"],
  },
  {
    id: "cap-5-2",
    name: "IT Infrastructure & Operations",
    description: "Managing servers, networks, and cloud infrastructure.",
    level: 2,
    parentId: "cap-5",
    health: "Good",
    owner: "VP Infrastructure",
    tags: ["infrastructure", "cloud", "devops"],
  },
  {
    id: "cap-5-3",
    name: "Cybersecurity",
    description: "Protecting information assets and managing cyber risk.",
    level: 2,
    parentId: "cap-5",
    health: "Fair",
    owner: "CISO",
    tags: ["security", "compliance"],
  },
  // Level 2 – children of Supply Chain Management
  {
    id: "cap-6-1",
    name: "Procurement & Sourcing",
    description: "Supplier selection, negotiation, and purchasing.",
    level: 2,
    parentId: "cap-6",
    health: "Good",
    owner: "VP Procurement",
    tags: ["procurement", "sourcing"],
  },
  {
    id: "cap-6-2",
    name: "Inventory & Warehouse Management",
    description: "Stock control and warehouse operations.",
    level: 2,
    parentId: "cap-6",
    health: "Good",
    owner: "VP Operations",
    tags: ["inventory", "warehouse"],
  },
];

export const applications: Application[] = [
  {
    id: "app-1",
    name: "Salesforce CRM",
    description: "Customer relationship management platform for sales, marketing, and customer service.",
    vendor: "Salesforce",
    lifecycle: "Active",
    health: "Good",
    capabilityIds: ["cap-1-1", "cap-1-2", "cap-1-3"],
    owner: "VP Sales",
    businessCriticality: "Mission Critical",
    tags: ["crm", "saas", "cloud"],
    cost: 480000,
    users: 350,
  },
  {
    id: "app-2",
    name: "SAP S/4HANA",
    description: "Enterprise resource planning suite covering finance, logistics, and operations.",
    vendor: "SAP",
    lifecycle: "Active",
    health: "Good",
    capabilityIds: ["cap-3-1", "cap-3-2", "cap-6-1", "cap-6-2"],
    owner: "CFO",
    businessCriticality: "Mission Critical",
    tags: ["erp", "sap", "on-premise"],
    cost: 1200000,
    users: 800,
  },
  {
    id: "app-3",
    name: "Workday HCM",
    description: "Human capital management suite for HR, payroll, and talent management.",
    vendor: "Workday",
    lifecycle: "Active",
    health: "Good",
    capabilityIds: ["cap-4-1", "cap-4-2"],
    owner: "CHRO",
    businessCriticality: "Business Critical",
    tags: ["hcm", "hr", "saas", "cloud"],
    cost: 360000,
    users: 1200,
  },
  {
    id: "app-4",
    name: "Jira",
    description: "Project tracking and agile development management tool.",
    vendor: "Atlassian",
    lifecycle: "Active",
    health: "Excellent",
    capabilityIds: ["cap-2-1", "cap-2-2"],
    owner: "VP Engineering",
    businessCriticality: "Business Operational",
    tags: ["project-management", "agile", "saas"],
    cost: 95000,
    users: 650,
  },
  {
    id: "app-5",
    name: "Power BI",
    description: "Business intelligence and data visualisation platform.",
    vendor: "Microsoft",
    lifecycle: "Active",
    health: "Fair",
    capabilityIds: ["cap-5-1"],
    owner: "Chief Data Officer",
    businessCriticality: "Business Critical",
    tags: ["bi", "analytics", "microsoft"],
    cost: 120000,
    users: 400,
  },
  {
    id: "app-6",
    name: "Legacy ERP",
    description: "Legacy on-premise ERP system being phased out in favour of SAP S/4HANA.",
    vendor: "Oracle",
    lifecycle: "Phase Out",
    health: "Poor",
    capabilityIds: ["cap-3-2", "cap-6-1"],
    owner: "CTO",
    businessCriticality: "Business Critical",
    tags: ["legacy", "erp", "on-premise"],
    cost: 220000,
    users: 120,
  },
  {
    id: "app-7",
    name: "ServiceNow",
    description: "IT service management and enterprise service delivery platform.",
    vendor: "ServiceNow",
    lifecycle: "Active",
    health: "Good",
    capabilityIds: ["cap-1-3", "cap-5-2"],
    owner: "CTO",
    businessCriticality: "Business Critical",
    tags: ["itsm", "saas", "cloud"],
    cost: 280000,
    users: 500,
  },
  {
    id: "app-8",
    name: "Azure Cloud Platform",
    description: "Cloud infrastructure and platform services.",
    vendor: "Microsoft",
    lifecycle: "Active",
    health: "Good",
    capabilityIds: ["cap-5-2"],
    owner: "VP Infrastructure",
    businessCriticality: "Mission Critical",
    tags: ["cloud", "infrastructure", "azure"],
    cost: 650000,
    users: 0,
  },
  {
    id: "app-9",
    name: "Crowdstrike Falcon",
    description: "Cloud-native endpoint protection and threat intelligence platform.",
    vendor: "Crowdstrike",
    lifecycle: "Active",
    health: "Excellent",
    capabilityIds: ["cap-5-3"],
    owner: "CISO",
    businessCriticality: "Mission Critical",
    tags: ["security", "edr", "saas"],
    cost: 190000,
    users: 0,
  },
  {
    id: "app-10",
    name: "Marketo",
    description: "Marketing automation and demand generation platform.",
    vendor: "Adobe",
    lifecycle: "Phase Out",
    health: "Fair",
    capabilityIds: ["cap-1-1"],
    owner: "VP Marketing",
    businessCriticality: "Business Operational",
    tags: ["marketing", "automation", "saas"],
    cost: 140000,
    users: 80,
  },
];

export const strategicObjectives: StrategicObjective[] = [
  {
    id: "obj-1",
    name: "Grow Revenue by 20%",
    description: "Increase total revenue by 20% through new customers and expanded wallet share.",
    perspective: "Financial",
    kpis: [
      { name: "Annual Revenue Growth", target: "20%", current: "14%", status: "At Risk" },
      { name: "Net Revenue Retention", target: "115%", current: "108%", status: "At Risk" },
    ],
    initiatives: ["ini-1", "ini-2"],
  },
  {
    id: "obj-2",
    name: "Improve EBITDA Margin",
    description: "Improve EBITDA margin from 18% to 25% through cost optimisation and automation.",
    perspective: "Financial",
    kpis: [
      { name: "EBITDA Margin", target: "25%", current: "19%", status: "At Risk" },
      { name: "IT Cost as % of Revenue", target: "8%", current: "11%", status: "Off Track" },
    ],
    initiatives: ["ini-3", "ini-4"],
  },
  {
    id: "obj-3",
    name: "Improve Customer Satisfaction",
    description: "Achieve and maintain a Net Promoter Score above 60.",
    perspective: "Customer",
    kpis: [
      { name: "Net Promoter Score (NPS)", target: "60", current: "52", status: "At Risk" },
      { name: "Customer Satisfaction (CSAT)", target: "90%", current: "84%", status: "At Risk" },
    ],
    initiatives: ["ini-1", "ini-5"],
  },
  {
    id: "obj-4",
    name: "Accelerate Time-to-Market",
    description: "Reduce time from idea to production release by 40%.",
    perspective: "Internal Process",
    kpis: [
      { name: "Mean Lead Time (features)", target: "3 weeks", current: "5 weeks", status: "Off Track" },
      { name: "Deployment Frequency", target: "Daily", current: "Weekly", status: "At Risk" },
    ],
    initiatives: ["ini-3", "ini-6"],
  },
  {
    id: "obj-5",
    name: "Strengthen Data-Driven Decision Making",
    description: "Establish a data platform enabling self-serve analytics across all business units.",
    perspective: "Internal Process",
    kpis: [
      { name: "Self-serve Analytics Adoption", target: "70%", current: "35%", status: "Off Track" },
      { name: "Data Quality Score", target: "95%", current: "78%", status: "Off Track" },
    ],
    initiatives: ["ini-4", "ini-7"],
  },
  {
    id: "obj-6",
    name: "Build a High-Performance Culture",
    description: "Improve employee engagement and develop critical digital skills.",
    perspective: "Learning & Growth",
    kpis: [
      { name: "Employee Engagement Score", target: "80%", current: "71%", status: "At Risk" },
      { name: "Digital Skills Proficiency", target: "75%", current: "52%", status: "Off Track" },
    ],
    initiatives: ["ini-8"],
  },
  {
    id: "obj-7",
    name: "Reduce Cybersecurity Risk",
    description: "Achieve ISO 27001 certification and reduce critical vulnerabilities to near-zero.",
    perspective: "Internal Process",
    kpis: [
      { name: "Critical Vulnerabilities Open", target: "0", current: "4", status: "At Risk" },
      { name: "ISO 27001 Compliance", target: "100%", current: "82%", status: "At Risk" },
    ],
    initiatives: ["ini-9"],
  },
];

export const initiatives: Initiative[] = [
  {
    id: "ini-1",
    name: "CRM Modernisation",
    description: "Replace legacy CRM modules with Salesforce Sales Cloud and Service Cloud.",
    status: "In Progress",
    startDate: "2024-01-01",
    endDate: "2025-06-30",
    owner: "VP Sales",
    budget: 850000,
    objectiveIds: ["obj-1", "obj-3"],
    capabilityIds: ["cap-1-1", "cap-1-2", "cap-1-3"],
    tags: ["crm", "salesforce", "digital"],
  },
  {
    id: "ini-2",
    name: "Market Expansion – APAC",
    description: "Enter three new APAC markets with localised product and go-to-market strategy.",
    status: "In Progress",
    startDate: "2024-06-01",
    endDate: "2025-12-31",
    owner: "VP Sales",
    budget: 1200000,
    objectiveIds: ["obj-1"],
    capabilityIds: ["cap-1-1", "cap-2-1"],
    tags: ["growth", "international"],
  },
  {
    id: "ini-3",
    name: "DevOps & Platform Engineering",
    description: "Implement CI/CD pipelines and internal developer platform to accelerate delivery.",
    status: "In Progress",
    startDate: "2024-03-01",
    endDate: "2025-03-31",
    owner: "VP Engineering",
    budget: 420000,
    objectiveIds: ["obj-2", "obj-4"],
    capabilityIds: ["cap-5-2", "cap-2-1"],
    tags: ["devops", "platform", "cloud"],
  },
  {
    id: "ini-4",
    name: "Enterprise Data Platform",
    description: "Build a unified data lake and analytics platform on Azure.",
    status: "In Progress",
    startDate: "2024-07-01",
    endDate: "2026-06-30",
    owner: "Chief Data Officer",
    budget: 1500000,
    objectiveIds: ["obj-2", "obj-5"],
    capabilityIds: ["cap-5-1"],
    tags: ["data", "analytics", "azure"],
  },
  {
    id: "ini-5",
    name: "Customer Experience Redesign",
    description: "Redesign digital customer journeys across web and mobile touchpoints.",
    status: "Not Started",
    startDate: "2025-01-01",
    endDate: "2025-09-30",
    owner: "VP Customer Success",
    budget: 680000,
    objectiveIds: ["obj-3"],
    capabilityIds: ["cap-1-2", "cap-1-3"],
    tags: ["cx", "digital", "ux"],
  },
  {
    id: "ini-6",
    name: "Agile at Scale Transformation",
    description: "Roll out SAFe framework across all product and technology teams.",
    status: "In Progress",
    startDate: "2024-09-01",
    endDate: "2025-06-30",
    owner: "CTO",
    budget: 320000,
    objectiveIds: ["obj-4"],
    capabilityIds: ["cap-2-1", "cap-2-2"],
    tags: ["agile", "safe", "transformation"],
  },
  {
    id: "ini-7",
    name: "Data Literacy Programme",
    description: "Train 500 employees in data analysis and self-serve reporting tools.",
    status: "Not Started",
    startDate: "2025-02-01",
    endDate: "2025-12-31",
    owner: "Chief Data Officer",
    budget: 180000,
    objectiveIds: ["obj-5"],
    capabilityIds: ["cap-5-1", "cap-4-2"],
    tags: ["data", "training", "literacy"],
  },
  {
    id: "ini-8",
    name: "Talent & Culture Transformation",
    description: "Revamp performance management, introduce new L&D platform, and launch culture programme.",
    status: "In Progress",
    startDate: "2024-10-01",
    endDate: "2026-03-31",
    owner: "CHRO",
    budget: 750000,
    objectiveIds: ["obj-6"],
    capabilityIds: ["cap-4-1", "cap-4-2"],
    tags: ["hr", "culture", "learning"],
  },
  {
    id: "ini-9",
    name: "Cybersecurity Uplift",
    description: "Achieve ISO 27001 certification, deploy zero-trust architecture, and improve SOC capability.",
    status: "In Progress",
    startDate: "2024-04-01",
    endDate: "2025-09-30",
    owner: "CISO",
    budget: 960000,
    objectiveIds: ["obj-7"],
    capabilityIds: ["cap-5-3"],
    tags: ["security", "iso27001", "zero-trust"],
  },
];

export const techRadar: TechEntry[] = [
  // Techniques
  { id: "t-1", name: "Domain-Driven Design", description: "Approach to software development centred on the business domain.", ring: "Adopt", quadrant: "Techniques", moved: 0, tags: ["architecture"] },
  { id: "t-2", name: "Event Storming", description: "Collaborative modelling technique for exploring complex domains.", ring: "Trial", quadrant: "Techniques", moved: 1, tags: ["modelling"] },
  { id: "t-3", name: "Platform Engineering", description: "Building internal developer platforms to improve developer experience.", ring: "Adopt", quadrant: "Techniques", moved: 1, tags: ["devops"] },
  { id: "t-4", name: "Value Stream Mapping", description: "Lean technique for analysing and improving the flow of materials and information.", ring: "Adopt", quadrant: "Techniques", moved: 0, tags: ["lean"] },
  { id: "t-5", name: "Zero-Trust Security", description: "Security model that requires strict identity verification for every user and device.", ring: "Adopt", quadrant: "Techniques", moved: 1, tags: ["security"] },
  { id: "t-6", name: "FinOps", description: "Practice of bringing financial accountability to cloud spend.", ring: "Trial", quadrant: "Techniques", moved: 1, tags: ["cloud", "finance"] },
  { id: "t-7", name: "Feature Flags", description: "Technique to enable/disable features without deploying new code.", ring: "Adopt", quadrant: "Techniques", moved: 0, tags: ["devops"] },
  // Tools
  { id: "t-8", name: "GitHub Actions", description: "CI/CD automation built into GitHub.", ring: "Adopt", quadrant: "Tools", moved: 0, tags: ["devops", "ci-cd"] },
  { id: "t-9", name: "Terraform", description: "Infrastructure as code tool for provisioning cloud resources.", ring: "Adopt", quadrant: "Tools", moved: 0, tags: ["iac", "cloud"] },
  { id: "t-10", name: "Datadog", description: "Observability platform for monitoring infrastructure and applications.", ring: "Adopt", quadrant: "Tools", moved: 0, tags: ["monitoring", "observability"] },
  { id: "t-11", name: "Backstage", description: "Open-source developer portal for managing software components.", ring: "Trial", quadrant: "Tools", moved: 1, tags: ["platform"] },
  { id: "t-12", name: "OpenTelemetry", description: "Open standard for distributed tracing and observability.", ring: "Trial", quadrant: "Tools", moved: 1, tags: ["observability"] },
  { id: "t-13", name: "Apache Kafka", description: "Distributed event streaming platform.", ring: "Adopt", quadrant: "Tools", moved: 0, tags: ["messaging", "streaming"] },
  { id: "t-14", name: "Ansible", description: "Agentless automation platform for configuration management.", ring: "Hold", quadrant: "Tools", moved: -1, tags: ["automation"] },
  // Platforms
  { id: "t-15", name: "Microsoft Azure", description: "Cloud computing platform and services.", ring: "Adopt", quadrant: "Platforms", moved: 0, tags: ["cloud"] },
  { id: "t-16", name: "Kubernetes", description: "Container orchestration platform.", ring: "Adopt", quadrant: "Platforms", moved: 0, tags: ["containers", "devops"] },
  { id: "t-17", name: "Snowflake", description: "Cloud data warehouse platform.", ring: "Trial", quadrant: "Platforms", moved: 1, tags: ["data", "analytics"] },
  { id: "t-18", name: "Azure OpenAI", description: "Azure-hosted OpenAI models for enterprise AI workloads.", ring: "Assess", quadrant: "Platforms", moved: 1, tags: ["ai", "llm"] },
  { id: "t-19", name: "Confluent Cloud", description: "Managed Kafka service for event-driven architectures.", ring: "Trial", quadrant: "Platforms", moved: 0, tags: ["messaging"] },
  { id: "t-20", name: "HashiCorp Vault", description: "Secrets management and data protection platform.", ring: "Adopt", quadrant: "Platforms", moved: 0, tags: ["security", "secrets"] },
  { id: "t-21", name: "Oracle On-Premise", description: "Legacy Oracle database deployments.", ring: "Hold", quadrant: "Platforms", moved: -1, tags: ["legacy", "database"] },
  // Languages & Frameworks
  { id: "t-22", name: "TypeScript", description: "Strongly typed superset of JavaScript.", ring: "Adopt", quadrant: "Languages & Frameworks", moved: 0, tags: ["language"] },
  { id: "t-23", name: "Python", description: "General-purpose language widely used for data science and automation.", ring: "Adopt", quadrant: "Languages & Frameworks", moved: 0, tags: ["language", "data"] },
  { id: "t-24", name: "React", description: "UI library for building component-based web applications.", ring: "Adopt", quadrant: "Languages & Frameworks", moved: 0, tags: ["frontend"] },
  { id: "t-25", name: "Next.js", description: "React framework for production web applications.", ring: "Adopt", quadrant: "Languages & Frameworks", moved: 0, tags: ["frontend", "framework"] },
  { id: "t-26", name: "Go", description: "Statically typed, compiled language from Google.", ring: "Trial", quadrant: "Languages & Frameworks", moved: 1, tags: ["language", "backend"] },
  { id: "t-27", name: "FastAPI", description: "High-performance Python web framework for building APIs.", ring: "Trial", quadrant: "Languages & Frameworks", moved: 1, tags: ["python", "api"] },
  { id: "t-28", name: "Angular", description: "TypeScript-based web application framework.", ring: "Hold", quadrant: "Languages & Frameworks", moved: -1, tags: ["frontend", "framework"] },
];

// ─── Helper utilities (Rosely colour palette) ─────────────────────────────────

export const healthColour: Record<HealthStatus, string> = {
  Excellent: "bg-rosely-teal/20 text-rosely-night border border-rosely-teal",
  Good:      "bg-rosely-periwinkle/20 text-rosely-night border border-rosely-periwinkle",
  Fair:      "bg-rosely-golden/20 text-rosely-night border border-rosely-golden",
  Poor:      "bg-rosely-flamingo/20 text-rosely-night border border-rosely-flamingo",
  Critical:  "bg-rosely-rose/20 text-rosely-cream border border-rosely-rose",
};

export const healthBg: Record<HealthStatus, string> = {
  Excellent: "bg-rosely-teal/10 border-rosely-teal/50",
  Good:      "bg-rosely-periwinkle/10 border-rosely-periwinkle/50",
  Fair:      "bg-rosely-golden/10 border-rosely-golden/50",
  Poor:      "bg-rosely-flamingo/10 border-rosely-flamingo/50",
  Critical:  "bg-rosely-rose/10 border-rosely-rose/50",
};

export const lifecycleColour: Record<LifecyclePhase, string> = {
  Plan:           "bg-rosely-cornflower/20 text-rosely-night border border-rosely-cornflower",
  "Phase In":     "bg-rosely-periwinkle/20 text-rosely-night border border-rosely-periwinkle",
  Active:         "bg-rosely-teal/20 text-rosely-night border border-rosely-teal",
  "Phase Out":    "bg-rosely-flamingo/20 text-rosely-night border border-rosely-flamingo",
  "End of Life":  "bg-rosely-rose/20 text-rosely-cream border border-rosely-rose",
};

export const ringColour: Record<TechRing, string> = {
  Adopt:  "bg-rosely-teal/20 text-rosely-night border border-rosely-teal",
  Trial:  "bg-rosely-periwinkle/20 text-rosely-night border border-rosely-periwinkle",
  Assess: "bg-rosely-golden/20 text-rosely-night border border-rosely-golden",
  Hold:   "bg-rosely-rose/20 text-rosely-cream border border-rosely-rose",
};

export const ringBg: Record<TechRing, string> = {
  Adopt:  "bg-rosely-teal/10 border-rosely-teal/40",
  Trial:  "bg-rosely-periwinkle/10 border-rosely-periwinkle/40",
  Assess: "bg-rosely-golden/10 border-rosely-golden/40",
  Hold:   "bg-rosely-rose/10 border-rosely-rose/40",
};

export const perspectiveColour: Record<StrategicPerspective, string> = {
  Financial:          "bg-rosely-teal/20 text-rosely-night border border-rosely-teal",
  Customer:           "bg-rosely-periwinkle/20 text-rosely-night border border-rosely-periwinkle",
  "Internal Process": "bg-rosely-lilac/20 text-rosely-night border border-rosely-lilac",
  "Learning & Growth":"bg-rosely-flamingo/20 text-rosely-night border border-rosely-flamingo",
};

export const perspectiveBg: Record<StrategicPerspective, string> = {
  Financial:          "bg-rosely-teal/10 border-rosely-teal/40",
  Customer:           "bg-rosely-periwinkle/10 border-rosely-periwinkle/40",
  "Internal Process": "bg-rosely-lilac/10 border-rosely-lilac/40",
  "Learning & Growth":"bg-rosely-flamingo/10 border-rosely-flamingo/40",
};

export const kpiStatusColour: Record<KPI["status"], string> = {
  "On Track": "text-rosely-teal",
  "At Risk":  "text-rosely-golden",
  "Off Track":"text-rosely-rose",
};

export const initiativeStatusColour: Record<InitiativeStatus, string> = {
  "Not Started": "bg-rosely-mist/20 text-rosely-dusk border border-rosely-mist",
  "In Progress": "bg-rosely-periwinkle/20 text-rosely-night border border-rosely-periwinkle",
  Completed:     "bg-rosely-teal/20 text-rosely-night border border-rosely-teal",
  "On Hold":     "bg-rosely-golden/20 text-rosely-night border border-rosely-golden",
  Cancelled:     "bg-rosely-rose/20 text-rosely-cream border border-rosely-rose",
};

export const criticalityColour: Record<Application["businessCriticality"], string> = {
  "Mission Critical":    "bg-rosely-rose/20 text-rosely-cream border border-rosely-rose",
  "Business Critical":   "bg-rosely-flamingo/20 text-rosely-night border border-rosely-flamingo",
  "Business Operational":"bg-rosely-golden/20 text-rosely-night border border-rosely-golden",
  Administrative:        "bg-rosely-mist/20 text-rosely-dusk border border-rosely-mist",
};
