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

  auth: {
    shell: {
      heading: "Govern your AI before the audit does.",
      points: [
        "Inventory and risk classification (EU AI Act)",
        "Audit-ready evidence and audit trail",
        "Enterprise-grade readiness, without a GRC team",
      ],
      backToSite: "← Back to site",
      switchToEn: "View in English",
      switchToEs: "View in Spanish",
    },

    demo: {
      title: "Demo mode",
      body: "Account sign-in requires connecting Supabase. Meanwhile, you can explore the product with sample data.",
      cta: "Explore the demo",
    },

    resetDemo: {
      title: "Demo mode",
      body: "Password recovery requires connecting Supabase.",
      cta: "Back to log in",
    },

    meta: {
      resetTitle: "Reset password · Attesta",
      resetUpdateTitle: "New password · Attesta",
    },

    pageErrors: {
      authLink: "The link is invalid or expired. Log in or request a new one.",
      sso: "Sign-in with the provider didn't complete. Try again or use your email.",
    },

    friendlyErrors: {
      invalidCredentials: "Incorrect email or password.",
      emailNotConfirmed: "Confirm your email before logging in.",
      alreadyRegistered: "An account with this email already exists. Log in.",
      passwordShould: "The password must be at least 6 characters.",
      invalidEmailFormat: "The email format isn't valid.",
      signupsDisabled: "Email sign-up is disabled. Contact the administrator.",
      rateLimit: "Too many attempts. Wait a moment and try again.",
      duplicateOrg: "That organization name is already taken. Try another.",
      invalidToken: "The code is incorrect or expired. Check your email or resend it.",
      network: "We couldn't connect. Check your connection and try again.",
      generic: "Something went wrong. Please try again.",
    },

    login: {
      loginTitle: "Log in",
      signupTitle: "Create your account",
      loginSubtitle: "Access your AI governance dashboard.",
      signupSubtitle: "Start inventorying and classifying your AI.",

      nombreLabel: "First name",
      nombrePlaceholder: "Your name",
      apellido1Label: "Last name",
      apellido1Placeholder: "Last name",
      apellido2Label: "Second surname",
      apellido2Optional: "(optional)",
      apellido2Placeholder: "Surname",
      emailLabel: "Work email",
      emailPlaceholder: "you@company.com",
      passwordLabel: "Password",
      forgotPassword: "Forgot your password?",
      confirmLabel: "Confirm password",
      passwordHint: "At least 6 characters.",

      show: "Show",
      hide: "Hide",
      showPassword: "Show password",
      hidePassword: "Hide password",

      submitLoading: "One moment…",
      loginCta: "Log in",
      signupCta: "Create account",

      noAccount: "Don't have an account?",
      haveAccount: "Already have an account?",
      switchToSignup: "Sign up",
      switchToLogin: "Log in",

      // Local (per-field) validation
      nombreRequired: "Enter your first name.",
      apellido1Required: "Enter your last name.",
      emailRequired: "Enter your work email.",
      emailInvalid: "Enter a valid email (e.g. you@company.com).",
      passwordRequired: "Enter your password.",
      passwordMin: "The password must be at least 6 characters.",
      confirmRequired: "Repeat the password.",
      confirmMismatch: "The passwords don't match.",

      // Code verification (after sign-up)
      verifyTitle: "Verify your email",
      verifyDescBefore: "We sent a verification code to ",
      verifyDescAfter: ". Enter it to activate your account.",
      codeLabel: "Verification code",
      codeRequired: "Enter the code we emailed you.",
      codeVerifyFailed: "We couldn't verify the code. Please try again.",
      verifying: "Verifying…",
      verifyCta: "Verify and continue",
      resend: "Resend code",
      resending: "Resending…",
      resentNotice: "We resent the code. Check your email (and the spam folder).",
      changeEmail: "← Change email",
      linkHint: "Got a link instead of a code? Open it from the email to confirm your account.",
    },

    sso: {
      connecting: "Connecting…",
      continueGoogle: "Continue with Google",
      continueMicrosoft: "Continue with Microsoft",
      error: "We couldn't connect with that provider. Please try again.",
      divider: "or with your email",
    },

    onboarding: {
      title: "Create your organization",
      subtitle: "It's your workspace in Attesta. You can invite your team later.",
      nameLabel: "Organization name",
      namePlaceholder: "Acme, Inc.",
      creating: "Creating…",
      cta: "Create and continue",
    },

    resetRequest: {
      title: "Recover your password",
      subtitle: "Enter your email and we'll send you a link to create a new one.",
      honeypotLabel: "Do not fill",
      emailLabel: "Work email",
      emailPlaceholder: "you@company.com",
      sending: "Sending…",
      submit: "Send link",
      backToLoginLink: "← Back to log in",

      emailInvalid: "Enter a valid email (e.g. you@company.com).",
      rateLimit: "Too many attempts. Wait a moment and try again.",
      redirectConfig: "We couldn't send the link (redirect URL configuration pending). Contact the administrator.",
      generic: "We couldn't send the email. Please try again in a moment.",

      sentTitle: "Check your email",
      sentBodyBefore: "If an account is associated with ",
      sentBodyAfter: ", we've sent you a link to reset your password. It expires in one hour.",
      spamHint: "Don't see it? Check your spam folder.",
      backToLogin: "Back to log in",
    },

    resetUpdate: {
      checking: "Checking the link…",

      invalidTitle: "Invalid link",
      invalidBody: "This recovery link has expired or was already used. Request a new one to continue.",
      requestAnother: "Request another link",

      doneTitle: "Password updated",
      doneBody: "Done. Taking you to your dashboard…",

      title: "Create a new password",
      subtitle: "Choose a strong password for your account.",
      newPasswordLabel: "New password",
      passwordHint: "At least 6 characters.",
      confirmLabel: "Repeat the password",
      saving: "Saving…",
      submit: "Save password",
      show: "Show",
      hide: "Hide",
      showPassword: "Show password",
      hidePassword: "Hide password",

      passwordMin: "The password must be at least 6 characters.",
      mismatch: "The passwords don't match.",
      shouldDiffer: "The new password must be different from the previous one.",
      expired: "The link expired. Request a new one.",
      generic: "We couldn't update the password. Please try again.",
    },
  },

  dashboard: {
    skipToContent: "Skip to content",

    nav: {
      overview: "Overview",
      inventory: "Inventory",
      risk: "Risk",
      gap: "Gap assessment",
      plan: "Action plan",
      packs: "Policy packs",
      monitoring: "Monitoring",
      team: "Team",
      activity: "Activity",
      organizations: "Organizations",
      security: "Security",
      lockedTitle: "Readiness plan feature",
      lockedTitleEnterprise: "Enterprise plan feature",
      lockedLabel: "Locked",
    },

    sidebar: {
      demoTitle: "Demo view",
      demoBody:
        "Explore Attesta with sample data. Create your account to use your own.",
      backToSite: "← Back to site",
    },

    account: {
      organization: "Organization",
      billing: "Plan and billing",
      goToSite: "Go to public site",
      switchAccount: "Switch account",
      signOut: "Log out",
    },

    toastClose: "Close notification",

    toasts: {
      "system-created": "System registered in the inventory.",
      "system-updated": "System updated.",
      "system-deleted": "System deleted.",
      "system-error": "Couldn't save the system. Please try again.",
      seeded: "Sample data loaded.",
      "seed-error": "Couldn't load the sample data. Please try again.",
      "pack-applied": "HR policy pack applied to the system.",
      "pack-error": "Couldn't apply the policy pack. Please try again.",
      "gap-created": "Gap added.",
      "gap-deleted": "Gap deleted.",
      "gap-updated": "Gap status updated.",
      "gap-error": "Couldn't complete the action. Please try again.",
      "bias-saved": "Bias audit evidence saved.",
      "bias-error": "Couldn't save the bias audit. Please try again.",
      "member-added": "Member added to the team.",
      "member-invited": "Invitation sent.",
      "member-exists": "That person is already a team member.",
      "role-updated": "Role updated.",
      "member-removed": "Member removed from the team.",
      "invite-revoked": "Invitation revoked.",
      "team-forbidden": "You don't have permission for this action.",
      "team-lastowner": "At least one owner must remain.",
      "team-bademail": "Enter a valid email.",
      "team-demo": "Team management requires connecting your organization.",
      "team-error": "Couldn't complete the action. Please try again.",
      "cand-approved": "Candidate published to the regulatory radar.",
      "cand-saved": "Candidate draft saved.",
      "cand-rejected": "Candidate discarded.",
      "cand-demo": "Candidate review requires connecting your organization.",
      "cand-error": "Couldn't complete the action. Review and try again.",
      "jur-saved": "Jurisdictions updated.",
      "jur-demo": "Configuring jurisdictions requires connecting your organization.",
      "jur-error": "Couldn't save the jurisdictions.",
      "task-created": "Task added to the plan.",
      "task-deleted": "Task deleted.",
      "task-demo": "Editing the plan requires connecting your organization.",
      "task-error": "Couldn't complete the action. Please try again.",
      "vigia-ok": "Watcher ran. Check the inbox if it detected changes.",
      "vigia-demo": "The Watcher requires connecting your organization.",
      "vigia-denied": "Only Attesta's review team can run the Watcher.",
      "vigia-error": "The Watcher couldn't complete the review. Please try again.",
    },

    units: {
      dayOne: "day",
      dayOther: "days",
      systemOne: "system",
      systemOther: "systems",
      minute: "min",
      hour: "h",
      monthOne: "month",
      monthOther: "months",
      yearOne: "year",
      yearOther: "years",
    },

    welcome: {
      badge: "Let's start",
      greetingNamedPrefix: "Welcome, ",
      greetingDefault: "Welcome to Attesta",
      missionWithOrgBefore:
        "Here you build the AI governance system of record for ",
      missionWithOrgAfter:
        ": inventory, risk classification and audit-ready evidence.",
      missionDefault:
        "Here you build the system of record for your AI governance: inventory, risk classification and audit-ready evidence.",
      ctaPrimary: "+ Register your first system",
      ctaSeed: "Explore with sample data",
      seedPending: "Loading sample…",
      seedHint:
        "Sample data loads a realistic inventory so you can see the dossier, the gaps and the watch before entering your own.",
      step: "Step",
      journey: [
        {
          title: "Inventory",
          body: "Register every AI system in use: who operates it, which vendor and what for.",
        },
        {
          title: "Classify the risk",
          body: "The EU AI Act and U.S. frameworks wizard places each system at its level.",
        },
        {
          title: "Prepare the evidence",
          body: "Spot gaps, follow a plan and generate an audit-ready dossier and report.",
        },
      ],
      nextMilestone: "Next regulatory milestone:",
      milestoneDaysPrefix: "· in ",
    },

    onboarding: {
      title: "First steps in Attesta",
      subtitle: "Complete these steps to get your AI governance up and running.",
      dismiss: "Hide",
      paidBadge: "Readiness",
      steps: {
        system: {
          label: "Register your first AI system",
          hint: "Start your AI inventory",
        },
        risk: {
          label: "Classify a system's risk",
          hint: "With the EU AI Act wizard",
        },
        gap: {
          label: "Find your gaps",
          hint: "Apply a policy pack to a system",
        },
        team: {
          label: "Invite your team",
          hint: "Governance is a team effort",
        },
      },
    },

    guide: {
      brand: "Quick guide",
      skip: "Skip",
      back: "Back",
      next: "Next",
      start: "Start",
      step: "Step",
      of: "of",
      frames: {
        overview: "Governance overview",
        inventory: "Inventory · 3 systems",
        risk: "Risk distribution",
        gap: "Audit readiness",
        plan: "Action plan",
        radar: "Regulatory radar",
        team: "Team",
      },
      steps: [
        {
          title: "Welcome to Attesta",
          body: "Your system of record to govern AI with evidence. In 30 seconds we show you what each section is for —with a glimpse of each screen.",
        },
        {
          title: "Inventory",
          body: "Register every AI system your organization uses. It's the starting point: everything else is computed from what you declare here.",
        },
        {
          title: "Risk",
          body: "Classify each system under the EU AI Act and U.S. frameworks. Attesta guides you on its risk level and which obligations apply to your deployer role.",
        },
        {
          title: "Gap assessment",
          body: "Measure how ready you are against each obligation and get your “% ready”. The gaps identified turn into concrete tasks to close.",
        },
        {
          title: "Action plan and Policy packs",
          body: "The plan gathers the tasks to close gaps with owners and dates. Policy packs give you ready-made templates (starting with HR).",
        },
        {
          title: "Watch",
          body: "A radar that watches the official regulatory sources and alerts you when something changes. A human validates changes before they're published: never invented text.",
        },
        {
          title: "Team and Activity",
          body: "Invite your team with roles and check the activity log: an immutable audit trail of everything that happens. That's it, you're ready to begin.",
        },
      ],
      viz: {
        statSystems: "Systems",
        statHighRisk: "High risk",
        statReady: "% ready",
        inventoryRows: [
          { name: "CV screening", tag: "High risk" },
          { name: "Candidate scoring", tag: "High risk" },
          { name: "Interview chatbot", tag: "Limited risk" },
        ],
        riskBars: ["High", "Limited", "Minimal"],
        readyLabel: "% ready",
        checks: [
          "Human oversight (Art. 14)",
          "Transparency to candidates (Art. 50)",
        ],
        tasks: [
          { t: "Document human oversight", who: "Ana · Jul 12" },
          { t: "Publish transparency notice", who: "Luis · Jul 20" },
        ],
        radarMilestone: "Next milestone · Transparency (Art. 50)",
        radarCountdown: "in 16 days",
        radarSources: "8 official sources watched · no changes",
        teamMembers: "3 members · roles by email",
        activityLabel: "Activity ·",
        activityText: "Ana classified “CV screening” as high risk",
      },
    },

    paywall: {
      featureBefore: "",
      featureAfter: " plan feature",
      tierName: {
        preparacion: "Readiness",
        enterprise: "Enterprise",
      },
      descDefault:
        "Unlock this section with the Readiness plan: your organization's full audit readiness.",
      descEnterprise:
        "This feature is part of the Enterprise plan (multiple entities, SSO and priority support).",
      ctaEnterprise: "See plans and contact",
      ctaPlansBefore: "See plans · ",
      perMonth: "/mo",
      back: "Back to overview",
      footer:
        "Inventory and risk classification remain available on the free plan.",
    },

    organizations: {
      title: "Organizations",
      subtitle: "Manage every entity in your group from a single account.",
      gateFeature: "Multi-organization",
      gateDescription:
        "Manage several entities under one account on the Enterprise plan: switch between them and create new organizations. Each organization keeps its own plan, data and audit trail separately.",
      listTitle: "Your organizations",
      listSubtitle:
        "The plan applies per organization. When you switch, you'll see the plan and features of the active organization.",
      activeBadge: "Active",
      planLabel: "Plan",
      roleLabel: "Your role",
      switchCta: "Switch to this",
      switchingCta: "Switching…",
      createTitle: "Create an organization",
      createSubtitle:
        "The new entity starts on the free plan, with its data kept separate. You'll be its owner.",
      nameLabel: "Organization name",
      namePlaceholder: "e.g. Northern Subsidiary Ltd.",
      createCta: "Create organization",
      creatingCta: "Creating…",
      createdToast: "Organization created.",
      emptyDemo:
        "The demo view doesn't include multiple organizations. Create your account to manage your real entities.",
      roles: { owner: "Owner", admin: "Admin", member: "Member" },
    },

    security: {
      title: "Security",
      subtitle: "SSO and advanced controls for your organization.",
      gateFeature: "SSO and advanced controls",
      gateDescription:
        "Single sign-on (SSO) and advanced access controls are part of the Enterprise plan. Turn them on by coordinating with the Attesta team.",
      ssoTitle: "Single sign-on (SSO)",
      ssoBody:
        "Connect your identity provider (SAML 2.0 or OIDC) so your team signs in with corporate credentials. Activation is coordinated with our team.",
      ssoStatusLabel: "Status",
      ssoStatusNotConfigured: "Not configured",
      ssoIncludesTitle: "Includes",
      ssoIncludes: [
        "SAML 2.0 and OpenID Connect",
        "Allowed email domains",
        "User provisioning and deprovisioning",
      ],
      requestCta: "Request SSO activation",
      controlsTitle: "Advanced controls",
      controlsBody:
        "Session policy, email-domain restriction and extended access logging. Available with SSO on the Enterprise plan.",
    },

    deadlines: {
      title: "Plan deadlines",
      overdueOne: "overdue",
      overdueOther: "overdue",
      viewPlan: "View the plan →",
      morePrefix: "and ",
      moreTaskOne: "more task",
      moreTaskOther: "more tasks",
      moreSuffix: " coming due soon.",
    },

    risk: {
      systems: "systems",
      labels: {
        unacceptable: "Unacceptable",
        high: "High risk",
        limited: "Limited risk",
        minimal: "Minimal risk",
      },
    },

    bias: {
      labels: {
        no_aplica: "Not an AEDT",
        sin_auditoria: "No audit",
        vencida: "Audit expired",
        por_vencer: "Expiring soon",
        vigente: "Audit valid",
      },
      overduePrefix: "expired ",
      overdueSuffix: " ago",
      today: "due today",
      upcomingPrefix: "due in ",
      dayOne: "day",
      dayOther: "days",
    },

    confirm: {
      confirmDefault: "Delete",
      cancel: "Cancel",
      close: "Close",
    },

    buttons: {
      downloadPdf: "Download / Print PDF",
      vigiaRun: "Run the Watcher now",
      vigiaRunning: "Checking sources…",
      deleteSystemTitleBefore: 'Delete "',
      deleteSystemTitleAfter: '"',
      deleteSystemMessage:
        "Its assessments and gaps will also be deleted. This action can't be undone.",
      deleteSystemLabel: "Delete system",
      deleteGapTitle: "Delete gap",
      deleteGapMessage:
        "This control will be removed from the gap assessment. This action can't be undone.",
      deleteGapLabel: "Delete",
      removeMemberTitle: "Remove from team",
      removeMemberMessageSuffix:
        " will lose access to this organization. You can invite them again later.",
      removeMemberLabel: "Remove",
      revokeInviteTitle: "Revoke invitation",
      revokeInviteMessage:
        "The invited person will no longer be able to join with this link. You can invite them again later.",
      revokeInviteLabel: "Revoke",
    },

    inventory: {
      title: "AI systems inventory",
      subtitle: "Every model and system in use, with its owner, vendor and status.",
      addSystem: "+ Register system",
      emptyTitle: "Your inventory is empty",
      emptyBody:
        "Register your first AI system, or load a sample dataset to explore Attesta with content.",
      loadSample: "Load sample data",
      loadSamplePending: "Loading sample…",
      col: {
        system: "System",
        domain: "Domain",
        risk: "Risk",
        evidence: "Backing",
        readiness: "Readiness",
        lastReview: "Last review",
        actions: "Actions",
      },
      classify: "Classify",
      dossier: "Dossier",
      backToInventory: "← Back to inventory",
      cancel: "Cancel",
      nameLabel: "System name *",
      namePlaceholder: "CV filter — Talent",
      ownerLabel: "Responsible area",
      ownerPlaceholder: "HR",
      domainLabel: "Use domain",
      domainPlaceholder: "Hiring",
      vendorLabel: "Vendor",
      vendorPlaceholder: "In-house / HireFlow…",
      roleLabel: "Your role",
      roleDeployer: "Deployer (we use the system)",
      roleProvider: "Provider (we develop it)",
      newTitle: "Register AI system",
      newSubtitle:
        "Add a system to the inventory. You can classify its risk later.",
      newDemoNotice:
        "Registering systems requires connecting Supabase. In demo mode the inventory uses sample data. Configure the credentials to start registering real systems.",
      createCta: "Register system",
      createPending: "Registering…",
      editTitle: "Edit system",
      editSubtitle: "Update the system's details or remove it from the inventory.",
      generateDossier: "⬇ Generate dossier",
      notFound:
        "The system wasn't found, or editing isn't available in demo mode.",
      saveCta: "Save changes",
      savePending: "Saving…",
      historyTitle: "Assessment history",
      evaluate: "+ Evaluate",
      historyBody:
        "Every saved classification is logged, with its backing level and who attested it.",
      dangerTitle: "Danger zone",
      dangerBody: "Deleting the system also deletes its assessments and gaps.",
    },

    gap: {
      title: "Gap assessment",
      subtitleOne: "1 open gap against the EU AI Act requirements.",
      subtitleOtherAfter: " open gaps against the EU AI Act requirements.",
      addGap: "+ Add gap",
      exportEvidence: "⬇ Export evidence (PDF)",
      severityPrefix: "· severity ",
      affectedSystemPrefix: "Affected system: ",
      status: { missing: "Missing", partial: "Partial", done: "Covered" },
      newTitle: "Add gap",
      newSubtitle: "Register a pending control or requirement for a system.",
      backToGap: "← Back to gap assessment",
      newDemoNotice:
        "Adding gaps requires connecting Supabase. In demo mode the gap assessment uses sample data.",
      noSystems:
        "Register a system in the inventory first to add gaps to it.",
      systemLabel: "System *",
      systemPlaceholder: "Select a system…",
      requirementLabel: "Requirement / control *",
      requirementPlaceholder: "Effective human oversight in the decision",
      articleLabel: "Article",
      articlePlaceholder: "Art. 26.2",
      severityLabel: "Severity",
      severityAlta: "Alta",
      severityMedia: "Media",
      severityBaja: "Baja",
      statusLabel: "Status",
      createCta: "Add gap",
      createPending: "Adding…",
      cancel: "Cancel",
    },

    team: {
      title: "Team",
      subtitle: "Invite your team (HR, Legal, audit) and manage their roles.",
      demoBefore: "You're in ",
      demoMode: "demo mode",
      demoAfter:
        ": a sample team is shown. Connect your organization to invite people and manage roles for real.",
      inviteTitle: "Invite someone",
      inviteBody:
        "If they already have an Attesta account they're added instantly. If not, the invitation stays pending and activates when they sign up with that email.",
      emailLabel: "Email",
      emailPlaceholder: "person@company.com",
      roleLabel: "Role",
      inviteCta: "Invite",
      membersTitle: "Members",
      you: "(you)",
      joinedPrefix: "Joined on ",
      pendingTitle: "Pending invitations",
      invitedAsPrefix: "Invited as ",
      pending: "Pending",
      rolesLegendTitle: "What each role can do",
      roleLabels: {
        owner: "Owner",
        admin: "Admin",
        member: "Member",
      },
      roleHints: {
        owner:
          "Full control: manages the team, the organization and can delete systems.",
        admin: "Manages systems, gaps and assessments; can invite members.",
        member: "Read-only access to the organization's dashboard.",
      },
    },

    billing: {
      title: "Plan and billing",
      subtitle: "Manage your organization's subscription.",
      okBanner:
        "Payment received! Your subscription will activate in a few seconds. If you don't see the change, reload the page.",
      canceledBanner: "Checkout canceled. No charge was made.",
      planPrefix: "Plan ",
      badgeEnterprise: "Enterprise",
      badgeUnlocked: "Unlocked",
      badgeFree: "Free",
      badgeActiveFallback: "Active",
      tier: {
        free: "Diagnostic",
        preparacion: "Readiness",
        enterprise: "Enterprise",
      },
      status: {
        active: "Active",
        trialing: "Trialing",
        past_due: "Payment due",
        canceled: "Canceled",
        unpaid: "Unpaid",
        incomplete: "Incomplete",
        incomplete_expired: "Expired",
        paused: "Paused",
      },
      willCancelBefore: "It will cancel on ",
      willCancelAfter: ". You keep access until then.",
      renewsBefore: "Renews on ",
      renewsAfter: ".",
      manageSubscription: "Manage subscription",
      portalHint:
        "Change payment method, view invoices or cancel — all in Stripe's secure portal.",
      enterpriseBody:
        "Your organization is on the Enterprise plan: full access, multiple entities, SSO and priority support.",
      unlockedBody:
        "Your organization has unlocked full audit readiness. Go for it!",
      freeBody:
        "Your organization is on the free plan (inventory and risk classification). Unlock full audit readiness.",
      perMonth: "/mo",
      subscribeCta: "Subscribe to Readiness",
      checkoutInactive: "Online payment isn't active yet. Check back soon.",
      includesTitle: "What Readiness includes",
      features: [
        "Gap assessment + action plan",
        "Continuous regulatory monitoring",
        "Dossier and executive report (PDF)",
        "Evidence and audit trail",
        "Policy packs (HR)",
        "Team and roles",
      ],
      enterpriseHint:
        "Need multiple entities, SSO or priority support? Write to us for the Enterprise plan.",
      exportTitle: "Export data",
      exportBodyBefore:
        "Download a complete copy of your organization's declared evidence in a portable ",
      exportBodyJson: "JSON",
      exportBodyAfter:
        " file: systems inventory, risk assessments, gaps, action plan, bias audits, team, regulatory reviews and the activity log with its integrity check. Your data is yours: use it for backup or to take it with you.",
      downloadJson: "Download JSON",
      exportNote:
        "It's a dump of your data, not a report or a certification. For the dossier or executive report in PDF, use the Inventory and Report sections.",
    },

    riskPage: {
      title: "Risk classification",
      subtitle:
        "Each system mapped to its EU AI Act risk level and its obligations.",
      evaluateCta: "+ Evaluate a system",
    },

    overview: {
      title: "Governance overview",
      subtitleStart: "Your starting point for governing AI with evidence.",
      subtitle: "Readiness status of your AI systems at a glance.",
      executiveReport: "Executive report",
      stat: {
        systems: "AI systems",
        systemsHint: "view inventory",
        highRisk: "High risk",
        highRiskHint: "require strict obligations",
        avgReadiness: "Average readiness",
        avgReadinessHintBefore: "target ≥ ",
        avgReadinessHintAfter: "% to be ready",
        openGaps: "Open gaps",
        openGapsHint: "view gap assessment",
      },
      meterNoteBefore: "The mark on the bars indicates the indicative target of ",
      meterNoteReady: "% ready",
      meterNoteAfter:
        " to consider a system audit-ready. It is not a judgment of compliance.",
      nextMilestone: "Next regulatory milestone",
      today: "today",
      inDaysPrefix: "in ",
      riskDistribution: "Risk distribution",
      needAttention: "Need attention",
      viewAll: "View all →",
      emptyAttentionTitle: "Nothing needs attention",
      emptyAttentionBody:
        "Once you register AI systems, the ones that need review or have lower readiness will show here.",
      registerSystem: "+ Register system",
      legalNote:
        'The "% ready" reflects self-declared evidence, not a judgment of compliance.',
    },

    controls: {
      gapStatus: { missing: "Missing", partial: "Partial", done: "Covered" },
      taskStatus: {
        todo: "To do",
        in_progress: "In progress",
        blocked: "Blocked",
        done: "Done",
      },
      memberRole: {
        member: "Member",
        admin: "Admin",
        owner: "Owner",
      },
      memberRoleAria: "Member role",
      eventStatus: {
        aria: "Internal status",
        unset: "Unmarked",
        reviewed: "Reviewed",
        planned: "Plan underway",
        notApplicable: "Not applicable",
      },
      jurisdiction: {
        toggle: "Adjust my jurisdictions",
        hint: "Where you operate · tune the radar",
        body: "Check the territories where your organization hires or has employees. The radar will prioritize the rules of those jurisdictions.",
        save: "Save",
      },
      task: {
        statusAria: "Status",
        assigneeAria: "Assignee",
        noAssignee: "Unassigned",
        dueDateAria: "Due date",
        deleteTitle: "Delete task",
        deleteMessageBefore: "The task “",
        deleteMessageAfter: "” will be removed from the plan. This action can't be undone.",
        deleteConfirm: "Delete",
        deleteTrigger: "Delete",
        deleteAria: "Delete task",
      },
      history: {
        emptyBefore:
          "This system has no saved assessments yet. Classify it from ",
        emptyLink: "Risk → Evaluate a system",
        emptyAfter: ".",
        current: "Current",
        attestedByPrefix: " · attested by ",
        viewEvidence: "View evidence",
      },
    },

    pages: {
      back: "← Back",
      backToOverview: "← Back to overview",
      backToInventory: "← Back to inventory",
      backToRiskClass: "← Back to risk classification",
      backToGap: "← Back to gap assessment",
      backToMonitoring: "← Back to Monitoring",
      radarBack: "← Radar",

      evaluate: {
        title: "Assess a system's risk",
        subtitle:
          "Answer the guided questionnaire and get the classification under the EU AI Act.",
      },

      wizard: {
        stepPrefix: "Step ",
        stepOf: " of ",
        back: "← Back",
        next: "Next",
        seeResult: "See result",
        selectSingle: "Single choice.",
        selectMultiple: "Multiple choice: you can select several options.",
        evaluateAnother: "Assess another system",
        backToRisk: "Back to risk",
        result: {
          indicativeLabel: "Indicative result",
          indicativeSuffix: "(indicative)",
          indicativeDesc:
            "Indicative classification based on EU AI Act criteria, drawn from what your organization has declared.",
          transparencyPre:
            "This system is also subject to the transparency obligations of ",
          transparencyArticle: "Art. 50",
          transparencyMid: ", which are ",
          transparencyEmphasis: "added",
          transparencyPost: " to the high-risk ones.",
          obligationsTitle: "Applicable obligations",
          regulatoryBasisTitle: "Regulatory basis",
          immediateAction: "Immediate action",
          criticalPoints: "Critical points and next steps",
          prohibitedNote:
            "A prohibited practice (Art. 5) is not prepared for audit — it is stopped. Validate with legal counsel before proceeding.",
          prioritizeNote:
            "What to prioritize for your preparation, ordered by urgency.",
          savedPre: "✓ Self-assessment saved as ",
          withEvidenceTag: "with evidence",
          declaredTag: "declared",
          savedMid:
            ". The system was updated and recorded in the audit-trail",
          savedAttestedPrefix: ", attested by ",
          viewDossier: "View system dossier →",
          saveTitle: "Save as self-assessment",
          systemLabel: "System",
          systemPlaceholder: "Select a system…",
          attestedByLabel: "Attesting owner",
          attestedByPlaceholder: "Name and role",
          evidenceLabel: "Supporting evidence",
          optional: "(optional)",
          evidencePlaceholder: "Document link or description",
          evidenceHintYes:
            'It will be saved as "with evidence": you provide documentary support.',
          evidenceHintNo:
            'Without evidence it will be saved as "declared" (unverified). Add a link or document to back it up.',
          saving: "Saving…",
          saveButton: "Save self-assessment",
          saveError: "Could not save. Please try again.",
        },
      },

      plan: {
        title: "Action plan",
        subtitle:
          "Prioritized tasks to close your gaps: assign an owner, date and status.",
        exportEvidence: "⬇ Export evidence",
        statOpen: "open",
        statInProgress: "in progress",
        statOverdue: "overdue",
        statDone: "done",
        addTask: "+ Add task",
        addTaskHint: "Create a manual task",
        fieldTitle: "Title",
        fieldTitlePlaceholder: "What needs to be done",
        fieldDetail: "Detail (optional)",
        fieldPriority: "Priority",
        fieldAssignee: "Owner",
        noAssignee: "Unassigned",
        fieldDueDate: "Due date",
        fieldSystem: "System (optional)",
        addToPlan: "Add to plan",
        emptyTitle: "Your plan is empty",
        emptyBody:
          "Add a task or bring in the suggestions below, generated from your gaps and risk levels.",
        overdue: "overdue",
        suggested: "· suggested",
        suggestionsTitle: "Suggestions",
        suggestionsBody:
          "Generated from your open gaps and risk levels. Add them to the plan to assign an owner and date.",
        addSuggestionToPlan: "+ Add to plan",
      },

      activity: {
        title: "Activity log",
        subtitle:
          "Every change is recorded and chained with SHA-256: any later alteration is detectable. Who did what and when.",
        chainOk: "Chain intact",
        chainBroken: "Integrity broken",
        filterAll: "All",
        filterSystems: "Systems",
        filterAssessments: "Assessments",
        filterGaps: "Gaps",
        filterTeam: "Team",
        empty: "No activity recorded yet.",
        demoBefore: "You're in ",
        demoMode: "demo mode",
        demoAfter:
          ": sample activity. In connected mode every real change is recorded by database triggers, with no way to edit or delete it.",
        justNow: "just now",
        agoPrefix: "",
        agoSuffix: " ago",
        chainOkTitle: "Chain integrity verified",
        chainBrokenTitle: "A change was detected in the log",
        chainOkBodyPrefix: "The ",
        eventChainedOne: "event is chained",
        eventChainedOther: "events are chained",
        chainOkBodyRest:
          " with SHA-256: each record embeds the hash of the previous one, so altering or deleting any of them —even with direct database access— would break the chain and leave evidence.",
        chainBrokenBodyPrefix: "The chain breaks at event #",
        chainBrokenBodyRest:
          ": a record was modified or deleted outside the application. Keep this evidence and review database access.",
        verifiedLive: "Verified live · ",
        actorSystem: "The system",
        changedPrefix: "Changed: ",
        pillInsert: "Added",
        pillUpdate: "Change",
        pillDelete: "Removed",
      },

      monitoring: {
        title: "Regulatory monitoring",
        subtitle:
          "A radar of deadlines and regulatory changes affecting your AI systems.",
        watchedSources: "Watched sources →",
        validationInbox: "Validation inbox →",
        jurisdictionFilter: "Jurisdiction",
        myJurisdictions: "My jurisdictions",
        allJurisdictions: "All",
        inNexus: "in your nexus",
        nextDeadline: "Next deadline",
        affectsPrefix: "affects ",
        affectsPrefixCap: "Affects ",
        affectsSuffix: " of your inventory",
        noAffected: "no affected systems in your inventory",
        noAffectedCap: "No affected systems in your inventory",
        affectedOne: "affected system",
        affectedOther: "affected systems",
        viewSystems: "View systems →",
        morePastDeadlines: "More upcoming deadlines",
        regulatoryTimeline: "Regulatory timeline",
        timelineMyJurisdictions: " · my jurisdictions",
        upcoming: "upcoming",
        inForce: "in force",
        detailWhat: "What it is",
        detailMeaning: "What it means for you",
        detailAction: "What to do",
        internalStatus: "Internal status",
        notMarked: "Not marked",
        affectedSystemsLabel: "Affected systems",
        relToday: "today",
        relTomorrow: "tomorrow",
        relYesterday: "yesterday",
        relInPrefix: "in ",
        relAgoPrefix: "",
        relAgoSuffix: " ago",
        relDays: "days",
        relMonths: "months",
        relYears: "years",
      },

      candidates: {
        title: "Validation inbox",
        subtitleNonAdmin:
          "Queue of regulatory candidates proposed by the pipeline.",
        subtitle:
          "Drafts proposed by the pipeline. Nothing reaches customers' radar without your validation.",
        nonAdminNotice:
          "This area is for Attesta's compliance team, which validates regulatory changes before publishing them on the radar.",
        pendingOne: "candidate pending",
        pendingOther: "candidates pending",
        pendingSuffix: " review",
        empty:
          "No pending candidates. The pipeline will leave each detected regulatory change here for your review.",
        reviewed: "Already reviewed",
        noDate: "no date",
        eventDatePrefix: "· event date ",
        confidencePrefix: "confidence ",
        impactLabel: "Impact for the deployer",
        actionLabel: "Proposed action",
        provenanceLabel: "Provenance",
        agentPrefix: "agent ",
        modelPrefix: "model ",
        noLlm: "no LLM (deterministic)",
        sourcePrefix: "· source ",
        publishedAsPrefix: "Published as “",
        publishedAsMid: "” · ",
        discardedPrefix: "Discarded · ",
        reviewNoteSep: " — ",
      },

      candidateControls: {
        closeEditor: "Close editor",
        completeAndPublish: "Complete and publish",
        editAndPublish: "Edit and publish",
        discard: "Discard",
        discardTitle: "Discard candidate",
        discardBodyBefore: "You're about to discard “",
        discardBodyAfter: "”. You can note a reason (optional) for the record.",
        reasonLabel: "Reason (optional)",
        cancel: "Cancel",
        close: "Close",
        publishToRadar: "Publish to the radar",
        saveDraft: "Save draft",
        rejectPlaceholder: "e.g. duplicate, noise, already covered…",
        signalUnanalyzedBold: "Unanalyzed Watcher signal.",
        signalUnanalyzedRest:
          " Open it to fill in the event date and type (required to publish) and refine the text; or discard it if it's noise.",
        fieldTitle: "Title",
        fieldFramework: "Framework",
        fieldKind: "Event type",
        fieldKindChoose: "— choose —",
        fieldEventDate: "Event date",
        fieldEventId: "Event id on publish",
        fieldEventIdPlaceholder: "generated if left empty",
        fieldSummary: "Summary (what it is)",
        fieldImpact: "Impact for the deployer",
        fieldAction: "Proposed action (what to do)",
        fieldArticles: "Articles (comma-separated)",
        fieldArticlesPlaceholder: "Art. 26, Annex III",
        fieldScope: "Scope (which systems it affects)",
        scopeAll: "The whole organization",
        publishRequired: "Event date and type are required to publish.",
      },

      sources: {
        title: "Watched sources",
        subtitleNonAdmin:
          "The Watcher's watchlist: the regulatory sources we monitor.",
        subtitle:
          "The Watcher checks these official sources by content fingerprint (fetch + hash). When one changes, it queues a signal in the validation inbox. Zero LLM: it only detects that something changed.",
        nonAdminNotice:
          "This area is for Attesta's compliance team, which watches regulatory changes before publishing them on the radar.",
        sourcesUnit: "sources",
        changedUnrevised: "with unreviewed changes",
        downloadErrors: "with a download error",
        demoNotice:
          "Demo mode: sample watchlist, read-only. With the organization connected, the Watcher checks the sources on a schedule and leaves signals in the Validator's inbox.",
        colSource: "Source",
        colLastStatus: "Last status",
        colChecked: "Checked",
        colLastChange: "Last change",
        unreviewed: "Unreviewed",
        never: "never",
        failOne: "failure",
        failOther: "failures",
      },

      reportExec: {
        downloadPdf: "Download report (PDF)",
        paywallFeature: "Executive report",
        paywallDesc:
          "Generate the executive AI governance report in PDF, ready for leadership and audit.",
        coverTag: "Executive report",
        coverKicker: "AI governance · Organization status · EU AI Act",
        coverTitle: "Executive AI governance report",
        kpiSystems: "AI systems",
        kpiHighRisk: "High risk",
        kpiAvgReadiness: "Average readiness",
        kpiOpenGaps: "Open gaps",
        kpiBacked: "With evidence",
        riskDistribution: "Risk distribution",
        needAttention: "Systems that need attention",
        needAttentionHintPrefix:
          "The most urgent: high risk with readiness below 60% (the indicative readiness threshold is ",
        needAttentionHintSuffix: "%).",
        allAboveThreshold: "No high-risk system is below the threshold. 👍",
        colSystem: "System",
        colRisk: "Risk",
        colReadiness: "Readiness",
        openGapsTitle: "Priority open gaps",
        openGapsHintMid: " open · ",
        openGapsHintSuffix: " high severity.",
        noOpenGaps: "No open gaps recorded.",
        deadlinesTitle: "Upcoming regulatory deadlines",
        noFutureDeadlines: "No future deadlines on the radar.",
        affectsMid: " · affects ",
        inDaysPrefix: "in ",
        footerNote: "Management summary for audit preparation.",
      },
      dossier: {
        downloadPdf: "Download dossier (PDF)",
        paywallFeature: "Evidence dossier",
        paywallDesc:
          "Generate the per-system evidence dossier in PDF, ready to present to the auditor.",
        notFound:
          "System not found. It may have been deleted or may not belong to your organization.",
        docKicker: "Technical documentation · Audit readiness · EU AI Act",
        docType: "AI governance dossier",
        refPrefix: "Ref. ",
        sec1: "System identification",
        sec2: "Risk classification",
        sec3: "Applicable obligations",
        sec4: "Controls and gaps",
        sec5: "Prioritized action plan",
        sec6: "Assessment history",
        sec7: "Statement of responsibility",
        fieldCode: "Code",
        fieldName: "Name",
        fieldOwnerArea: "Responsible area",
        fieldDomain: "Domain of use",
        fieldVendor: "Vendor",
        fieldYourRole: "Your role",
        fieldLastReview: "Last review",
        fieldDeclaredReadiness: "Declared readiness",
        kpiRiskLevel: "Risk level",
        kpiClassification: "Classification",
        kpiPriority: "Priority",
        kpiBacking: "Evidence",
        kpiReadiness: "Readiness",
        kpiOpenGaps: "Open gaps",
        kpiProhibited: "Prohibited practice (Art. 5)",
        kpiLegalReview: "Legal review",
        backingPrefix: "Evidence: ",
        currentAssessmentPrefix: "Current assessment of ",
        attestedByPrefix: "· attested by ",
        noNominalAttestation: "· not nominally attested",
        levelAssignedNoAssessment:
          "Level assigned in the system record; no assessment saved with the risk wizard.",
        colRequirementControl: "Requirement / control",
        gapsEmpty:
          "No controls recorded for this system. Apply the HR policy pack or add gaps from the gap assessment.",
        effortPrefix: "· effort ",
        historyEmpty: "No assessments saved for this system.",
        currentBadge: "current",
        evidencePrefix: "Evidence: ",
        declFieldBackingLevel: "Evidence level",
        declFieldAttestedBy: "Attested by",
        biasSectionTitle: "Bias audit — US (NYC LL144)",
        biasFieldLast: "Last bias audit",
        biasFieldNext: "Next audit (12 months)",
        biasFieldAuditor: "Independent auditor",
        biasFieldIndependence: "Independence confirmed",
        biasYesDeclared: "Yes (declared)",
        biasNo: "No",
        biasFieldPublished: "Summary published",
        biasPublishedYesPrefix: "Yes · ",
        biasPending: "Pending",
        biasFieldUrl: "Summary URL",
      },
      gapReport: {
        downloadPdf: "Download evidence (PDF)",
        coverTag: "Evidence report",
        coverKicker: "Self-assessment · EU AI Act",
        coverTitle: "Gaps and audit readiness",
        kpiEvaluated: "Controls evaluated",
        kpiOpen: "Open gaps",
        kpiOpenHigh: "Open, high sev.",
        kpiCovered: "Covered",
        kpiSystems: "Systems",
        coveredSuffix: " covered",
        groupsEmpty:
          "No controls evaluated yet. Apply a policy pack to your organization's systems from the gap assessment to evaluate their readiness.",
        chipHighOpenPrefix: " high sev. ",
        chipOpenOne: "open",
        chipOpenOther: "open",
        coveredWord: "covered",
        colRequirement: "Requirement",
      },

      packsPage: {
        title: "Policy packs",
        subtitle:
          "Control templates by use case and framework. Apply one to preload a system's gaps.",
        controlsUnit: "controls",
        applies: "Applies:",
        applyToSystem: "Apply to a system",
        selectSystem: "Select a system…",
        applyButton: "Apply policy pack",
        needSystem:
          "Register a system in the inventory to apply this pack to it.",
        demoNote:
          "In demo mode you can view the pack. Connect Supabase to apply it to your systems.",
        legalPrefix: "Indicative controls.",
      },

      reportChrome: {
        execSummary: "Executive summary",
        organizationLabel: "Organization:",
        selfDeclaredData: "self-declared data",
        roleWord: "role:",
        generatedByPrefix: "Generated by ",
        generatedByOn: " on ",
        footerWorkingDoc: "Working document for audit preparation.",
        colArticle: "Article",
        colSeverity: "Severity",
        colStatus: "Status",
        statusMissing: "Missing",
        statusPartial: "Partial",
        statusDone: "Covered",
        roleDeployer: "Deployer",
        roleProvider: "Provider",
      },
    },

    // Public `/demo` route: chrome for the example-data sample.
    demoPage: {
      metaTitle: "Demo · Attesta",
      metaDescription:
        "A sample of Attesta with example data: AI inventory and risk classification.",
      backToSiteLong: "Back to site",
      backToSiteShort: "Site",
      createAccount: "Create account",
      unlockCta: "Sign up to unlock →",
      sampleNoticeTitle: "You're viewing a sample with example data.",
      sampleNoticeBody:
        "Inventory and risk classification, open. Everything else unlocks when you create your account and use your own data.",
      startFree: "Start free",
      kpiSystems: "AI systems",
      kpiSystemsHint: "in inventory",
      kpiHighRisk: "High risk",
      kpiHighRiskHint: "strict obligations",
      kpiReadiness: "Average readiness",
      kpiReadinessHintPrefix: "target ≥ ",
      kpiFramework: "Framework",
      kpiFrameworkHint: "+ U.S. frameworks",
      inventoryTitle: "AI inventory",
      sampleBadge: "Sample",
      riskDistributionTitle: "Risk distribution",
      systemsLabel: "systems",
      unlockSectionTitle: "With your account you unlock",
      lockGapTitle: "Gap assessment",
      lockGapDesc:
        "Measure your '% ready' against each obligation and spot gaps.",
      lockGapPreview: "Audit readiness",
      lockPlanTitle: "Action plan",
      lockPlanDesc: "Turn gaps into tasks with owners and due dates.",
      lockPlanPreview: "Open tasks",
      lockWatchTitle: "Regulatory monitoring",
      lockWatchDesc:
        "A radar of official sources that alerts you to every change and deadline.",
      lockWatchPreviewLabel: "Next milestone",
      lockWatchPreviewMilestone: "Transparency (Art. 50)",
      lockWatchPreviewCountdown: "in 16 days",
      lockDossierTitle: "Dossier and report (PDF)",
      lockDossierDesc: "Auditor-ready evidence, generated in one click.",
      ctaTitle: "Use it with your own AI systems.",
      ctaBody:
        "Create your free account: inventory your AI and get its risk classification today. Unlock the full readiness whenever you want.",
      ctaCreate: "Create free account",
      ctaPlans: "See plans",
    },
  },
};
