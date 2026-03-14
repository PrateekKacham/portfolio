import { useState, useEffect, useRef } from "react";

const RED = "#E8173A";
const DIM = "#999";
const BORDER = "#1c1c1c";

// inject mobile styles once
const mobileCSS = `
  @media (max-width: 768px) {
    .nav-links { display: none !important; }
    .hero-pad { padding: 0 24px !important; }
    .about-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
    .stats-grid { grid-template-columns: 1fr 1fr !important; }
    .stats-grid > div:nth-child(2) { border-right: none !important; }
    .contact-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
    .project-row { grid-template-columns: 40px 1fr !important; gap: 16px !important; padding: 20px 0 !important; }
    .project-metric { display: none !important; }
    .section-pad { padding: 80px 24px !important; }
    .hero-stats { border-left: none !important; flex-direction: column !important; gap: 24px !important; }
    .hero-stats > div { border-right: none !important; padding: 0 !important; border-bottom: 1px solid #1c1c1c; padding-bottom: 16px !important; }
    .hero-stats > div:last-child { border-bottom: none !important; }
  }
`;

const PROJECTS = [
  {
    id: "mistral",
    github: "https://github.com/PrateekKacham/mistral-7b-text2sql-finetuning",
    screenshot: "mistral-finetune.png",
    title: "Mistral 7B Fine-Tuning",
    subtitle: "LLM · QLoRA · Text-to-SQL",
    tags: ["PyTorch","QLoRA","Hugging Face","A100","Gradio"],
    metric: "+200% SQL Exact Match",
    deployed: "Live Gradio Demo",
    demo: "https://huggingface.co/spaces/Prateek-Kacham/mistral-text2sql-demo",
    number: "01",
    summary: "Fine-tuned Mistral 7B Instruct v0.3 using QLoRA on an A100 GPU. SQL exact match improved from 0.11 → 0.33. Deployed as a live Gradio demo.",
    problem: "Large language models struggle with domain-specific SQL generation out of the box. The goal was production-grade NL-to-SQL accuracy on a constrained compute budget.",
    approach: "Applied QLoRA (4-bit quantization, LoRA r=16, α=32) via Hugging Face PEFT on Google Colab A100. Trained on 5,000 samples from the Gretel synthetic text-to-SQL dataset using SFTTrainer for 3 epochs.",
    metrics: ["SQL exact match: 0.11 → 0.33 (+200%)","Training loss: 1.10 → 0.21","Evaluated on 100 unseen samples","Live Gradio demo deployed"],
    architecture: "Mistral 7B Instruct v0.3 → PEFT/QLoRA (r=16, α=32, 4-bit) → Gretel Dataset (5k) → SFTTrainer → Gradio",
  },
  {
    id: "multiagent",
    github: "https://github.com/PrateekKacham/multi-agent-ai-pipeline",
    title: "Multi-Agent AI Pipeline",
    subtitle: "AutoGen · Kafka · Vision",
    tags: ["AutoGen","Kafka","DCGAN","CNN","ResNet-18"],
    metric: "5-Component Orchestration",
    deployed: "Google Colab A100",
    number: "02",
    summary: "AutoGen Judge agent evaluating CNN vs ResNet-18 on CIFAR-10, DCGAN image synthesis over 5,000 epochs, Kafka pub/sub with 3 coordinating agents, and zero/few-shot NL-to-SQL.",
    problem: "Real-world AI requires multiple specialized models working in concert without human intervention.",
    approach: "AutoGen Judge autonomously evaluated CNN vs ResNet-18. DCGAN used Conv2DTranspose + Conv2D trained 5,000 epochs. Kafka coordinated 3 agents for real-time event-driven streaming.",
    metrics: ["AutoGen Judge selected best model autonomously","DCGAN trained 5,000 epochs on CIFAR-10","Kafka with 3 coordinating agents","NL-to-SQL via zero/few-shot prompting"],
    architecture: "Kafka Topics → AutoGen Bus → [CNN | ResNet-18 | DCGAN | SQL Agent] → Judge → Report",
  },
  {
    id: "chatbot",
    github: "https://github.com/PrateekKacham/book-recommendation-chatbot",
    screenshot: "book-chatbot.png",
    title: "Book Recommendation Chatbot",
    subtitle: "RAG · LangChain · NLP",
    tags: ["LangChain","PyPDF2","RAG","Python"],
    metric: "200+ Monthly Users",
    deployed: "Production",
    demo: "https://huggingface.co/spaces/Prateek-Kacham/book-recommendation-chatbot",
    number: "03",
    summary: "RAG-based chatbot using LangChain and PyPDF2 for automated PDF extraction, serving 200+ monthly users with 25% improved recommendation accuracy over baseline.",
    problem: "Generic LLMs hallucinate book recommendations. Built a retrieval-augmented system grounded in a real corpus.",
    approach: "LangChain retrieval chain with PyPDF2 for automated PDF ingestion. RAG pipeline retrieves semantically relevant passages before generating responses.",
    metrics: ["200+ monthly active users","25% improved accuracy via RAG","Automated PDF ingestion","Natural language query interface"],
    architecture: "User Query → LangChain Retrieval → PDF Corpus (PyPDF2) → RAG Response",
  },
  {
    id: "resume",
    github: "https://github.com/PrateekKacham/ai-resume-analyzer",
    screenshot: "resume-analyzer.png",
    title: "AI Resume Analyzer",
    subtitle: "React · AI-Powered · NLP",
    tags: ["React","AI API","NLP"],
    metric: "Real-time AI Feedback",
    deployed: "Live Web App",
    demo: "https://ai-resume-analyzer-rho-seven.vercel.app/",
    number: "04",
    summary: "AI-powered resume analyzer providing instant structured feedback on ATS compatibility, keyword gaps, and role-specific optimization.",
    problem: "Job seekers lack actionable, instant feedback on resume quality for technical roles.",
    approach: "React frontend with file upload. AI backend delivers structured JSON feedback on skills match, formatting, and keyword density.",
    metrics: ["Analysis in <3s","Feedback across 6 dimensions","ATS keyword gap detection","Role-specific optimization"],
    architecture: "React UI → File Parser → AI Pipeline → JSON Scorecard → Dashboard",
  },
  {
    id: "campusstream",
    title: "CampusStream",
    subtitle: "MERN · Video Streaming",
    tags: ["MongoDB","Express","React","Node.js"],
    metric: "200+ Users · 95% Uptime",
    deployed: null,
    number: "05",
    summary: "Full-stack video streaming platform with Study Mode, Watch Rooms, and Canvas LMS integration — 200+ monthly users at 95% uptime.",
    problem: "Students lacked a distraction-free video platform integrated with academic workflows.",
    approach: "MERN stack with JWT auth, WebRTC Watch Rooms, Canvas API integration, and a Study Mode restricting non-educational features.",
    metrics: ["200+ monthly active users","95% uptime","Canvas LMS integration","WebRTC synchronized viewing"],
    architecture: "React → Express API → MongoDB → Node.js WebRTC → Canvas OAuth",
  },
  {
    id: "flavour",
    github: "https://github.com/PrateekKacham/flavour-fusion",
    title: "Flavour Fusion",
    subtitle: "MERN · Food Ordering",
    tags: ["MongoDB","Express","React","Node.js"],
    metric: "4 User Roles",
    deployed: null,
    number: "06",
    summary: "Full-stack food ordering platform with 4 user roles, JWT auth, real-time order tracking via Socket.io, and a complete Express REST API.",
    problem: "Demonstrate mastery of complex role-based access control and real-time data flow in a single application.",
    approach: "MERN stack with role-based JWT auth. Socket.io for real-time order updates. Restaurant portal and admin analytics dashboard.",
    metrics: ["4 user roles with distinct permissions","Real-time tracking via Socket.io","JWT REST API","Admin analytics"],
    architecture: "React (4 dashboards) → Express REST → MongoDB → Socket.io",
  },
  {
    id: "cyber",
    title: "CyberSentinel",
    subtitle: "Java · Spring Boot · Enterprise",
    tags: ["Java","Spring Boot","MySQL","REST API"],
    metric: "500+ Cases Managed",
    deployed: null,
    number: "07",
    summary: "Enterprise-grade incident management platform in Java/Spring Boot handling 500+ cases across 4 user types with audit trails and automated escalation.",
    problem: "Security teams need structured incident tracking with role-based workflows.",
    approach: "Spring Boot REST API with MySQL. Roles: Analyst, Manager, Admin, Auditor. Automated escalation on SLA breach, full audit logging.",
    metrics: ["500+ cases managed","4 user role types","Automated SLA escalation","Full audit trail"],
    architecture: "Spring Boot REST → MySQL → Role Auth → Escalation Engine → Audit Logger",
  }
];

