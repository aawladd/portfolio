window.PORTFOLIO_DATA = {
  profile: {
    name: "MD. AWLAD HOSSAIN",
    role: "Applied Mathematics | Research & Teaching",
    location: "Dhaka, Bangladesh",
    email: "mdawlad.du@gmail.com",
    phone: "+880 1776041967",
    cv: "assets/files/Md_Awlad_Hossain_CV.pdf",
    avatar: "assets/img/Awlad.jpg",
    tagline:
      "Applied mathematics researcher focused on scientific computing, intelligent systems, robotics, and control.",
    profiles: {
      scholar: "https://scholar.google.com/citations?user=klpg31MAAAAJ&hl=en&authuser=4",
      orcid: "https://orcid.org/0009-0008-6017-0948",
      github: "https://github.com/aawladd",
      linkedin: "https://www.linkedin.com/in/md-awlad/",
      youtube: "https://www.youtube.com/FunctionalValue",
      researchgate: "https://www.researchgate.net/profile/Md-Hossain-1286?ev=hdr_xprf",
    },
  },
  nav: [
    { label: "Home", href: "index.html", page: "home" },
    { label: "Research", href: "research.html", page: "research" },
    { label: "Projects", href: "projects.html", page: "projects" },
    { label: "Teaching", href: "teaching.html", page: "teaching" },
    { label: "YouTube", href: "youtube.html", page: "youtube" },
    { label: "Contact", href: "contact.html", page: "contact" },
  ],
  home: {
    eyebrow: "Academic portfolio",
    title: "Applied Mathematics & Intelligent Systems",
    summary:
      "Research, projects, teaching, and technical work in simulation, scientific machine learning, robotics, and control.",
    highlights: [
      "Simulation",
      "Robotics",
      "Scientific ML",
      "AI/Deep Learning",
      "Meteorology",
      "Control",
    ],
    facts: [
      {
        label: "Focus",
        value: "Scientific computing, AI, robotics, and control",
      },
      {
        label: "Methods",
        value: "Simulation, deep learning, SciML, and embedded systems",
      },
      {
        label: "Website",
        value: "Research profile, projects, teaching, and contact",
      },
    ],
  },
  research: {
    statement:
      "My work connects applied mathematics, simulation, scientific machine learning, robotics, and control for practical scientific and engineering problems.",
    longStatement: [
      "I develop and document computational workflows where models, data, and implementation meet.",
      "The goal is clear methodology, reproducible experiments, and results that can support publication, teaching, and real systems.",
    ],
    themes: [
      {
        title: "Simulation and scientific computation",
        label: "Theme 01",
        text: "Computational workflows and analysis pipelines for scientifically meaningful modeling, prediction, interpretation, and visualization.",
        tags: ["Numerical simulation", "WRF", "Forecasting", "Visualization"],
      },
      {
        title: "Robotics and intelligent systems",
        label: "Theme 02",
        text: "Embodied systems where sensing, low-level control, computation, and learning meet in practical experiments.",
        tags: ["Robotics", "Embedded systems", "ROS2", "Control"],
      },
      {
        title: "Scientific machine learning and control",
        label: "Theme 03",
        text: "Physical structure, machine learning, and control-theoretic thinking for more reliable intelligent systems.",
        tags: ["PINN", "DeepONet", "RL", "Hybrid models"],
      },
      {
        title: "Weather, rainfall, and meteorological AI",
        label: "Theme 04",
        text: "Modeling and data-driven analysis for rainfall, lightning proxies, forecast interpretation, and publication-quality weather diagnostics.",
        tags: ["WRF", "GPM", "Rainfall", "Meteorology"],
      },
    ],
    methods: [
      "Simulation-aware and physics-aware machine learning",
      "Robotics experiments grounded in sensing and control",
      "Deep learning for structured scientific and engineering data",
      "Control-theoretic thinking for trustworthy intelligent behavior",
      "Publication-quality evaluation, visualization, and reproducibility",
    ],
    questions: [
      {
        title:
          "How can scientific structure improve machine learning performance and trust?",
        text: "This includes physics-informed losses, hybrid models, domain-aware features, and evaluation strategies beyond black-box prediction.",
      },
      {
        title:
          "How can robotics systems combine learning with reliable control?",
        text: "The goal is to connect sensing, embedded implementation, and control strategies with intelligent adaptation that remains stable and useful.",
      },
      {
        title:
          "How can simulation outputs support more effective intelligent systems?",
        text: "Simulation data can act as structure, supervision, prior knowledge, or benchmarking evidence for learning and analysis pipelines.",
      },
      {
        title: "How can research be communicated clearly across audiences?",
        text: "Strong academic work should be documented through clear writing, reproducible code, teaching materials, and technical outreach.",
      },
    ],
    workflow: [
      "Problem framing through scientific, engineering, or system-level questions",
      "Model design using simulation, learning, control, or hybrid methods",
      "Implementation with code, experiments, visualization, and documentation",
      "Evaluation through comparisons, ablations, interpretation, and technical writing",
    ],
  },
  publications: [
    {
      year: "Ongoing",
      type: "Manuscript",
      title:
        "Physics-informed neural operator pipeline for spatially heterogeneous simulation environments",
      venue: "In preparation",
      description:
        "A research manuscript focused on environment generation, operator learning, and publication-quality validation for scientific machine learning.",
      tags: ["PINO", "SciML", "Uncertainty", "Simulation"],
    },
    {
      year: "Ongoing",
      type: "Manuscript",
      title: "WRF-based rainfall and lightning diagnostics over Bangladesh",
      venue: "In preparation",
      description:
        "A meteorological simulation study using nested domains, rainfall diagnostics, satellite comparison, and lightning proxy analysis.",
      tags: ["WRF", "GPM", "Bangladesh", "Rainfall"],
    },
    {
      year: "Ongoing",
      type: "Research note",
      title: "PINN, reinforcement learning, and control for mobile robotics",
      venue: "Project documentation",
      description:
        "A control-oriented robotics workflow combining embedded sensing, low-level control, and learning-based high-level decision systems.",
      tags: ["Robotics", "PINN", "RL", "Control"],
    },
  ],
  projects: [
    {
      title: "Physics-informed neural operator environment",
      category: "scientific-ml",
      meta: "Scientific ML · Simulation",
      description:
        "A complete environment-generation and learning pipeline for spatially heterogeneous fields, validation diagnostics, and paper-ready visualization.",
      tags: ["PINO", "PyTorch", "Uncertainty", "Validation"],
    },
    {
      title: "WRF rainfall and lightning event analysis",
      category: "simulation",
      meta: "Meteorology · Forecast diagnostics",
      description:
        "Nested-domain numerical weather simulation for Bangladesh rainfall events with GPM comparison, WRF diagnostics, and lightning proxy interpretation.",
      tags: ["WRF", "GPM IMERG", "Basemap", "Lightning"],
    },
    {
      title: "Yahboom smart robot control stack",
      category: "robotics",
      meta: "Robotics · Embedded control",
      description:
        "A low-level to high-level control workflow linking MSPM0, motor drivers, UART communication, RDK X5, sensors, and ROS2 integration.",
      tags: ["MSPM0", "RDK X5", "UART", "ROS2"],
    },
    {
      title: "Single motor PID control demonstration",
      category: "control",
      meta: "Control · Education",
      description:
        "A compact experimental system for teaching speed control, encoder feedback, PWM actuation, and PID tuning with an ESP32-S3 and L298N motor driver.",
      tags: ["PID", "ESP32-S3", "L298N", "Encoder"],
    },
    {
      title: "Rainfall ROM and forecasting workflow",
      category: "scientific-ml",
      meta: "Reduced-order modeling",
      description:
        "A POD and latent-correction pipeline for rainfall field reconstruction, block-basis analysis, and forecast-oriented model comparison.",
      tags: ["POD", "ROM", "Forecasting", "Rainfall"],
    },
    {
      title: "Research communication and teaching materials",
      category: "communication",
      meta: "Education · Public scholarship",
      description:
        "YouTube and teaching resources that translate mathematical modeling, code, robotics, and scientific computing into accessible technical explanations.",
      tags: ["Teaching", "YouTube", "Technical notes", "Mentoring"],
    },
  ],
  teaching: {
    statement:
      "Teaching is focused on mathematical clarity, computational practice, and research-led examples.",
    areas: [
      {
        title: "Calculus and differential equations",
        description:
          "Conceptual explanation, analytical methods, modeling interpretation, and computational visualization.",
      },
      {
        title: "Linear algebra and numerical methods",
        description:
          "Matrix methods, eigenvalue problems, numerical approximation, stability, and reproducible computation.",
      },
      {
        title: "Probability, statistics, and data analysis",
        description:
          "Statistical reasoning, uncertainty, model evaluation, and data-driven scientific interpretation.",
      },
      {
        title: "Machine learning for science and engineering",
        description:
          "Supervised learning, neural networks, physics-informed learning, scientific data, and critical evaluation.",
      },
      {
        title: "Robotics, control, and embedded systems",
        description:
          "Feedback, PID control, sensing, motor drivers, embedded implementation, and experimental validation.",
      },
    ],
    mentoring: [
      "Start from strong fundamentals before moving to advanced computational methods.",
      "Use research projects to teach modeling, implementation, analysis, and communication together.",
      "Encourage reproducible code, clear figures, and careful comparison rather than only final numerical results.",
      "Guide students toward independent problem-solving and publication-quality academic habits.",
    ],
  },
  youtube: {
    intro:
      "Technical videos and demonstrations related to mathematics, simulation, robotics, programming, and research communication.",
    focus: [
      "Technical demonstrations of robotics, control, simulation, and AI workflows.",
      "Student-oriented explanations of mathematics, scientific computing, and programming.",
      "Research notes that document implementation choices and reproducible experiments.",
      "Short project walkthroughs connected to publications, teaching, and collaboration.",
    ],
    videos: [
      {
        title: "Robotics control demonstration",
        status: "Featured slot",
        description:
          "Use this card for an embedded demo or YouTube link showing a robot, motor control, or sensor integration workflow.",
        tags: ["Robotics", "Control", "Demo"],
      },
      {
        title: "Scientific machine learning explanation",
        status: "Featured slot",
        description:
          "Use this card for a tutorial explaining PINNs, neural operators, reduced-order models, or model validation.",
        tags: ["SciML", "PINN", "Teaching"],
      },
      {
        title: "Weather simulation and visualization",
        status: "Featured slot",
        description:
          "Use this card for WRF/GPM plots, rainfall diagnostics, lightning proxy analysis, or meteorological interpretation.",
        tags: ["WRF", "Rainfall", "Visualization"],
      },
    ],
  },
  contact: {
    intro:
      "For academic communication, collaboration, teaching, or project discussion, use the contact details and profile links below.",
    items: [
      {
        label: "Email",
        value: "mdawlad.du@gmail.com",
        href: "mailto:mdawlad.du@gmail.com",
      },
      { label: "Location", value: "Dhaka, Bangladesh" },
      { label: "Phone", value: "+880 1776041967", href: "tel:+8801776041967" },
      {
        label: "GitHub",
        value: "github.com/aawladd",
        href: "https://github.com/aawladd",
      },
      {
        label: "YouTube",
        value: "Functional Value",
        href: "https://www.youtube.com/@FunctionalValue",
      },
      { label: "Google Scholar", value: "Add your Scholar profile", href: "#" },
      { label: "ORCID", value: "Add your ORCID", href: "#" },
      { label: "LinkedIn", value: "Add your LinkedIn", href: "#" },
    ],
    notes: [
      {
        title: "Research collaboration",
        text: "Open to collaboration in simulation, robotics, scientific machine learning, AI, and control-related work.",
      },
      {
        title: "Student engagement",
        text: "Teaching and mentoring can be connected to project supervision, thesis work, and technical skill development.",
      },
      {
        title: "Professional presence",
        text: "Keeping profiles and documents together creates a more complete and credible scholarly identity online.",
      },
    ],
  },
};
