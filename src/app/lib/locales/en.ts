/**
 * English translations
 */
import type { Translations } from "./vi";

export const en: Translations = {
  /* ------------------------------------------------------------------ */
  /*  Common / Shared                                                    */
  /* ------------------------------------------------------------------ */
  common: {
    brandName: "CareerAI",
    aiName: "AI Career Advisor",
    poweredBy: "Powered by Qwen AI",
    modelBadge: "Qwen",
    online: "Online",
    comingSoon: "Coming soon",
    tryNow: "Try Now",
    tryNowFree: "Try Now \u2014 Free",
    noSignup: "No sign-up required",
    enterHint: "Enter \u21B5",
    copyright: "\u00A9 2026 CareerAI",
    backToHome: "Back to home",
    logout: "Log out",
  },

  /* ------------------------------------------------------------------ */
  /*  Navigation                                                         */
  /* ------------------------------------------------------------------ */
  nav: {
    features: "Features",
    demo: "Demo",
    integrations: "Integrations",
    chat: "AI Career AI",
    jobs: "Jobs",
    profile: "Profile",
    settings: "Settings",
    privacy: "Privacy",
    terms: "Terms",
    contact: "Contact",
  },

  /* ------------------------------------------------------------------ */
  /*  Landing Page — Hero                                                */
  /* ------------------------------------------------------------------ */
  hero: {
    badge: "Recommendations from leading experts",
    headlinePart1: "Your AI Career Advisor,",
    headlineAccent: "one chat away.",
    description:
      "Analyze job descriptions against your CV, get personalized interview prep, and negotiate salary \u2014 all through a natural conversation with AI.",
    chatPreviewTitle: "AI Career Advisor",
    chatPreviewUserMsg: "Analyze this JD for a Senior React Developer role",
    chatPreviewAiMsg:
      "Based on the JD, here's my analysis:\n\n**Match Score: 82%**\n\nYour React/TypeScript expertise aligns well. I recommend highlighting your performance optimization projects and adding cloud experience (AWS/GCP) to strengthen your application.",
    chatPreviewPlaceholder: "Ask about CV, JD, interview...",
    chatDemos: [
      {
        userMsg: "Analyze this JD for a Senior React Developer role",
        aiMsg:
          "Based on the JD, here's my analysis:\n\n**Match Score: 82%**\n\nYour React/TypeScript expertise aligns well. I recommend highlighting your performance optimization projects and adding cloud experience (AWS/GCP) to strengthen your application.",
      },
      {
        userMsg: "I want to switch to Digital Marketing, where do I start?",
        aiMsg:
          "Based on your background, here's the roadmap I suggest:\n\n**Skills to acquire:**\n- Google Ads & Meta Ads certification\n- SEO/SEM and Content Marketing\n- Data analysis with **Google Analytics 4**\n\nThe Digital Marketing market is hiring strongly, with average salaries of **$55K-$85K/year** for mid-level positions.",
      },
      {
        userMsg: "Review my CV for a Data Analyst position",
        aiMsg:
          "After reviewing your CV, here are my observations:\n\n**Strengths:** Strong SQL and Python skills, experience with **Tableau**.\n\n**Areas to improve:**\n- Add a project portfolio with **real-world datasets**\n- Add **Power BI** skills — 72% of Data Analyst JDs require it\n- Rewrite your summary using the STAR formula to highlight achievements.",
      },
      {
        userMsg: "Prepare me for a UX/UI Designer interview",
        aiMsg:
          "Here are the most common questions for UX/UI Designers:\n\n**Design Process:**\n- Describe your design process from research to delivery?\n- How do you handle **conflicting feedback** from stakeholders?\n\n**Portfolio Review:**\n- Walk through your favorite case study\n\nTip: Prepare **3 case studies** with clear metrics (increased conversion, reduced bounce rate).",
      },
      {
        userMsg: "What's the current salary for a Financial Analyst?",
        aiMsg:
          "Based on Q1/2026 market data:\n\n**Financial Analyst Salary (USD/year):**\n- Junior (1-2 years): **$55K-$75K**\n- Mid-level (3-5 years): **$80K-$110K**\n- Senior (5+ years): **$120K-$160K**\n\n**CFA Level 1** certification can increase salary by 15-20%. Big 4 firms and international banks offer the highest packages.",
      },
      {
        userMsg: "I'm a nurse wanting to work abroad, what do I need?",
        aiMsg:
          "To work as a **Registered Nurse** abroad, you'll need:\n\n**Core Requirements:**\n- **IELTS 7.0+** (or OET Grade B)\n- Pass the **NCLEX-RN** (US) or **NMC CBT** (UK)\n- Credential verification through WES/CGFNS\n\nThe global healthcare sector faces severe staff shortages — this is a huge opportunity for qualified nurses!",
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /*  Landing Page — Features                                            */
  /* ------------------------------------------------------------------ */
  features: {
    sectionLabel: "AI Capabilities",
    heading: "Everything you need for your job search",
    description:
      "Conversational AI that understands the nuances of hiring. Ask anything, get expert-level guidance instantly.",
    jdAnalysisTitle: "JD Analysis",
    jdAnalysisDesc:
      "Paste any job description and get an instant match score against your CV with actionable improvement tips.",
    cvReviewTitle: "Smart CV Review",
    cvReviewDesc:
      "AI-powered feedback on your resume structure, keywords, and STAR-formatted bullet points.",
    interviewPrepTitle: "Interview Prep",
    interviewPrepDesc:
      "Practice with tailored technical and behavioral questions. Get real-time feedback on your answers.",
    salaryInsightsTitle: "Salary Insights",
    salaryInsightsDesc:
      "Market-rate salary benchmarks by role, experience level, and location to inform your negotiation.",
    streamingTitle: "Streaming Responses",
    streamingDesc:
      "Real-time token-by-token streaming for instant, conversational interaction \u2014 no waiting for full replies.",
    privateSecureTitle: "Private & Secure",
    privateSecureDesc:
      "Your CV and conversation data stay private. No training on your data, no third-party sharing.",
  },

  /* ------------------------------------------------------------------ */
  /*  Landing Page — Streaming Demo                                      */
  /* ------------------------------------------------------------------ */
  streamingDemo: {
    sectionLabel: "Live Demo",
    headlinePart1: "Real-time streaming,",
    headlineAccent: "zero wait.",
    description:
      "Responses stream token-by-token as the AI thinks, so you see results instantly \u2014 just like a real conversation with a career expert.",
    statFirstTokenValue: "<200ms",
    statFirstTokenLabel: "First token",
    statWpmValue: "160",
    statWpmLabel: "Words/min",
    statUptimeValue: "99.9%",
    statUptimeLabel: "Uptime",
    aiResponseLabel: "AI Response",
    streamingStatus: "streaming...",
    replayButton: "Replay",
    scrollToStart: "Scroll down to start the demo...",
    demoContent:
      "Based on your 4 years of React/TypeScript experience and the Senior Frontend Developer JD you shared, your match score is **82%**. Your strongest areas are component architecture and state management. To reach **90%+**, I recommend:\n\n1. Add **AWS/CloudFront** experience to your skills\n2. Include **performance metrics** from your recent project (e.g. 40% load time reduction)\n3. Rewrite your summary using the formula: Years + Core Skill + Industry + Top Achievement\n\nWould you like me to draft an optimized version of your Experience section?",
  },

  /* ------------------------------------------------------------------ */
  /*  Landing Page — Integrations                                        */
  /* ------------------------------------------------------------------ */
  integrations: {
    sectionLabel: "Integrations",
    heading: "Works with your stack",
    description:
      "Import your CV from popular platforms or connect your workflow tools for seamless job tracking.",
  },

  /* ------------------------------------------------------------------ */
  /*  Landing Page — CTA                                                 */
  /* ------------------------------------------------------------------ */
  cta: {
    heading: "Start your AI-powered job search",
    description:
      "No sign-up, no credit card. Just open the chat and ask your first question \u2014 your AI advisor is ready.",
  },

  /* ------------------------------------------------------------------ */
  /*  Chat Interface                                                     */
  /* ------------------------------------------------------------------ */
  chat: {
    onlineStatus: "Online \u2014 Ready to analyze your CV & JD",
    clearChat: "Clear chat",
    clearConversation: "Clear conversation",
    options: "Options",
    sendMessage: "Send message",
    attachFile: "Attach file",
    inputPlaceholder: "Type a message...",
    inputPlaceholderDesktop:
      "Ask about CV, JD, interview... (Enter to send, Shift+Enter for new line)",
    inputPlaceholderMobile: "Ask about CV, JD, interview...",
    disclaimer:
      "AI Career Advisor may make mistakes. Please verify important information.",
    newConversation: "New conversation",
    conversationHistory: "Conversation history",
    expandSidebar: "Expand sidebar",
    collapseSidebar: "Collapse sidebar",
    demoBanner: "This feature is in demo mode, expected to launch officially in March.",
    /* Menu options */
    menuCvSection: "CV Profile",
    menuLinkCv: "Link CV",
    menuCvConnected: "CV connected",
    menuGoToProfile: "Manage profiles",
    menuUnlinkCv: "Unlink CV",
    menuAiModel: "AI Model",
    modelTurbo: "Basic",
    modelTurboDesc: "Default — fast reasoning",
    modelPlus: "Plus",
    modelPlusDesc: "Balanced",
    modelPlusLocked: "Login required to unlock",
    modelMax: "Max",
    modelMaxDesc: "Coming soon",
    cvGuide: {
      title: "Upload your CV in 30 seconds",
      description:
        "Chat is where users talk to AI. CV upload is easier if they follow these 3 quick steps.",
      tipLabel: "Tip",
      dismiss: "Maybe later",
      previous: "Back",
      next: "Next",
      goToProfile: "Open Profile page",
      stepOpenTitle: "Open the CV Profile flow from chat",
      stepOpenBody:
        "From `ChatPage`, open the `Options` menu in the header, then choose `Link CV` or `Manage profiles` to jump to the upload page.",
      stepOpenTip:
        "This avoids making first-time users hunt for the upload flow inside the chat screen.",
      stepUploadTitle: "Upload the CV on the Profile page",
      stepUploadBody:
        "On the Profile page, click `Upload CV`, then choose a PDF, DOC, DOCX, TXT file, or an image of the CV. The system will parse it and create the profile automatically.",
      stepUploadTip:
        "Uploading requires login. If the user is not signed in yet, the app will prompt for authentication before saving the CV.",
      stepChatTitle: "Return to chat and ask AI with CV context",
      stepChatBody:
        "After upload, the CV is linked and a badge appears in chat. At that point the user can ask about JD analysis, job matching, CV tips, or interview prep.",
      stepChatTip:
        "If the `CV connected` badge is already visible, there is no need to upload the CV again before chatting.",
    },
  },

  /* ------------------------------------------------------------------ */
  /*  Chat Limits (Demo mode)                                            */
  /* ------------------------------------------------------------------ */
  chatLimit: {
    normalCount: "{used}/{max} messages",
    warningCount: "{remaining}/{max} messages left",
    limitReachedTitle: "Chat limit reached",
    limitReachedDesc:
      "You've used all 20 messages for this conversation. Start a new conversation to keep exploring!",
    startNewChat: "New conversation",
  },

  /* ------------------------------------------------------------------ */
  /*  Quick Suggestions                                                  */
  /* ------------------------------------------------------------------ */
  suggestions: {
    jobMatches: "Recommend matching jobs",
    analyzeJd: "Analyze JD for me",
    cvTips: "CV writing tips",
    interviewPrep: "Interview preparation",
    salaryReference: "Salary reference",
  },

  /* ------------------------------------------------------------------ */
  /*  Welcome Message                                                    */
  /* ------------------------------------------------------------------ */
  welcome: {
    content:
      "Hello! I'm **AI Career Advisor** \u2014 your smart job search assistant.\n\nI can help you with:\n- Analyzing JDs and comparing with your CV\n- Advising on writing effective CVs\n- Preparing for interviews\n- Market salary benchmarks\n\nGet started by sending me a message!",
  },

  /* ------------------------------------------------------------------ */
  /*  Pages — Jobs                                                       */
  /* ------------------------------------------------------------------ */
  jobsPage: {
    title: "Jobs",
    description:
      "AI compares your saved CV data with the saved job list to recommend the best matches.",
  },

  /* ------------------------------------------------------------------ */
  /*  Pages — Profile                                                    */
  /* ------------------------------------------------------------------ */
  profilePage: {
    title: "Profile",
    description:
      "Upload your CV for AI Advisor to analyze and compare with JDs. This feature is under development.",
  },

  /* ------------------------------------------------------------------ */
  /*  Email Verification                                                  */
  /* ------------------------------------------------------------------ */
  emailVerify: {
    verifyingTitle: "Verifying your email...",
    successTitle: "Email verified!",
    successDesc: "Your account has been verified. You now have full access to AI features!",
    errorTitle: "Verification failed",
    invalidLink: "Invalid link.",
    expiredLink: "Verification failed. The link may have expired.",
    genericError: "Something went wrong. Please try again.",
    startChat: "Start chatting",
    backHome: "Back to home",
    openChat: "Open chat",
    resendEmail: "Resend verification email",
    resendSuccess: "Verification email sent. Check your inbox!",
    resendCooldown: "Please wait before requesting again.",
    verifyBanner: "Verify your email to unlock full AI features.",
  },

  /* ------------------------------------------------------------------ */
  /*  AI Soft Messages (product-facing, no tech details)                  */
  /* ------------------------------------------------------------------ */
  aiSoft: {
    guestLimit: "You've used your free AI trial. Create an account to continue!",
    authRequired: "Sign in or create an account to use AI features!",
    unverifiedLimit: "You've reached today's AI limit. Verify your email to get more!",
    verificationRequired: "Verify your email to unlock more AI usage. Check your inbox!",
    dailyLimit: "You've reached today's AI limit. Come back tomorrow!",
    rateLimited: "You're sending messages too quickly. Please wait a moment!",
    genericError: "Sorry, AI features are temporarily unavailable. Please try again later!",
  },

  /* ------------------------------------------------------------------ */
  /*  Sidebar                                                             */
  /* ------------------------------------------------------------------ */
  sidebar: {
    emptyHistory: "No conversations yet",
    emptyHistoryHint: "Start chatting to create history",
  },

  /* ------------------------------------------------------------------ */
  /*  File Upload                                                        */
  /* ------------------------------------------------------------------ */
  fileUpload: {
    uploading: "Uploading...",
    uploadFailed: "Upload failed. Please try again.",
    fileTooLarge: "File too large. Maximum size is 5MB.",
    invalidType: "Unsupported format. Only PDF, DOC, DOCX, TXT accepted.",
    remove: "Remove file",
    fileTypes: "PDF, DOC, DOCX, TXT (max 5MB)",
    attachedFile: "Attached file",
  },

  /* ------------------------------------------------------------------ */
  /*  Waitlist                                                           */
  /* ------------------------------------------------------------------ */
  waitlist: {
    title: "Log in or create an account",
    subtitle:
      "Log in to sync your data into the database and unlock the 50k quota on this device. If you do not have an account yet, you can create one in this modal.",
    loginTab: "Log in",
    registerTab: "Create account",
    nameLabel: "Display name",
    namePlaceholder: "John Doe",
    emailLabel: "Email",
    emailPlaceholder: "email@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "At least 8 characters",
    confirmPasswordLabel: "Confirm password",
    confirmPasswordPlaceholder: "Re-enter password",
    showPassword: "Show",
    hidePassword: "Hide",
    submitLogin: "Log in",
    submitRegister: "Create account",
    submittingLogin: "Logging in...",
    submittingRegister: "Creating account...",
    successLogin: "Logged in successfully.",
    successRegister: "Account created. Logging you in...",
    error: "Something went wrong. Please try again.",
    errorEmailInUse: "That email is already in use. Switch to log in.",
    errorInvalidCredentials: "Email or password is incorrect.",
    errorNameRequired: "Please enter a display name.",
    errorPasswordMismatch: "Passwords do not match.",
    errorPasswordTooShort: "Password must be at least 8 characters long.",
    errorDomainNotAllowed: "Please use a supported email provider.",
    registerPendingTitle: "Check your email",
    registerPendingMessage: "We've sent a verification email to {email}. Please click the link to activate your account.",
    registerPendingHint: "Didn't receive it? Check your spam folder or resend below.",
    resendVerification: "Resend verification email",
    resendVerificationSent: "Sent! Please check your inbox.",
    resendVerificationCooldown: "Please wait before resending.",
    loginEmailNotVerified: "Your account hasn't been activated yet. Please check your email to verify.",
    alreadyVerified: "Email already verified. You can login now.",
    close: "Close",
    toggleToLogin: "Already have an account? Log in",
    toggleToRegister: "No account yet? Create one",
    captchaLabel: "Anti-spam verification",
    captchaHint: "Complete Google reCAPTCHA before submitting this form.",
    captchaLoading: "Loading Google reCAPTCHA...",
    captchaError: "Unable to load captcha. Please try again.",
    captchaRequired: "Please complete the captcha to continue.",
    captchaUnavailable: "Captcha is not configured on this system.",
    securityHint: "Passwords are hashed and stored securely in the database.",
  },

  /* ------------------------------------------------------------------ */
  /*  Search                                                              */
  /* ------------------------------------------------------------------ */
  search: {
    placeholder: "Search jobs, skills, roles...",
    placeholderShort: "Search...",
    searching: "Searching...",
    loadingTips: [
      "💡 Add specific skills to your search for more accurate results",
      "📝 Optimize your CV with JD keywords — boosts ATS pass rate by 40%",
      "🎯 80% of jobs are never posted publicly — networking matters",
      "📊 Vietnam IT market 2026: hiring demand up 25% YoY",
      "🤖 AI/ML skills command a 20-30% salary premium at the same level",
      "💰 Don't forget to ask about the benefits package — it can be 20-40% of total comp",
    ],
    loadingTipLabel: "Did you know?",
  },

  /* ------------------------------------------------------------------ */
  /*  Locale config                                                      */
  /* ------------------------------------------------------------------ */
  locale: {
    code: "en-US",
    timeFormat: "en-US",
  },

  /* ------------------------------------------------------------------ */
  /*  Legal / Privacy / Consent                                          */
  /* ------------------------------------------------------------------ */
  legal: {
    uploadModalTitle: "Upload CV",
    uploadModalDesc: "Drag and drop your CV into the area below or use the upload buttons to continue.",
    uploadPdf: "PDF / Docx",
    uploadImage: "Image",
    parseQuotaTitle: "CV parse limit on this device",
    parseQuotaSubtitle: "Each device gets 1 guest parse and 1 more after signing in.",
    parseQuotaGuestAvailable: "Guest has 1 parse left",
    parseQuotaGuestUsed: "Guest parse is used up",
    parseQuotaLoginAvailable: "Signed-in account has 1 parse left",
    parseQuotaLoginUsed: "Signed-in account parse is used up",
    parseQuotaLoginHint: "Log in to unlock one extra CV parse on this device.",
    parseQuotaAccountHint: "You have used the signed-in account parse. Sign out to use the remaining guest parse.",
    parseQuotaLocked: "You have used both CV parse requests on this device.",
    parseQuotaSigninCta: "Log in to continue",
    parseQuotaSignupCta: "Sign up",
    parseQuotaSignupSuffix: "to get 1 more parse",
    parseQuotaCurrentGuest: "You still have 1 CV parse in guest mode.",
    parseQuotaCurrentLogin: "You still have 1 CV parse for the signed-in account.",
    parseQuotaUnlimited: "This account has unlimited CV parse quota.",
    parseQuotaUnlimitedBadge: "Unlimited",
    consentNote: "By clicking upload, you agree to our",
    consentPrivacy: "Privacy Policy",
    consentAnd: "and",
    consentTerms: "Terms of Service",
    consentOfOurs: ".",
    mustAccept: "Please accept the privacy policy to continue",
    policyLoading: "Loading policy...",
    policyError: "Unable to load policy content. Please try again.",
    privacyTitle: "Privacy Policy",
    termsTitle: "Terms of Service",
    effectiveDate: "Effective from",
    backToHome: "Back to home",
    lastUpdated: "Last updated",
    version: "Version",
    noContent: "Content is being updated...",
  },
  admin: {
    login: {
      badge: "Admin area",
      title: "Admin / owner control panel",
      subtitle: "Sign in to manage accounts, sessions, legal documents, and platform health.",
      formBadge: "Admin Login",
      formTitle: "Sign in to /admin",
      formDescription: "Only `admin` and `owner` accounts can enter this area.",
      email: "Email",
      password: "Password",
      submit: "Admin sign in",
      submitting: "Signing in...",
      goToChat: "Back to app",
      error: "Unable to sign in. Please verify your credentials.",
      validation: "Please enter both email and password.",
      highlights: {
        rolesTitle: "Role matrix",
        rolesBody: "`tester`, `admin`, and `owner` get unlimited quota. `owner` is unique and protected.",
        scopeTitle: "Admin scope",
        scopeBody: "This MVP covers account management, security logs, legal documents, user consents, jobs import, and system health.",
        scopeFootnote: "Critical mutations are enforced on the server.",
      },
    },
    forbidden: {
      badge: "403",
      title: "You cannot access /admin",
      description: "The current account does not have a role that can enter the admin area.",
      currentRole: "Current role",
      backToApp: "Back to app",
      signOut: "Sign out",
    },
    header: {
      badge: "Admin Console",
      title: "Operations, security, and governance",
      description: "A single /admin surface for account control, security monitoring, legal content, consent visibility, and system checks.",
      operator: "Operator",
      canManageAdmins: "Can manage admins",
      sessionScope: "Session scope",
    },
    nav: {
      overview: "Overview",
      accounts: "Accounts",
      security: "Security",
      content: "Content",
      system: "System",
    },
    roles: {
      user: "User",
      tester: "Tester",
      admin: "Admin",
      owner: "Owner",
    },
    status: {
      active: "Active",
      disabled: "Disabled",
      inactive: "Inactive",
      revoked: "Revoked",
      ready: "Ready",
      issuesFound: "Issues found",
      ok: "OK",
      issue: "Issue",
      unlimited: "Unlimited",
      yes: "Yes",
      no: "No",
    },
    filters: {
      allRoles: "All roles",
      allStatuses: "All statuses",
      allResults: "All results",
      allSessions: "All sessions",
      allConsentTypes: "All consent types",
      allImportStates: "All import states",
    },
    labels: {
      version: "Version",
      effectiveDate: "Effective date",
    },
    actions: {
      refresh: "Refresh",
      backToApp: "Back to app",
      signOut: "Sign out",
      manage: "Manage",
      view: "View",
      revoke: "Revoke",
      revokeSessions: "Revoke all sessions",
      revoking: "Revoking...",
      saveChanges: "Save changes",
      saving: "Saving...",
      close: "Close",
      edit: "Edit",
      activate: "Activate",
      createDocument: "Create document",
      updateDocument: "Update document",
      reset: "Reset form",
    },
    overview: {
      alertsTitle: "Recent alerts",
      alertsDescription: "Signals that require operator attention.",
      noAlerts: "No new alerts.",
      systemTitle: "System health snapshot",
      systemDescription: "A compact view of the most important checks.",
      systemStatusHint: "Use this as the quick readiness signal before drilling into System.",
      activeLegalDocuments: "Active legal documents",
      activeLegalDocumentsDescription: "Versions currently exposed on the public legal pages.",
      metrics: {
        totalAccounts: "Total accounts",
        activeSessions: "Active sessions",
        failedLogins: "Failed logins (24h)",
        disabledAccounts: "Disabled accounts",
        activeLegalDocs: "Active legal docs",
        latestImport: "Latest jobs import",
        activeSessionsHint: "Sessions that are not revoked and not expired.",
        failedLoginsHint: "Useful for spotting brute-force or credential issues.",
        disabledAccountsHint: "Includes disabled user/tester/admin accounts.",
        activeLegalDocsHint: "Each legal doc type should have one active version.",
        latestImportHint: "Freshness signal for jobs_import.",
      },
    },
    accounts: {
      title: "Account management",
      description: "Search, filter, and change role / status for user, tester, and admin accounts.",
      searchPlaceholder: "Search by email or display name...",
      drawerTitle: "Account details",
      drawerDescription: "Inspect recent sessions and update the selected account.",
      accountSummary: "Account summary",
      accessControl: "Access control",
      recentSessions: "Recent sessions",
      ownerLocked: "Owner lock",
      ownerProtected: "The owner account is protected. Role, status, and revoke actions are blocked in the admin UI.",
      insufficientPermissions: "The current operator role cannot modify this account.",
      filters: {
        role: "Role filter",
        status: "Status filter",
      },
    },
    security: {
      title: "Security monitoring",
      description: "Review sessions, auth logs, and audit logs from one screen.",
      sessionsTitle: "Active / revoked sessions",
      authLogsTitle: "Auth logs",
      auditLogsTitle: "Audit logs",
      filters: {
        userId: "Filter by user id",
        sessions: "Sessions",
        activeOnly: "Active only",
        revokedOnly: "Revoked only",
        results: "Auth result",
        successOnly: "Success",
        failureOnly: "Failure",
        auditAction: "Action",
        auditTable: "Table",
      },
    },
    content: {
      legalTitle: "Legal documents",
      legalDescription: "CRUD for Privacy Policy and Terms of Service, plus version activation.",
      createDocument: "Create legal document",
      editDocument: "Edit legal document",
      formDescription: "The vi/en markdown content is used by the public legal pages.",
      validation: "Please complete every required legal document field.",
      consentsTitle: "User consents (read-only)",
      consentsDescription: "Inspect consent records collected from users.",
      jobsTitle: "Jobs import monitor",
      jobsDescription: "Track freshness and errors in jobs_import.",
      docTypes: {
        privacyPolicy: "Privacy Policy",
        termsOfService: "Terms of Service",
      },
      fields: {
        docType: "Document type",
        version: "Version",
        effectiveDate: "Effective date",
        titleVi: "Vietnamese title",
        titleEn: "English title",
        contentVi: "Vietnamese content",
        contentEn: "English content",
      },
      filters: {
        identifier: "Search by identifier",
        consentType: "Consent type",
        jobsSearch: "Search jobs by title, company, or url...",
        jobsErrors: "Import error state",
        hasErrors: "Has errors",
        noErrors: "No errors",
      },
    },
    system: {
      title: "System diagnostics",
      description: "Checks for AI providers, database readiness, and key operating tables.",
      summary: "Use this tab to validate backend readiness before operator actions.",
    },
    tables: {
      email: "Email",
      name: "Name",
      role: "Role",
      status: "Status",
      lastLogin: "Last login",
      loginCount: "Login count",
      failedLogins: "Failed logins",
      sessions: "Sessions",
      actions: "Actions",
      scopeKey: "Scope key",
      createdAt: "Created at",
      expiresAt: "Expires at",
      result: "Result",
      timestamp: "Timestamp",
      ipAddress: "IP",
      action: "Action",
      tableName: "Table",
      docType: "Doc type",
      version: "Version",
      effectiveDate: "Effective date",
      identifier: "Identifier",
      accepted: "Accepted",
      jobTitle: "Job title",
      company: "Company",
      location: "Location",
    },
    messages: {
      loading: "Loading data...",
      loadFailed: "Unable to load admin data.",
      saveFailed: "Unable to save changes.",
      noData: "No data available yet.",
      noResults: "No matching results.",
      authExpired: "Your admin session has expired. Please sign in again.",
      userUpdated: "Account updated.",
      sessionsRevoked: "All sessions for this account were revoked.",
      sessionRevoked: "Session revoked.",
      documentCreated: "Legal document created.",
      documentUpdated: "Legal document updated.",
      documentActivated: "Document version activated.",
      confirmRevokeAllSessions: "Revoke all sessions for this account?",
      confirmRevokeSession: "Revoke this session?",
      confirmActivateDocument: "Activate this document version?",
    },
  },
};