const SKILLS = {
  "AI / ML": ["PyTorch","TensorFlow","Hugging Face","PEFT","QLoRA","LangChain","AutoGen","CNNs","GANs","RAG","NLP","scikit-learn"],
  "Languages": ["Python","JavaScript","Java","C","SQL"],
  "Full-Stack": ["React","Node.js","Express","MongoDB","REST APIs","JWT","AWS (EC2/S3)"],
  "MLOps / Infra": ["Docker","Git","Linux","Apache Kafka","Google Colab (A100)","Gradio"],
  "Databases": ["MongoDB","MySQL","ChromaDB"]
};

// ── SVG ICONS ────────────────────────────────────────────────────────────────
const GH = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.09.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>;
const LI = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;

// ── NAV ──────────────────────────────────────────────────────────────────────
function Nav({ goTo }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const link = (label) => (
    <button key={label} onClick={() => goTo(label.toLowerCase())}
      style={{ background:"none", border:"none", color: "#888", fontSize:13, fontWeight:500, cursor:"pointer", letterSpacing:"0.04em", textTransform:"uppercase", transition:"color 0.2s", padding:"4px 0" }}
      onMouseEnter={e => e.target.style.color="#fff"}
      onMouseLeave={e => e.target.style.color="#888"}>
      {label}
    </button>
  );
  return (
    <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:200, height:58, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 40px", background: scrolled ? "rgba(0,0,0,0.95)" : "transparent", borderBottom: scrolled ? `1px solid ${BORDER}` : "none", backdropFilter: scrolled ? "blur(16px)" : "none", transition:"all 0.4s" }}>
      <span onClick={() => goTo("hero")} style={{ fontSize:14, fontWeight:700, color:"#fff", cursor:"pointer", letterSpacing:"0.06em", textTransform:"uppercase" }}>
        PK<span style={{ color: RED }}>.</span>
      </span>
      <div style={{ display:"flex", gap:32, alignItems:"center" }} className="nav-links">
        {["About","Projects","Skills","Contact"].map(link)}
        <div style={{ width:1, height:16, background: BORDER }} />
        <a href="https://github.com/PrateekKacham" target="_blank" style={{ color:"#888", display:"flex", alignItems:"center", textDecoration:"none", transition:"color 0.2s" }} onMouseEnter={e=>e.currentTarget.style.color="#fff"} onMouseLeave={e=>e.currentTarget.style.color="#888"}><GH /></a>
        <a href="https://linkedin.com/in/sai-vinayaka-venkata-prateek-kacham" target="_blank" style={{ color:"#888", display:"flex", alignItems:"center", textDecoration:"none", transition:"color 0.2s" }} onMouseEnter={e=>e.currentTarget.style.color="#fff"} onMouseLeave={e=>e.currentTarget.style.color="#888"}><LI /></a>
        <a href="mailto:kacham.sai@northeastern.edu" style={{ fontSize:12, fontWeight:600, color:"#fff", textDecoration:"none", background: RED, borderRadius:6, padding:"7px 18px", letterSpacing:"0.04em", textTransform:"uppercase", transition:"opacity 0.2s" }} onMouseEnter={e=>e.currentTarget.style.opacity="0.85"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
          Resume ↗
        </a>
      </div>
    </nav>
  );
}

// ── HERO ─────────────────────────────────────────────────────────────────────
function Hero({ goTo }) {
  const [typed, setTyped] = useState("");
  const roles = ["AI / ML Engineer","LLM Fine-Tuner","Multi-Agent Builder","Full-Stack Developer"];
  const [rIdx, setRIdx] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const target = roles[rIdx];
    let t;
    if (!del && typed.length < target.length) t = setTimeout(() => setTyped(target.slice(0, typed.length+1)), 70);
    else if (!del) t = setTimeout(() => setDel(true), 2400);
    else if (del && typed.length > 0) t = setTimeout(() => setTyped(typed.slice(0,-1)), 30);
    else { setDel(false); setRIdx(i => (i+1) % roles.length); }
    return () => clearTimeout(t);
  }, [typed, del, rIdx]);

  return (
    <section data-section="hero" style={{ minHeight:"100vh", display:"flex", flexDirection:"column", justifyContent:"center", padding:"0 64px", maxWidth:1200, margin:"0 auto", position:"relative" }} className="hero-pad">


      <div>
        <div style={{ fontSize:11, fontWeight:700, color: RED, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:32 }}>
          MS Information Systems · Northeastern University
        </div>

        <h1 style={{ fontSize:"clamp(44px,7vw,96px)", fontWeight:800, letterSpacing:"-0.03em", lineHeight:1.0, color:"#fff", margin:"0 0 28px", maxWidth:900 }}>
          Sai Vinayaka<br />Venkata Prateek<br />
          <span style={{ color: RED }}>Kacham</span>
        </h1>

        <div style={{ fontSize:"clamp(16px,2vw,24px)", fontWeight:400, color:"#666", marginBottom:40, minHeight:36, fontStyle:"italic" }}>
          — <span style={{ color:"#bbb", fontStyle:"normal", fontWeight:500 }}>{typed}</span>
          <span style={{ borderRight:`2px solid ${RED}`, marginLeft:2, animation:"blink 1s infinite" }}> </span>
        </div>

        <p style={{ fontSize:16, color:"#aaa", lineHeight:1.9, maxWidth:520, marginBottom:56 }}>
          MS Information Systems @ Northeastern. I build things end-to-end — LLMs, agents, and full-stack apps — and ship them to real users.
        </p>

        {/* Stats */}
        <div style={{ display:"flex", gap:0, marginBottom:64, borderLeft:`1px solid ${BORDER}` }} className="hero-stats">
          {[["0.11 → 0.33","SQL exact match"],["200+","production users"],["7","projects shipped"]].map(([num, label], i) => (
            <div key={label} style={{ padding:"0 40px", borderRight:`1px solid ${BORDER}` }}>
              <div style={{ fontSize:"clamp(22px,3vw,36px)", fontWeight:800, color:"#fff", letterSpacing:"-0.02em", lineHeight:1 }}>{num}</div>
              <div style={{ fontSize:11, color:"#777", marginTop:6, letterSpacing:"0.08em", textTransform:"uppercase", fontWeight:600 }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", gap:12 }}>
          <button onClick={() => goTo("projects")}
            style={{ padding:"14px 36px", background: RED, border:"none", borderRadius:6, color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", letterSpacing:"0.06em", textTransform:"uppercase", transition:"opacity 0.2s" }}
            onMouseEnter={e=>e.target.style.opacity="0.85"} onMouseLeave={e=>e.target.style.opacity="1"}>
            View Work →
          </button>
          <button onClick={() => goTo("contact")}
            style={{ padding:"14px 36px", background:"transparent", border:`1px solid ${BORDER}`, borderRadius:6, color:"#666", fontSize:13, fontWeight:700, cursor:"pointer", letterSpacing:"0.06em", textTransform:"uppercase", transition:"all 0.2s" }}
            onMouseEnter={e=>{e.target.style.borderColor="#444";e.target.style.color="#fff"}} onMouseLeave={e=>{e.target.style.borderColor=BORDER;e.target.style.color="#666"}}>
            Get In Touch
          </button>
        </div>
      </div>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
    </section>
  );
}

// ── ABOUT ────────────────────────────────────────────────────────────────────
function About() {
  return (
          <section id="about" style={{ maxWidth:1200, margin:"0 auto", padding:"120px 40px", borderTop:`1px solid ${BORDER}` }} className="section-pad">
      <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:80 }} className="about-grid">
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:RED, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:20 }}>About</div>
          <h2 style={{ fontSize:"clamp(28px,4vw,48px)", fontWeight:800, color:"#fff", lineHeight:1.1, letterSpacing:"-0.02em" }}>Engineer.<br />Builder.</h2>
        </div>
        <div>
          <p style={{ fontSize:17, color:"#777", lineHeight:1.9, marginBottom:20 }}>
            I fine-tune large language models, orchestrate multi-agent systems, and build full-stack applications — then deploy them. Not portfolio pieces, but real systems with real users.
          </p>
          <p style={{ fontSize:17, color:"#777", lineHeight:1.9, marginBottom:48 }}>
            Currently pursuing MS Information Systems at Northeastern (GPA 3.686), with a focus on generative AI and deep learning. Previously built production apps serving 200+ users, managed 500+ enterprise cases, and trained models on A100 GPUs.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:0, border:`1px solid ${BORDER}`, borderRadius:8, overflow:"hidden" }} className="stats-grid">
            {[["7","Projects"],["200+","Users"],["500+","Cases"],["3","LLM Systems"]].map(([num,label],i) => (
              <div key={label} style={{ padding:"28px 20px", borderRight: i<3 ? `1px solid ${BORDER}` : "none", background:"#0a0a0a" }}>
                <div style={{ fontSize:32, fontWeight:800, color:"#fff", letterSpacing:"-0.02em" }}>{num}</div>
                <div style={{ fontSize:11, color:"#555", marginTop:6, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:600 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── PROJECTS ─────────────────────────────────────────────────────────────────
function ProjectRow({ p, onClick, last }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={() => onClick(p)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display:"grid", gridTemplateColumns:"80px 1fr auto", alignItems:"center", gap:40, padding:"28px 0", borderBottom: last ? "none" : `1px solid ${BORDER}`, cursor:"pointer", transition:"background 0.2s", background: hov ? "#0d0d0d" : "transparent", borderRadius: hov ? 8 : 0, padding: hov ? "28px 20px" : "28px 0" }} className="project-row">
      <div style={{ fontSize:12, fontWeight:700, color: hov ? RED : "#333", letterSpacing:"0.1em", transition:"color 0.2s" }}>{p.number}</div>
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:8 }}>
          <h3 style={{ fontSize:"clamp(16px,2vw,22px)", fontWeight:700, color:"#fff", letterSpacing:"-0.01em", margin:0 }}>{p.title}</h3>
          {p.deployed && <span style={{ fontSize:10, fontWeight:700, color:"#22c55e", background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.2)", borderRadius:20, padding:"2px 10px", letterSpacing:"0.06em", textTransform:"uppercase", whiteSpace:"nowrap" }}>Live</span>}
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {p.tags.slice(0,4).map(t => (
            <span key={t} style={{ fontSize:11, color:"#888", fontWeight:500 }}>{t}{p.tags.indexOf(t) < Math.min(3,p.tags.length-1) ? " ·" : ""}</span>
          ))}
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:24 }} className="project-metric">
        <span style={{ fontSize:13, fontWeight:700, color: RED, whiteSpace:"nowrap" }}>{p.metric}</span>
        <span style={{ fontSize:18, color: hov ? "#fff" : "#333", transition:"all 0.2s", transform: hov ? "translateX(4px)" : "none" }}>→</span>
      </div>
    </div>
  );
}

function ProjectDetail({ p, onBack }) {
  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"100px 40px 80px" }}>
      {/* Back button — clearly visible */}
      <button onClick={onBack}
        style={{ display:"inline-flex", alignItems:"center", gap:8, background:"transparent", border:`1px solid #444`, borderRadius:6, padding:"9px 20px", color:"#ccc", fontSize:13, fontWeight:600, cursor:"pointer", marginBottom:60, letterSpacing:"0.04em", transition:"all 0.2s" }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor=RED;e.currentTarget.style.color="#fff"}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor="#444";e.currentTarget.style.color="#ccc"}}>
        ← Back to Projects
      </button>

      <div style={{ display:"flex", alignItems:"baseline", gap:20, marginBottom:12 }}>
        <span style={{ fontSize:12, fontWeight:700, color:RED, letterSpacing:"0.15em", textTransform:"uppercase" }}>{p.number}</span>
        <span style={{ fontSize:12, color:"#444", letterSpacing:"0.1em", textTransform:"uppercase" }}>{p.subtitle}</span>
      </div>

      <h1 style={{ fontSize:"clamp(32px,5vw,64px)", fontWeight:800, color:"#fff", letterSpacing:"-0.02em", lineHeight:1.05, marginBottom:24 }}>{p.title}</h1>

      {p.deployed && (
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, fontSize:12, color:"#22c55e", background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.2)", borderRadius:20, padding:"5px 14px", marginBottom:40, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase" }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"#22c55e", display:"inline-block" }} />
          {p.deployed}
        </div>
      )}

      <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center", marginBottom:56 }}>
        {p.tags.map(t => (
          <span key={t} style={{ fontSize:12, padding:"5px 14px", borderRadius:20, background:"#111", border:`1px solid #333`, color:"#aaa", fontWeight:500 }}>{t}</span>
        ))}
        {p.github && (
          <a href={p.github} target="_blank" style={{ display:"inline-flex", alignItems:"center", gap:8, fontSize:12, fontWeight:700, color:"#fff", background:"#111", border:`1px solid #444`, borderRadius:20, padding:"5px 16px", textDecoration:"none", marginLeft:8, transition:"border-color 0.2s" }}
            onMouseEnter={e=>e.currentTarget.style.borderColor=RED}
            onMouseLeave={e=>e.currentTarget.style.borderColor="#444"}>
            <GH /> GitHub ↗
          </a>
        )}
        {p.demo && (
          <a href={p.demo} target="_blank" style={{ display:"inline-flex", alignItems:"center", gap:8, fontSize:12, fontWeight:700, color:"#fff", background:RED, border:`1px solid ${RED}`, borderRadius:20, padding:"5px 16px", textDecoration:"none", transition:"opacity 0.2s" }}
            onMouseEnter={e=>e.currentTarget.style.opacity="0.85"}
            onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
            Live Demo ↗
          </a>
        )}
      </div>

      {p.screenshot && (
        <div style={{ marginBottom:56, borderRadius:12, overflow:"hidden", border:`1px solid ${BORDER}` }}>
          <img src={`/${p.screenshot}`} alt={p.title} style={{ width:"100%", display:"block" }} />
        </div>
      )}
      <div style={{ height:1, background: BORDER, marginBottom:56 }} />

      {[["Problem", p.problem],["Approach", p.approach],["Architecture", p.architecture]].map(([title, text]) => (
        <div key={title} style={{ marginBottom:48 }}>
          <div style={{ fontSize:11, fontWeight:700, color:RED, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:16 }}>{title}</div>
          <p style={{ fontSize:16, color:"#bbb", lineHeight:1.9, margin:0 }}>{text}</p>
        </div>
      ))}

      <div style={{ height:1, background: BORDER, margin:"56px 0" }} />

      <div style={{ fontSize:11, fontWeight:700, color:RED, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:24 }}>Key Metrics</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:1, background: BORDER, borderRadius:8, overflow:"hidden" }}>
        {p.metrics.map((m, i) => (
          <div key={m} style={{ padding:"20px 24px", background:"#0a0a0a", fontSize:14, color:"#bbb", lineHeight:1.6 }}>
            <span style={{ color:RED, marginRight:10, fontWeight:700 }}>↗</span>{m}
          </div>
        ))}
      </div>
    </div>
  );
}

