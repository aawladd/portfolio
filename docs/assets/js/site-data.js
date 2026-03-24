const siteData = {
  profile: {
    name: "Md Awlad Hossain",
    title: "Researcher & Academic Teacher",
    subtitle: "I work across numerical simulation, robotics, AI, machine learning, deep learning, scientific machine learning, and control theory to build rigorous and usable intelligent systems.",
    tagline: "An academic website designed to speak clearly to professors, students, and collaborators.",
    email: "your-email@example.com",
    cvFile: "assets/files/replace-with-your-cv.pdf",
    youtubeUrl: "#",
    roles: [
      "Numerical Simulation",
      "Robotics",
      "Artificial Intelligence",
      "Machine Learning",
      "Deep Learning",
      "Scientific ML",
      "Control Theory"
    ]
  },
  highlights: [
    { value: "06+", label: "Core research themes" },
    { value: "03", label: "Audience paths: faculty, students, collaborators" },
    { value: "∞", label: "Ideas, prototypes, and research directions" }
  ],
  researchAreas: [
    {
      kicker: "Computational science",
      title: "Numerical Simulation",
      text: "Simulation-driven analysis for engineering, environmental, and scientific systems where model fidelity and computational clarity matter.",
      metrics: [
        { label: "Methods", value: "Modeling, discretization, analysis" },
        { label: "Value", value: "Grounded insight for complex systems" }
      ]
    },
    {
      kicker: "Intelligent physical systems",
      title: "Robotics",
      text: "Embodied systems that combine actuation, sensing, embedded control, and learning for practical experimental research.",
      metrics: [
        { label: "Methods", value: "Embedded systems, autonomy, experiments" },
        { label: "Value", value: "Bridges theory with real hardware" }
      ]
    },
    {
      kicker: "Data-driven intelligence",
      title: "Artificial Intelligence & ML",
      text: "Predictive pipelines for structured and scientific data, designed to balance model accuracy with interpretability and robustness.",
      metrics: [
        { label: "Methods", value: "Feature learning, forecasting, evaluation" },
        { label: "Value", value: "Actionable models for applied problems" }
      ]
    },
    {
      kicker: "Neural modeling",
      title: "Deep Learning",
      text: "Sequence models, neural architectures, and representation learning tailored to engineering and scientific applications.",
      metrics: [
        { label: "Methods", value: "Time series, spatial data, optimization" },
        { label: "Value", value: "High-capacity models with structure" }
      ]
    },
    {
      kicker: "Physics-aware learning",
      title: "Scientific Machine Learning",
      text: "Learning systems that respect physical principles, equations, simulation outputs, and domain constraints.",
      metrics: [
        { label: "Methods", value: "PINNs, hybrid models, simulation coupling" },
        { label: "Value", value: "Credible and efficient data-science workflows" }
      ]
    },
    {
      kicker: "Dynamic systems",
      title: "Control Theory",
      text: "Model-based and learning-enhanced control strategies for robots and dynamic engineering systems.",
      metrics: [
        { label: "Methods", value: "Feedback, stability, adaptive policies" },
        { label: "Value", value: "Reliable decision and motion behavior" }
      ]
    }
  ],
  projects: [
    {
      title: "Physics-Informed Forecasting for Scientific Time Series",
      category: "SciML",
      status: "Active Research",
      text: "A research direction that blends deep learning with physics-guided constraints to improve forecast credibility for structured temporal signals.",
      focus: "Scientific forecasting",
      mode: "Research + implementation",
      tags: ["Physics-informed", "Forecasting", "Sequence learning"],
      featured: true,
      links: [{ label: "Add project link", url: "#" }]
    },
    {
      title: "Simulation-Driven Environmental Modeling Workflow",
      category: "Simulation",
      status: "Method Pipeline",
      text: "A workflow for numerical simulation, post-processing, and analytical interpretation of spatiotemporal environmental systems.",
      focus: "Modeling and analysis",
      mode: "Simulation + data workflow",
      tags: ["Scientific computing", "Model evaluation", "Environmental data"],
      featured: true,
      links: [{ label: "Add details", url: "#" }]
    },
    {
      title: "Robotics Testbed for Learning-Based Control",
      category: "Robotics",
      status: "Prototype",
      text: "An experimental platform for embedded robotics, control design, sensing, and AI-assisted autonomy research.",
      focus: "Embodied intelligence",
      mode: "Hardware + control",
      tags: ["Robotics", "Embedded systems", "Autonomy"],
      featured: true,
      links: [{ label: "Video demo", url: "#" }]
    },
    {
      title: "Hybrid Control with Neural Components",
      category: "Control",
      status: "Concept Development",
      statusTone: "draft",
      text: "A control-oriented line of work combining principled dynamic models with neural approximators for adaptive performance.",
      focus: "Learning-based control",
      mode: "Theory + experiments",
      tags: ["Control", "Adaptive systems", "Optimization"],
      featured: false,
      links: [{ label: "Add manuscript", url: "#" }]
    },
    {
      title: "Academic Communication Hub",
      category: "Communication",
      status: "Deployed Design",
      text: "A website system for presenting research, teaching, projects, publications, blogs, and technical videos in one coherent academic identity.",
      focus: "Scholarly communication",
      mode: "Web project",
      tags: ["Portfolio", "GitHub Pages", "Outreach"],
      featured: false,
      links: [{ label: "Live site", url: "#" }]
    },
    {
      title: "Scientific Data Modeling with Deep Networks",
      category: "AI/ML",
      status: "Ongoing",
      text: "Modeling structured scientific data with neural networks while maintaining careful evaluation and domain relevance.",
      focus: "Applied machine learning",
      mode: "Data + models",
      tags: ["Machine learning", "Deep learning", "Scientific data"],
      featured: false,
      links: [{ label: "Code repo", url: "#" }]
    }
  ],
  publications: [
    {
      title: "Replace this with your journal article title",
      authors: "Md Awlad Hossain, Coauthor Name, Coauthor Name",
      venue: "Journal Name • Volume, Issue, Pages",
      year: "2026",
      status: "Published / Under Review",
      note: "Use one sentence to clarify the main methodological contribution or application impact.",
      links: [
        { label: "PDF", url: "#" },
        { label: "DOI", url: "#" },
        { label: "Code", url: "#" }
      ]
    },
    {
      title: "Replace this with a conference or workshop paper",
      authors: "Md Awlad Hossain, Coauthor Name",
      venue: "Conference / Workshop / Symposium",
      year: "2025",
      status: "Preprint / In Progress",
      statusTone: "draft",
      note: "Summarize the technical idea, task, or novelty in a clear sentence that a professor can scan quickly.",
      links: [
        { label: "Abstract", url: "#" },
        { label: "Slides", url: "#" }
      ]
    },
    {
      title: "Replace this with a thesis, chapter, or manuscript",
      authors: "Md Awlad Hossain",
      venue: "Thesis / Technical Report / Book Chapter",
      year: "2024",
      status: "Draft",
      statusTone: "draft",
      note: "Keep formatting consistent so the page continues to look polished as your publication list grows.",
      links: [
        { label: "Details", url: "#" }
      ]
    }
  ],
  courses: [
    {
      kicker: "Teaching area",
      title: "Numerical Methods and Simulation",
      text: "Modeling, computation, discretization, numerical reasoning, and interpretation of computational outputs."
    },
    {
      kicker: "Teaching area",
      title: "Robotics and Intelligent Systems",
      text: "Robotic platforms, control logic, embedded systems, sensing, and autonomous behavior with hands-on grounding."
    },
    {
      kicker: "Teaching area",
      title: "Artificial Intelligence and Machine Learning",
      text: "Modern ML concepts, implementation workflows, model evaluation, and research-minded problem solving."
    },
    {
      kicker: "Teaching area",
      title: "Deep Learning for Engineering",
      text: "Neural architectures, training workflows, experiments, and critical evaluation for applied technical use."
    },
    {
      kicker: "Teaching area",
      title: "Scientific Machine Learning",
      text: "Physics-aware learning, simulation-informed models, and hybrid data-science approaches for advanced learners."
    },
    {
      kicker: "Teaching area",
      title: "Control Systems",
      text: "Feedback, dynamic systems, stability, and modern learning-augmented control strategies."
    }
  ],
  videos: [
    {
      title: "Replace with your YouTube channel or featured video",
      type: "YouTube Feature",
      text: "Use this card for a flagship video explaining a project, hardware demo, simulation workflow, or research prototype.",
      url: "#"
    },
    {
      title: "Technical explainer or coding walkthrough",
      type: "Educational Video",
      text: "A space for student-friendly explanations of experiments, robotics setups, modeling pipelines, or algorithm ideas.",
      url: "#"
    },
    {
      title: "Research log or lab update",
      type: "Research Update",
      text: "A regular update style entry for results, challenges, progress notes, and future directions.",
      url: "#"
    }
  ],
  blogs: [
    {
      title: "How I connect simulation with machine learning",
      date: "Add date",
      text: "A blog note reflecting on how your major research interests support one another in real projects.",
      url: "#"
    },
    {
      title: "What students can learn from robotics experiments",
      date: "Add date",
      text: "A post that turns your technical work into approachable learning material for students and early researchers.",
      url: "#"
    },
    {
      title: "A project write-up structure for academic websites",
      date: "Add date",
      text: "Use this for project narratives covering objective, method, implementation, result, and next steps.",
      url: "#"
    }
  ],
  contactLinks: [
    { label: "Email", value: "your-email@example.com", url: "mailto:your-email@example.com" },
    { label: "Google Scholar", value: "Add your profile", url: "#" },
    { label: "ORCID", value: "Add your ORCID", url: "#" },
    { label: "ResearchGate", value: "Add your account", url: "#" },
    { label: "GitHub", value: "Add your username", url: "#" },
    { label: "LinkedIn", value: "Add your profile", url: "#" },
    { label: "YouTube", value: "Add your channel", url: "#" }
  ]
};
