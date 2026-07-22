/**
 * English dictionary. Must satisfy `Dictionary` (the shape derived from `es`).
 * A missing key or a changed signature is a compile-time error.
 *
 * UI chrome only — no deterministic regulatory content (see config.ts).
 */
import type { Dictionary } from "../index";

export const en: Dictionary = {
  common: {
    save: "Save",
    cancel: "Cancel",
    close: "Close",
    back: "Back",
    next: "Next",
    loading: "Loading…",
    seeAll: "See all",
    skipToContent: "Skip to content",
  },

  locale: {
    switchToEn: "View in English",
    switchToEs: "View in Spanish",
    label: "Language",
    es: "Español",
    en: "English",
  },

  nav: {
    product: "Product",
    howItWorks: "How it works",
    pricing: "Pricing",
    faq: "FAQ",
    login: "Log in",
    requestAccess: "Request access",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },

  meta: {
    title: "Attesta — Continuous AI governance for the mid-market",
    description:
      "Inventory your AI systems, classify their risk (EU AI Act + U.S.) and generate audit-ready evidence. AI governance and compliance readiness, without a GRC team.",
    ogTitle: "Attesta — Continuous AI governance",
  },

  landing: {
    hero: {
      badge: "AI governance for Human Resources · EU AI Act",
      titleLine1: "Hire with AI",
      titleLine2: "without fearing the audit.",
      bodyBefore:
        "The AI you use to hire —CV screening, interviews, candidate scoring— is ",
      bodyEmphasis: "high-risk",
      bodyAfter:
        " under the EU AI Act. Attesta inventories it, classifies its risk, generates your evidence and watches regulatory changes. Without needing a GRC team.",
      ctaPrimary: "Request early access",
      ctaSecondary: "Explore the demo",
      footnote:
        "More than 3 in 4 companies move faster on AI than on governing it. You can stay ahead.",
    },

    heroPreview: {
      urlBar: "app.attesta.io/dashboard",
      navItems: ["Overview", "Inventory", "Risk", "Monitoring", "Team"],
      overviewTitle: "Governance overview",
      stats: [
        { k: "Systems", v: "6" },
        { k: "High risk", v: "4" },
        { k: "% ready", v: "59%" },
      ],
      milestoneLabel: "Next milestone · Transparency (Art. 50)",
      countdown: "in 16 days",
      distributionTitle: "Risk distribution",
      riskLabels: ["High risk", "Limited risk", "Minimal risk"],
    },

    trustStrip: {
      eyebrow:
        "For HR, Talent Acquisition and People Ops leaders who use AI to hire",
      sectors: [
        "CV screening",
        "Video interviews",
        "Candidate scoring",
        "AI-powered ATS",
        "Automated tests",
        "Hiring chatbots",
      ],
    },

    problemStats: {
      eyebrow: "The problem",
      title: "The regulation is here. Most aren't ready.",
      intro:
        "Thousands of mid-sized companies use AI in decisions that affect people —hiring, credit, insurance, health— and suddenly find themselves under regulatory scrutiny, with no governance team.",
      statLabels: [
        "of companies admit their AI adoption is outpacing their ability to govern it.",
        "have no formal inventory of their AI systems.",
        "or 7% of turnover: fines tougher than the GDPR.",
        "is what it costs today to handle it with consultants and spreadsheets.",
      ],
      sources:
        "Sources: AI governance — IBM, June 2026 study (2,000 CIOs and CTOs across 33 countries); AI inventory — Cloud Security Alliance, 2026 research note. The €35M / 7% of turnover cap comes from the EU AI Act itself (Art. 99).",
    },

    recruitmentFocus: {
      eyebrow: "Built for HR",
      title: "Do you use AI to hire? You're in scope.",
      introBefore:
        "The EU AI Act classifies AI for employment and recruitment as ",
      introEmphasis: "high-risk",
      introAfter:
        " (Annex III). Attesta tells you exactly what you have and what you're missing.",
      cases: [
        {
          name: "CV screening and ranking",
          body: "Filters or prioritizes candidates and decides who advances.",
        },
        {
          name: "AI video interviews",
          body: "Analyzes answers, voice or expressions to assess the person.",
        },
        {
          name: "Candidate scoring",
          body: "Scores fit for the role from profile data.",
        },
        {
          name: "Automated psychometric tests",
          body: "Assesses aptitude or personality with automatic scoring.",
        },
        {
          name: "Hiring chatbots",
          body: "Interact with candidates: transparency obligation.",
        },
        {
          name: "Interview scheduling and logistics",
          body: "Coordinates without deciding about people.",
        },
      ],
      note: "Indicative classification based on EU AI Act criteria. Attesta provides self-assessment and evidence management, not legal advice.",
      riskLabels: { high: "High risk", limited: "Limited risk", minimal: "Minimal risk" },
    },

    modules: {
      eyebrow: "The product",
      title: "The system of record for your AI governance.",
      intro: "The full flow: from inventory to audit-ready evidence.",
      items: [
        {
          title: "AI systems inventory",
          body: "A living catalog of every model and system in use: who operates it, what data it touches and which decision it serves. More than half of companies don't have one; you will.",
          points: [
            "Guided discovery",
            "Owner and vendor",
            "Always up to date",
          ],
        },
        {
          title: "Risk classification",
          body: "A guided wizard classifies each system under the EU AI Act —unacceptable, high, limited or minimal— and tells you exactly which obligations apply, separating what's yours (deployer) from the provider's.",
          points: [
            "Mapping to AI Act articles",
            "Evidence capture and attestation",
            "Explainable and defensible",
          ],
        },
        {
          title: "Gap assessment and plan",
          body: "What you're missing, prioritized by severity, with an action plan per article. Apply a domain policy pack (HR, workforce management, customer service & generative AI, or credit/insurance) and preload the typical controls for the case.",
          points: [
            "Prioritized gaps",
            "Domain policy packs",
            "Action plan per article",
          ],
        },
      ],
    },

    platform: {
      eyebrow: "The moat",
      title: "Continuous governance, not a one-day snapshot.",
      intro:
        "A checklist expires the moment you close it. Attesta stays alive: it watches the regulation, generates the documentation and stores the evidence for you.",
      items: [
        {
          title: "Regulatory watch",
          body: "A radar of EU AI Act deadlines and changes, mapped to your systems: you know what affects you and when, before it arrives. When the law changes, you already know.",
        },
        {
          title: "Automatic dossier and reports",
          body: "Generate in one click each system's governance dossier and the organization's executive report, ready for the auditor or leadership. Like having a consultant in-house.",
        },
        {
          title: "Immutable record",
          body: "Every change is recorded by the database —who did what and when— with no way to edit or delete it. Truly defensible evidence, not a spreadsheet.",
        },
        {
          title: "Your team, with roles",
          body: "HR, Legal and audit working in one place, with role-based permissions and per-organization isolation. Invite whoever you need in seconds.",
        },
      ],
    },

    whyNow: {
      eyebrow: "Why now",
      title: "An unavoidable obligation, with a window to get ahead.",
      introBefore: "The AI governance software market will grow from ",
      introValue1: "$492M in 2026",
      introMid: " to ",
      introValue2: "$15.8B in 2030",
      introAfter:
        " (~30–36% CAGR). Whoever becomes the system of record for governance today, stays.",
      milestones: [
        {
          date: "Feb 2025 · in force",
          title: "AI literacy (Art. 4)",
          body: "Already enforceable: your organization must ensure that those operating these tools have sufficient AI training. It's a deployer's own duty, not the provider's.",
        },
        {
          date: "2 Aug 2026",
          title: "Transparency (Art. 50)",
          body: "The nearest deadline: transparency duties begin to apply to AI that interacts with candidates or generates content. It directly affects an AI-driven hiring process.",
        },
        {
          date: "Dec 2027",
          title: "High-risk obligations",
          body: "The Digital Omnibus moved the Annex III (employment) obligations here. It's not August 2026 —a widespread market misconception—: you have a window to prepare well, not to ignore it.",
        },
        {
          date: "2026 →",
          title: "U.S. state laws",
          body: "State-level AI regulations keep adding up (e.g. New York, Illinois, Colorado). The regulatory surface keeps growing.",
        },
      ],
    },

    useCaseStory: {
      eyebrow: "In action",
      title: "From doubt to evidence, in an afternoon.",
      intro:
        "Here's how a mid-market company goes from “I think we use AI in hiring” to having everything classified, gaps closed and evidence ready for the auditor.",
      inventory: {
        header: "Inventory · 3 systems",
        rows: [
          { name: "CV screening", tag: "High risk" },
          { name: "Candidate scoring", tag: "High risk" },
          { name: "Interview chatbot", tag: "Limited risk" },
        ],
      },
      risk: {
        header: "Risk distribution",
        badge: "CV screening · Annex III",
        barLabels: ["High risk", "Limited risk", "Minimal risk"],
      },
      gap: {
        header: "Audit readiness",
        subtext: "Up from 41% when the action plan opened.",
        tasks: [
          "Documented human oversight (Art. 14)",
          "Transparency notice to candidates (Art. 50)",
          "Logs retained (Art. 26)",
        ],
      },
      evidence: {
        fileTitle: "Evidence dossier · CV screening.pdf",
        fileSubtitle: "Generated and ready for the auditor.",
        radar: "The radar detected a change · Transparency (Art. 50)",
        countdown: "in 16 days",
      },
      steps: [
        {
          title: "Discover what you already use",
          body: "In one afternoon, Talenta RH —a 140-person recruitment agency— inventories the AI systems it was already running without fully realizing it.",
        },
        {
          title: "See its real risk",
          body: "CV screening turns out to be high-risk under Annex III of the EU AI Act. Attesta classifies it and tells it, as a deployer, which obligations apply.",
        },
        {
          title: "Close the gaps",
          body: "The gap assessment becomes a plan with owners and dates. Its audit readiness climbs from 41% to 78% as it closes tasks.",
        },
        {
          title: "Auditable and watched",
          body: "It generates its evidence dossier in one click and the regulatory radar keeps watch: when something changes, it warns before the deadline.",
        },
      ],
    },

    honestidad: {
      eyebrow: "Why you can trust it",
      title: "Zero hallucinations. By design.",
      intro:
        "Every line of your evidence comes from your data and the EU AI Act text verified by a human — not from a generative model. It's the opposite of “AI-written compliance”: here, AI doesn't write your law.",
      pillars: [
        {
          title: "Deterministic legal content",
          body: "No risk classification or regulatory text is written by a generative model. It's assembled from rules and the verified EU AI Act text over your real data. Invented legal text would be a liability; here it doesn't exist.",
        },
        {
          title: "Checked against expert judgment",
          body: "The regulatory content is checked against expert judgment on the EU AI Act (articles, deadlines and the split of obligations between provider and deployer) before publishing, and is updated when the rule changes.",
        },
        {
          title: "Verifiable evidence",
          body: "Each record is chained with a SHA-256 fingerprint: any later alteration is detectable. The evidence you present to the auditor is traceable, not an unbacked screenshot.",
        },
      ],
    },

    pricing: {
      eyebrow: "Pricing",
      title: "Start free. Scale when you need to.",
      intro: "Indicative prices (USD) during early access.",
      recommended: "Recommended",
      tiers: [
        {
          name: "Diagnostic",
          price: "Free",
          note: "A taste to start today",
          features: [
            "AI systems inventory",
            "Risk classification (EU AI Act + U.S.)",
            "1 user",
          ],
          limits: "No PDF evidence, no watch or action plan.",
          cta: "Log in",
        },
        {
          name: "Readiness",
          price: "$120",
          unit: "/mo",
          note: "The system of record for your governance",
          lead: "Everything in the free plan, plus you unlock:",
          features: [
            "Gap assessment + action plan",
            "Continuous regulatory watch",
            "Dossier and executive report (PDF)",
            "Verifiable evidence and audit trail",
            "Policy packs (5 domains)",
            "Team and roles",
          ],
          cta: "Subscribe",
        },
        {
          name: "Enterprise",
          price: "Custom",
          note: "For multiple entities and advanced needs",
          lead: "Everything in Readiness, plus:",
          features: [
            "Multi-organization",
            "SSO and advanced controls",
            "Priority support",
          ],
          cta: "Request access",
        },
      ],
      compare: {
        title: "Compare the plans",
        capability: "Capability",
        team: "Team",
        includedLabel: "Included",
        notIncludedLabel: "Not included",
        rows: [
          "AI systems inventory",
          "Risk classification (EU AI Act + U.S.)",
          "Users",
          "Gap assessment + action plan",
          "Continuous regulatory watch",
          "Dossier and executive report (PDF)",
          "Verifiable evidence and audit trail",
          "Policy packs (5 domains)",
          "Multi-organization",
          "SSO and advanced controls",
          "Priority support",
        ],
      },
    },

    faq: {
      eyebrow: "Frequently asked questions",
      title: "What you usually want to know.",
      items: [
        {
          q: "Does Attesta certify my EU AI Act compliance?",
          a: "No. Attesta is a self-assessment and audit-readiness tool: it organizes your inventory, your risk classification and your evidence. Conformity certification, where applicable, is issued only by accredited notified bodies. We don't provide legal advice.",
        },
        {
          q: "Is AI that filters or scores candidates high-risk?",
          a: "As a general rule, yes. AI used for recruitment (CV screening, ranking, video interviews, tests) falls under Annex III (employment) of the EU AI Act as high-risk. There is a narrow exception (Art. 6.3) for very limited tasks, but it almost never applies when the system profiles or scores people. It entails obligations of human oversight, bias control and evidence — exactly what Attesta organizes for you, and the risk wizard assesses that exception for you.",
        },
        {
          q: "We use third-party AI, we don't build it. Is this for us?",
          a: "Yes — in fact that's our focus. As the deployer you have your own obligations (using it as intended, human oversight, log retention, and in certain cases an impact assessment). Attesta helps you meet them and demonstrate it with evidence.",
        },
        {
          q: "The deadline moved to 2027 — why start now?",
          a: "Exactly because of that: you get a wider window to prepare well, without rushing or last-minute expensive consultants. The deferral of Annex III high-risk to December 2027 comes from the Digital Omnibus, agreed by the Parliament and the Council in June 2026 and pending formal publication in the OJEU. The obligation remains unavoidable; getting ahead is cheaper and less risky. (Note: AI literacy and the Art. 5 prohibitions have been enforceable since February 2025.)",
        },
        {
          q: "How is it different from a consultant or a spreadsheet?",
          a: "A consultant hands you a fixed snapshot —expensive and out of date the moment the rule changes—; a spreadsheet watches nothing and leaves no verifiable trail. Attesta is a living system of record: it keeps your inventory and evidence current, watches regulatory changes and chains each record with SHA-256 so it's auditable. It doesn't replace legal judgment when you need it, but it does replace the repetitive work of organizing and maintaining it.",
        },
        {
          q: "What happens to my evidence if I cancel?",
          a: "It's yours. You can export your dossier and executive report as PDF at any time, so the evidence you've prepared isn't trapped in the tool.",
        },
        {
          q: "Do I need a governance team to use it?",
          a: "No. Attesta is built for the mid-market without a GRC team: guided questionnaires, prioritized recommendations and audit-ready evidence, in plain language.",
        },
        {
          q: "How do you protect our data?",
          a: "Each organization is isolated from the others (multi-tenant with row-level access control) and every change is stored in a verifiable audit log: chained with SHA-256, so that any later alteration is detectable.",
        },
      ],
    },

    waitlist: {
      title: "Get ahead of the audit.",
      intro:
        "We're onboarding a small group of mid-market companies. Request early access and get an initial gap assessment.",
      successTitle: "Thank you!",
      successBodyBefore: "We'll notify you at ",
      successBodyAfter: " when we open your access.",
      emailLabel: "Work email",
      honeypotLabel: "Do not fill",
      placeholder: "you@company.com",
      submit: "Request access",
      submitting: "Sending…",
      invalidEmail: "Enter a valid email (e.g. you@company.com).",
      genericError: "We couldn't register you. Please try again.",
      genericErrorRetry: "We couldn't register you. Please try again in a moment.",
      trustMarkers: [
        "EU region · data in the European Union",
        "EU AI Act content checked against expert judgment",
        "We don't certify: honest readiness",
      ],
      disclaimer:
        "No commitment. Attesta provides governance guidance, not legal advice.",
    },

    footer: {
      tagline:
        "Continuous AI governance for the mid-market: inventory, risk, evidence and regulatory watch, ready for audit.",
      contactHeading: "Contact",
      rights: "© 2026 Attesta. All rights reserved.",
    },
  },
};