function Projects({ onSelect }) {
  return (
          <section id="projects" style={{ maxWidth:1200, margin:"0 auto", padding:"120px 40px", borderTop:`1px solid ${BORDER}` }} className="section-pad">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:64 }}>
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:RED, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:16 }}>Projects</div>
          <h2 style={{ fontSize:"clamp(28px,4vw,48px)", fontWeight:800, color:"#fff", letterSpacing:"-0.02em", lineHeight:1.1, margin:0 }}>
            Work that runs<br />in production
          </h2>
        </div>
        <div style={{ fontSize:13, color:"#444", fontWeight:500 }}>7 projects</div>
      </div>
      <div style={{ borderTop:`1px solid ${BORDER}` }}>
        {PROJECTS.map((p, i) => <ProjectRow key={p.id} p={p} onClick={onSelect} last={i === PROJECTS.length-1} />)}
      </div>
    </section>
  );
}

// ── SKILLS ───────────────────────────────────────────────────────────────────
function Skills() {
  return (
          <section id="skills" style={{ maxWidth:1200, margin:"0 auto", padding:"120px 40px", borderTop:`1px solid ${BORDER}` }} className="section-pad">
      <div style={{ fontSize:11, fontWeight:700, color:RED, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:16 }}>Skills</div>
      <h2 style={{ fontSize:"clamp(28px,4vw,48px)", fontWeight:800, color:"#fff", letterSpacing:"-0.02em", marginBottom:64 }}>Technical Stack</h2>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:40 }}>
        {Object.entries(SKILLS).map(([cat, items]) => (
          <div key={cat}>
            <div style={{ fontSize:11, fontWeight:700, color:RED, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:20, paddingBottom:12, borderBottom:`1px solid ${BORDER}` }}>{cat}</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {items.map(sk => (
                <span key={sk} style={{ fontSize:12, padding:"5px 12px", borderRadius:4, background:"#0d0d0d", border:`1px solid ${BORDER}`, color:"#666", fontWeight:500, transition:"all 0.2s", cursor:"default" }}
                  onMouseEnter={e=>{e.target.style.color="#fff";e.target.style.borderColor="#333"}}
                  onMouseLeave={e=>{e.target.style.color="#666";e.target.style.borderColor=BORDER}}>
                  {sk}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── CONTACT ──────────────────────────────────────────────────────────────────
function Contact() {
  return (
          <section id="contact" style={{ maxWidth:1200, margin:"0 auto", padding:"120px 40px", borderTop:`1px solid ${BORDER}` }} className="section-pad">
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, alignItems:"start" }} className="contact-grid">
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:RED, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:16 }}>Contact</div>
          <h2 style={{ fontSize:"clamp(28px,4vw,48px)", fontWeight:800, color:"#fff", letterSpacing:"-0.02em", lineHeight:1.1, marginBottom:24 }}>
            Let's build<br />something great
          </h2>
          <p style={{ fontSize:16, color:"#555", lineHeight:1.9, marginBottom:0 }}>
            Open to software engineering, full-stack, and AI/ML roles — internships, co-ops, and full-time. Available immediately. Based in Boston, open to relocation.
          </p>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
          {[
            { label:"Email", val:"kacham.sai@northeastern.edu", href:"mailto:kacham.sai@northeastern.edu" },
            { label:"LinkedIn", val:"linkedin.com/in/sai-vinayaka-venkata-prateek-kacham", href:"https://linkedin.com/in/sai-vinayaka-venkata-prateek-kacham" },
            { label:"GitHub", val:"github.com/PrateekKacham", href:"https://github.com/PrateekKacham" }
          ].map(l => (
            <a key={l.label} href={l.href} target="_blank"
              style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 24px", background:"#0a0a0a", border:`1px solid ${BORDER}`, borderRadius:8, textDecoration:"none", marginBottom:2, transition:"all 0.2s" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="#333";e.currentTarget.style.background="#111"}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=BORDER;e.currentTarget.style.background="#0a0a0a"}}>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:RED, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:4 }}>{l.label}</div>
                <div style={{ fontSize:14, color:"#bbb", fontWeight:500 }}>{l.val}</div>
              </div>
              <span style={{ color:"#333", fontSize:18 }}>↗</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [proj, setProj] = useState(null);

  const openProject = (p) => { setProj(p); window.scrollTo({ top:0, behavior:"instant" }); };
  const closeProject = () => { setProj(null); window.scrollTo({ top:0, behavior:"instant" }); };

  const goTo = (section) => {
    if (proj) { setProj(null); }
    setTimeout(() => {
      if (section === "hero") { window.scrollTo({ top:0, behavior:"smooth" }); return; }
      const el = document.getElementById(section);
      if (el) el.scrollIntoView({ behavior:"smooth", block:"start" });
    }, proj ? 100 : 0);
  };

  return (
    <div style={{ background:"#000", color:"#fff", fontFamily:"'Inter',system-ui,-apple-system,sans-serif", minHeight:"100vh", overflowX:"hidden" }}>
      <style>{mobileCSS}</style>
      <Nav goTo={goTo} />
      {proj ? (
        <ProjectDetail p={proj} onBack={closeProject} />
      ) : (
        <>
          <Hero goTo={goTo} />
          <About />
          <Projects onSelect={openProject} />
          <Skills />
          <Contact />
          <footer style={{ borderTop:`1px solid ${BORDER}`, padding:"32px 40px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:12, color:"#333", letterSpacing:"0.06em" }}>© 2026 PRATEEK KACHAM</span>
            <span style={{ fontSize:12, color:"#222", letterSpacing:"0.04em" }}>BOSTON, MA</span>
          </footer>
        </>
      )}
    </div>
  );
}