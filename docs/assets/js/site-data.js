const siteData = {
  profile: {
    name: "Md Awlad Hossain",
    title: "Researcher & Academic Teacher",
    subtitle: "My work integrates numerical simulation, robotics, artificial intelligence, machine learning, deep learning, scientific machine learning, and control theory to build reliable, interpretable, and practically useful intelligent systems.",
    tagline: "This website presents research, teaching, publications, projects, and technical communication in a more scholarly and research-centered format.",
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
    { value: "06", label: "Primary research themes" },
    { value: "03", label: "Main audiences: faculty, students, collaborators" },
    { value: "01", label: "Integrated academic home for research and teaching" }
  ],
  researchAreas: [
    {
      kicker: "Computational science",
      title: "Numerical Simulation",
      text: "Computational modeling and simulation for scientific and engineering systems where physical fidelity, numerical reasoning, and interpretable outputs are essential.",
      metrics: [
        { label: "Research lens", value: "Modeling, discretization, analysis" },
        { label: "Typical outputs", value: "Simulation workflows, diagnostics, predictive studies" }
      ]
    },
    {
      kicker: "Embodied intelligence",
      title: "Robotics",
      text: "Robotic systems that connect sensing, actuation, embedded hardware, control logic, and learning-based decision making in practical experimental settings.",
      metrics: [
        { label: "Research lens", value: "Hardware, autonomy, system integration" },
        { label: "Typical outputs", value: "Prototypes, experiments, demonstrations" }
      ]
    },
    {
      kicker: "Data-driven intelligence",
      title: "Artificial Intelligence & Machine Learning",
      text: "Machine learning pipelines for structured scientific and engineering data, with attention to evaluation quality, robustness, and application relevance.",
      metrics: [
        { label: "Research lens", value: "Forecasting, learning, evaluation" },
        { label: "Typical outputs", value: "Predictive models, analysis pipelines" }
      ]
    },
    {
      kicker: "Neural computation",
      title: "Deep Learning",
      text: "Neural architectures for temporal, spatial, and scientific datasets where representation learning and model capacity must be balanced with interpretability.",
      metrics: [
        { label: "Research lens", value: "Sequence models, optimization, feature learning" },
        { label: "Typical outputs", value: "Benchmarks, ablations, trained systems" }
      ]
    },
    {
      kicker: "Physics-aware intelligence",
      title: "Scientific Machine Learning",
      text: "Hybrid modeling approaches that combine data-driven learning with physical structure, governing equations, or simulation constraints.",
      metrics: [
        { label: "Research lens", value: "PINNs, hybrid models, simulation coupling" },
        { label: "Typical outputs", value: "Trustworthy models for scientific tasks" }
      ]
    },
    {
      kicker: "Dynamic decision systems",
      title: "Control Theory",
      text: "Model-based and learning-augmented control for dynamic systems, with emphasis on stability, adaptation, and reliable performance in real settings.",
      metrics: [
        { label: "Research lens", value: "Feedback, stability, adaptive control" },
        { label: "Typical outputs", value: "Controllers, experiments, validation studies" }
      ]
    }
  ],
  projects: [
    {
      title: "Physics-Informed Forecasting for Scientific Time Series",
      category: "SciML",
      status: "Active Research",
      text: "A research direction focused on improving predictive credibility by combining deep temporal models with physically informed constraints and structured evaluation.",
      focus: "Scientific forecasting",
      mode: "Research design",
      method: "Hybrid learning with physics-aware losses and ablation-based evaluation",
      output: "Manuscript, code, figures, and comparative experiments",
      tags: ["Physics-informed", "Forecasting", "Sequence learning"],
      featured: true,
      links: [{ label: "Add project link", url: "#" }]
    },
    {
      title: "Simulation-Driven Environmental Modeling Workflow",
      category: "Simulation",
      status: "Method Pipeline",
      text: "A structured workflow for numerical simulation, post-processing, visualization, and interpretation of spatiotemporal environmental systems.",
      focus: "Scientific computing",
      mode: "Computational workflow",
      method: "Simulation setup, diagnostics, rainfall analysis, and publication-grade visualization",
      output: "Processed datasets, figures, scripts, and methodological notes",
      tags: ["Scientific computing", "Model evaluation", "Environmental data"],
      featured: true,
      links: [{ label: "Add details", url: "#" }]
    },
    {
      title: "Robotics Testbed for Learning-Based Control",
      category: "Robotics",
      status: "Prototype",
      text: "An experimental robotics platform for integrating embedded systems, control, sensing, and learning-based autonomy.",
      focus: "Embodied intelligence",
      mode: "Experimental system",
      method: "Robot integration, controller development, hardware experiments, and iterative validation",
      output: "Prototype platform, videos, and technical reports",
      tags: ["Robotics", "Embedded systems", "Autonomy"],
      featured: true,
      links: [{ label: "Video demo", url: "#" }]
    },
    {
      title: "Hybrid Control with Neural Components",
      category: "Control",
      status: "Concept Development",
      statusTone: "draft",
      text: "A control-oriented project exploring how dynamic models and neural approximators can work together for adaptive and robust behavior.",
      focus: "Learning-based control",
      mode: "Theory + experiment planning",
      method: "Model-based structure combined with learned residual or policy modules",
      output: "Concept note, benchmarks, and prototype controller",
      tags: ["Control", "Adaptive systems", "Optimization"],
      featured: false,
      links: [{ label: "Add manuscript", url: "#" }]
    },
    {
      title: "Academic Communication and Research Portfolio System",
      category: "Communication",
      status: "Deployed Design",
      text: "A long-term academic website architecture for presenting research, teaching, publications, media, and project documentation in one coherent identity.",
      focus: "Scholarly communication",
      mode: "Digital academic infrastructure",
      method: "Static site architecture with curated research-first information design",
      output: "Live site, editable codebase, and update-ready content blocks",
      tags: ["Portfolio", "GitHub Pages", "Outreach"],
      featured: false,
      links: [{ label: "Live site", url: "#" }]
    },
    {
      title: "Scientific Data Modeling with Deep Networks",
      category: "AI/ML",
      status: "Ongoing",
      text: "A line of work on learning from structured scientific datasets while preserving good experimental practice and domain relevance.",
      focus: "Applied machine learning",
      mode: "Model development",
      method: "Feature design, deep learning baselines, evaluation, and interpretation",
      output: "Model comparisons, reproducible scripts, and research write-up",
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
      note: "State the core contribution clearly: problem, method, and why the result matters.",
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
      note: "Use one sentence to explain the methodological novelty or system contribution.",
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
      note: "Keep this space for thesis work, technical reports, survey manuscripts, or substantial project documentation.",
      links: [
        { label: "Details", url: "#" }
      ]
    }
  ],
  courses: [
    {
      kicker: "Course theme",
      title: "Numerical Methods and Simulation",
      text: "Courses and mentoring around modeling, discretization, computation, and interpretation of numerical results in scientific settings."
    },
    {
      kicker: "Course theme",
      title: "Robotics and Intelligent Systems",
      text: "Teaching that connects robot platforms, sensing, embedded implementation, system integration, and autonomy-oriented thinking."
    },
    {
      kicker: "Course theme",
      title: "Artificial Intelligence and Machine Learning",
      text: "Conceptual and applied teaching in ML workflows, experimentation, evaluation, and technical problem solving."
    },
    {
      kicker: "Course theme",
      title: "Deep Learning for Engineering",
      text: "Neural architectures, training practice, experiments, and evidence-based comparison for engineering applications."
    },
    {
      kicker: "Course theme",
      title: "Scientific Machine Learning",
      text: "Physics-aware and simulation-aware learning concepts for advanced students interested in modern computational research."
    },
    {
      kicker: "Course theme",
      title: "Control Systems",
      text: "Feedback, dynamic systems, stability, and modern learning-augmented control ideas presented in a structured way."
    }
  ],
  videos: [
    {
      title: "Replace with your YouTube channel or featured video",
      type: "Featured video",
      text: "Use this block for a flagship research demo, system walkthrough, or project explanation that represents your work well.",
      url: "#",
      linkLabel: "Watch video"
    },
    {
      title: "Technical explainer or coding walkthrough",
      type: "Educational media",
      text: "A place for videos that explain experiments, robotics integration, simulation workflows, or modeling pipelines for students.",
      url: "#",
      linkLabel: "Open feature"
    },
    {
      title: "Research log or lab update",
      type: "Research communication",
      text: "Use this area for concise updates on progress, negative results, design choices, and next steps in ongoing work.",
      url: "#",
      linkLabel: "View update"
    }
  ],
  blogs: [
    {
      title: "How I connect simulation with machine learning",
      date: "Research note • Add date",
      text: "A short essay explaining how your main research areas support one another within a coherent scholarly agenda.",
      url: "#",
      linkLabel: "Read note"
    },
    {
      title: "What students can learn from robotics experiments",
      date: "Teaching note • Add date",
      text: "A note translating technical work into accessible lessons for students, project groups, or future supervisees.",
      url: "#",
      linkLabel: "Read note"
    },
    {
      title: "A structure for writing research project pages",
      date: "Method note • Add date",
      text: "Use this for project write-ups covering objective, method, implementation, result, and future work in a scholarly style.",
      url: "#",
      linkLabel: "Read note"
    }
  ],
  contactLinks: [
    { label: "Email", value: "your-email@example.com", url: "mailto:your-email@example.com" },
    { label: "Google Scholar", value: "Add profile link", url: "#" },
    { label: "ORCID", value: "Add ORCID", url: "#" },
    { label: "GitHub", value: "Add GitHub", url: "#" },
    { label: "LinkedIn", value: "Add LinkedIn", url: "#" },
    { label: "YouTube", value: "Add channel link", url: "#" }
  ]
};
