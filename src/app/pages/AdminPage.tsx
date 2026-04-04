import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Activity,
  AlertTriangle,
  Database,
  FileCheck,
  FileText,
  Loader2,
  Lock,
  LogOut,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShieldUser,
  Users,
} from "lucide-react";
import { useI18n } from "../lib/i18n";
import { useIsDesktop } from "../hooks/useMediaQuery";
import {
  buildSessionHeaders,
  clearAuthenticatedSession,
  persistAuthenticatedSession,
  useSessionIdentity,
} from "../lib/sessionScope";
import {
  canManageRole,
  getAssignableRoles,
  normalizeAppRole,
  type AppRole,
} from "../lib/authRoles";
import { projectId, publicAnonKey } from "/utils/supabase/info";

const AUTH_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-4ab11b6d/auth`;
const FUNCTION_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-4ab11b6d`;
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../components/ui/drawer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Textarea } from "../components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

type AdminTab = "overview" | "accounts" | "security" | "content" | "system";
type BooleanFilter = "all" | "true" | "false";
type StatusFilter = "all" | "active" | "disabled";
type RoleFilter = "all" | AppRole;
type AsyncState<T> = { data: T | null; isLoading: boolean; error: string | null };
type RequestError = Error & { status?: number; code?: string };
type SelectedUserDetail = {
  user: AdminUser;
  sessions: AdminSession[];
  recentAuthLogs: AdminAuthLog[];
};
type ConfirmAction =
  | { kind: "revoke-all-sessions" }
  | { kind: "revoke-session"; sessionId: string }
  | { kind: "activate-document"; document: AdminLegalDocument };

interface AdminMeResponse {
  user: {
    id: string;
    userId: string;
    email: string;
    displayName: string | null;
    scopeKey: string;
    role: AppRole;
    status: "active" | "disabled";
  };
  permissions: {
    canManageAdmins: boolean;
    canAssignRoles: AppRole[];
  };
}

interface AdminUser {
  id: string;
  userId: string;
  email: string;
  displayName: string | null;
  scopeKey: string;
  role: AppRole;
  status: "active" | "disabled";
  loginCount: number;
  failedLoginCount: number;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  lastLoginUserAgent: string | null;
  sessionCount: number;
  canAccessAdmin: boolean;
  hasUnlimitedQuota: boolean;
}

interface AdminSession {
  id: string;
  user_id: string;
  scope_key: string;
  created_at: string;
  last_seen_at: string | null;
  expires_at: string;
  revoked_at: string | null;
  ip_address: string | null;
  user_agent: string | null;
  user: {
    userId: string;
    email: string;
    displayName: string | null;
    role: AppRole;
    status: "active" | "disabled";
  } | null;
  canRevoke?: boolean;
}

interface AdminAuthLog {
  id: string;
  user_id: string | null;
  scope_key: string | null;
  success: boolean;
  ip_address: string | null;
  user_agent: string | null;
  attempted_at: string;
  user?: {
    userId: string;
    email: string;
    displayName: string | null;
    role: AppRole;
  } | null;
}

interface AdminAuditLog {
  id: string;
  user_id: string | null;
  scope_key: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  old_value: unknown;
  new_value: unknown;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user?: {
    userId: string;
    email: string;
    displayName: string | null;
    role: AppRole;
  } | null;
}

interface AdminLegalDocument {
  id: string;
  doc_type: string;
  version: string;
  title_vi: string;
  title_en: string;
  content_vi: string;
  content_en: string;
  effective_date: string;
  is_active: boolean;
  created_at: string;
}

interface AdminUserConsent {
  id: string;
  identifier: string;
  identifier_type: string | null;
  consent_type: string;
  accepted: boolean;
  accepted_at: string | null;
  ip_address: string | null;
  user_agent: string | null;
  doc_version: string | null;
  created_at: string;
}

interface AdminJobsImport {
  url: string | null;
  job_title: string | null;
  company_name: string | null;
  job_location: string | null;
  error: string | null;
  warning: string | null;
  timestamp: string;
  apply_link: string | null;
}

interface SystemHealth {
  status: string;
  checks: Record<string, { ok: boolean; detail: string }>;
}

const FONT = "'Inter', sans-serif";

function createAsyncState<T>(data: T | null = null): AsyncState<T> {
  return { data, isLoading: false, error: null };
}

function createRequestError(message: string, status?: number, code?: string): RequestError {
  const error = new Error(message) as RequestError;
  error.status = status;
  error.code = code;
  return error;
}

function getLocaleTag(locale: "vi" | "en") {
  return locale === "vi" ? "vi-VN" : "en-US";
}

function formatDateTime(value: string | null | undefined, locale: "vi" | "en") {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(getLocaleTag(locale), {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateOnly(value: string | null | undefined, locale: "vi" | "en") {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(getLocaleTag(locale), {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function buildSearchParams(values: Record<string, string | null | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value == null || value === "" || value === "all") continue;
    params.set(key, value);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

function roleBadgeVariant(role: AppRole) {
  if (role === "owner") return "secondary" as const;
  if (role === "admin") return "default" as const;
  return "outline" as const;
}

function statusBadgeVariant(status: string) {
  return status === "disabled" ? "destructive" as const : "secondary" as const;
}

function alertToneClass(level: "info" | "warning" | "critical") {
  if (level === "critical") return "border-destructive/40 bg-destructive/10 text-destructive";
  if (level === "warning") return "border-amber-500/30 bg-amber-500/10 text-amber-700";
  return "border-border bg-muted/70 text-foreground";
}

function MetricCard({
  title,
  value,
  detail,
  icon,
}: {
  title: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="border-border/70 bg-background/90 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <CardDescription style={{ fontFamily: FONT }}>{title}</CardDescription>
            <CardTitle className="text-2xl" style={{ fontFamily: FONT, fontWeight: 700 }}>
              {value}
            </CardTitle>
          </div>
          <div className="rounded-2xl border border-border bg-muted/60 p-3 text-secondary">{icon}</div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground" style={{ fontFamily: FONT }}>{detail}</p>
      </CardContent>
    </Card>
  );
}

function SectionEmpty({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

export function AdminPage() {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { t, locale } = useI18n();
  const identity = useSessionIdentity();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [adminMe, setAdminMe] = useState<AdminMeResponse | null>(null);
  const [authProbe, setAuthProbe] = useState({
    isLoading: false,
    isForbidden: false,
    error: null as string | null,
  });
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  const [summaryState, setSummaryState] = useState(createAsyncState<{
    summary: {
      totalAccounts: number;
      roleCounts: Record<AppRole, number>;
      disabledUsers: number;
      activeSessions: number;
      failedLogins24h: number;
      activeLegalDocuments: number;
      latestJobsImportAt: string | null;
    };
    activeLegalDocuments: AdminLegalDocument[];
    alerts: Array<{ level: "info" | "warning" | "critical"; message: string }>;
    systemHealth: SystemHealth;
  }>());
  const [usersState, setUsersState] = useState(createAsyncState<{
    items: AdminUser[];
    total: number;
  }>());
  const [securityState, setSecurityState] = useState(createAsyncState<{
    sessions: AdminSession[];
    authLogs: AdminAuthLog[];
    auditLogs: AdminAuditLog[];
  }>());
  const [contentState, setContentState] = useState(createAsyncState<{
    legalDocuments: AdminLegalDocument[];
    consents: AdminUserConsent[];
    jobsImport: AdminJobsImport[];
  }>());
  const [systemState, setSystemState] = useState(createAsyncState<SystemHealth>());
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserState, setSelectedUserState] = useState(createAsyncState<SelectedUserDetail>());
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [isConfirmingAction, setIsConfirmingAction] = useState(false);
  const [draftRole, setDraftRole] = useState<AppRole>("user");
  const [draftStatus, setDraftStatus] = useState<"active" | "disabled">("active");
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [isRevokingAllSessions, setIsRevokingAllSessions] = useState(false);
  const [isSubmittingDocument, setIsSubmittingDocument] = useState(false);
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null);
  const [documentForm, setDocumentForm] = useState({
    docType: "privacy_policy",
    version: "",
    effectiveDate: new Date().toISOString().slice(0, 10),
    titleVi: "",
    titleEn: "",
    contentVi: "",
    contentEn: "",
  });
  const [accountFilters, setAccountFilters] = useState({
    search: "",
    role: "all" as RoleFilter,
    status: "all" as StatusFilter,
  });
  const [securityFilters, setSecurityFilters] = useState({
    userId: "",
    activeOnly: "true" as BooleanFilter,
    success: "all" as BooleanFilter,
    auditAction: "",
    auditTable: "",
  });
  const [contentFilters, setContentFilters] = useState({
    consentIdentifier: "",
    consentType: "all",
    jobsSearch: "",
    jobsHasErrors: "all" as BooleanFilter,
  });

  const roleLabels = useMemo(
    () => ({
      user: t.admin.roles.user,
      tester: t.admin.roles.tester,
      admin: t.admin.roles.admin,
      owner: t.admin.roles.owner,
    }),
    [t],
  );
  const statusLabels = useMemo(
    () => ({
      active: t.admin.status.active,
      disabled: t.admin.status.disabled,
    }),
    [t],
  );
  const docTypeLabels = useMemo(
    () => ({
      privacy_policy: t.admin.content.docTypes.privacyPolicy,
      terms_of_service: t.admin.content.docTypes.termsOfService,
    }),
    [t],
  );

  const fetchAdmin = useCallback(
    async <T,>(path: string, init?: RequestInit): Promise<T> => {
      const response = await fetch(`${FUNCTION_BASE}${path}`, {
        ...init,
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          ...buildSessionHeaders(identity),
          ...(init?.body ? { "Content-Type": "application/json" } : {}),
          ...(init?.headers ?? {}),
        },
      });

      const payload = await response.json().catch(() => ({}));

      if (response.status === 401) {
        clearAuthenticatedSession();
        throw createRequestError(
          typeof payload?.error === "string" ? payload.error : t.admin.messages.authExpired,
          401,
          "AUTH_REQUIRED",
        );
      }

      if (!response.ok) {
        throw createRequestError(
          typeof payload?.error === "string" ? payload.error : `HTTP ${response.status}`,
          response.status,
        );
      }

      return payload as T;
    },
    [identity, t.admin.messages.authExpired],
  );

  const actorRole = normalizeAppRole(adminMe?.user.role) ?? identity.role;
  const canManageAdmins = adminMe?.permissions.canManageAdmins ?? actorRole === "owner";
  const topNotice = notice ?? (authProbe.error ? { tone: "error" as const, message: authProbe.error } : null);

  const resetDocumentForm = useCallback((document?: AdminLegalDocument | null) => {
    setEditingDocumentId(document?.id ?? null);
    setDocumentForm({
      docType: document?.doc_type === "terms_of_service" ? "terms_of_service" : "privacy_policy",
      version: document?.version ?? "",
      effectiveDate: document?.effective_date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      titleVi: document?.title_vi ?? "",
      titleEn: document?.title_en ?? "",
      contentVi: document?.content_vi ?? "",
      contentEn: document?.content_en ?? "",
    });
  }, []);

  const loadSummary = useCallback(async () => {
    setSummaryState((current) => ({ ...current, isLoading: true, error: null }));
    try {
      const data = await fetchAdmin<{
        summary: {
          totalAccounts: number;
          roleCounts: Record<AppRole, number>;
          disabledUsers: number;
          activeSessions: number;
          failedLogins24h: number;
          activeLegalDocuments: number;
          latestJobsImportAt: string | null;
        };
        activeLegalDocuments: AdminLegalDocument[];
        alerts: Array<{ level: "info" | "warning" | "critical"; message: string }>;
        systemHealth: SystemHealth;
      }>("/admin/summary");
      setSummaryState({ data, isLoading: false, error: null });
    } catch (error) {
      setSummaryState({
        data: null,
        isLoading: false,
        error: error instanceof Error ? error.message : t.admin.messages.loadFailed,
      });
    }
  }, [fetchAdmin, t.admin.messages.loadFailed]);

  const loadUsers = useCallback(async () => {
    setUsersState((current) => ({ ...current, isLoading: true, error: null }));
    try {
      const query = buildSearchParams({
        search: accountFilters.search.trim() || null,
        role: accountFilters.role,
        status: accountFilters.status,
        limit: "50",
        offset: "0",
      });
      const data = await fetchAdmin<{ items: AdminUser[]; total: number }>(`/admin/users${query}`);
      setUsersState({ data, isLoading: false, error: null });
    } catch (error) {
      setUsersState({
        data: null,
        isLoading: false,
        error: error instanceof Error ? error.message : t.admin.messages.loadFailed,
      });
    }
  }, [accountFilters.role, accountFilters.search, accountFilters.status, fetchAdmin, t.admin.messages.loadFailed]);

  const loadSecurity = useCallback(async () => {
    setSecurityState((current) => ({ ...current, isLoading: true, error: null }));
    try {
      const userId = securityFilters.userId.trim() || null;
      const [sessions, authLogs, auditLogs] = await Promise.all([
        fetchAdmin<{ items: AdminSession[] }>(`/admin/sessions${buildSearchParams({ userId, activeOnly: securityFilters.activeOnly, limit: "50", offset: "0" })}`),
        fetchAdmin<{ items: AdminAuthLog[] }>(`/admin/auth-logs${buildSearchParams({ userId, success: securityFilters.success, limit: "50", offset: "0" })}`),
        fetchAdmin<{ items: AdminAuditLog[] }>(`/admin/audit-logs${buildSearchParams({ userId, action: securityFilters.auditAction.trim() || null, tableName: securityFilters.auditTable.trim() || null, limit: "50", offset: "0" })}`),
      ]);
      setSecurityState({
        data: { sessions: sessions.items, authLogs: authLogs.items, auditLogs: auditLogs.items },
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setSecurityState({
        data: null,
        isLoading: false,
        error: error instanceof Error ? error.message : t.admin.messages.loadFailed,
      });
    }
  }, [fetchAdmin, securityFilters.activeOnly, securityFilters.auditAction, securityFilters.auditTable, securityFilters.success, securityFilters.userId, t.admin.messages.loadFailed]);

  const loadContent = useCallback(async () => {
    setContentState((current) => ({ ...current, isLoading: true, error: null }));
    try {
      const [legalDocuments, consents, jobsImport] = await Promise.all([
        fetchAdmin<{ items: AdminLegalDocument[] }>("/admin/legal-documents"),
        fetchAdmin<{ items: AdminUserConsent[] }>(`/admin/user-consents${buildSearchParams({ identifier: contentFilters.consentIdentifier.trim() || null, consentType: contentFilters.consentType, limit: "50", offset: "0" })}`),
        fetchAdmin<{ items: AdminJobsImport[] }>(`/admin/jobs-import${buildSearchParams({ search: contentFilters.jobsSearch.trim() || null, hasErrors: contentFilters.jobsHasErrors, limit: "50", offset: "0" })}`),
      ]);
      setContentState({
        data: {
          legalDocuments: legalDocuments.items,
          consents: consents.items,
          jobsImport: jobsImport.items,
        },
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setContentState({
        data: null,
        isLoading: false,
        error: error instanceof Error ? error.message : t.admin.messages.loadFailed,
      });
    }
  }, [contentFilters.consentIdentifier, contentFilters.consentType, contentFilters.jobsHasErrors, contentFilters.jobsSearch, fetchAdmin, t.admin.messages.loadFailed]);

  const loadSystem = useCallback(async () => {
    setSystemState((current) => ({ ...current, isLoading: true, error: null }));
    try {
      const data = await fetchAdmin<SystemHealth>("/admin/system-health");
      setSystemState({ data, isLoading: false, error: null });
    } catch (error) {
      setSystemState({
        data: null,
        isLoading: false,
        error: error instanceof Error ? error.message : t.admin.messages.loadFailed,
      });
    }
  }, [fetchAdmin, t.admin.messages.loadFailed]);

  const loadUserDetail = useCallback(async (userId: string) => {
    setSelectedUserId(userId);
    setSelectedUserState((current) => ({ ...current, isLoading: true, error: null }));
    try {
      const data = await fetchAdmin<SelectedUserDetail>(`/admin/users/${userId}`);
      setSelectedUserState({ data, isLoading: false, error: null });
    } catch (error) {
      setSelectedUserState({
        data: null,
        isLoading: false,
        error: error instanceof Error ? error.message : t.admin.messages.loadFailed,
      });
    }
  }, [fetchAdmin, t.admin.messages.loadFailed]);

  const closeUserDetail = useCallback(() => {
    setSelectedUserId(null);
    setSelectedUserState(createAsyncState<SelectedUserDetail>());
  }, []);

  const refreshActiveTab = useCallback(async () => {
    setNotice(null);
    await loadSummary();
    if (activeTab === "accounts") await loadUsers();
    if (activeTab === "security") await loadSecurity();
    if (activeTab === "content") await loadContent();
    if (activeTab === "system") await loadSystem();
  }, [activeTab, loadContent, loadSecurity, loadSummary, loadSystem, loadUsers]);

  useEffect(() => {
    if (!identity.isAuthenticated) {
      setAdminMe(null);
      setAuthProbe({ isLoading: false, isForbidden: false, error: null });
      return;
    }

    let cancelled = false;
    setAuthProbe({ isLoading: true, isForbidden: false, error: null });

    void fetchAdmin<AdminMeResponse>("/admin/me")
      .then((data) => {
        if (cancelled) return;
        setAdminMe(data);
        setAuthProbe({ isLoading: false, isForbidden: false, error: null });
      })
      .catch((error) => {
        if (cancelled) return;
        if ((error as RequestError)?.status === 403) {
          setAdminMe(null);
          setAuthProbe({ isLoading: false, isForbidden: true, error: null });
          return;
        }
        if ((error as RequestError)?.status === 401) {
          setAdminMe(null);
          setAuthProbe({ isLoading: false, isForbidden: false, error: null });
          return;
        }
        setAdminMe(null);
        setAuthProbe({
          isLoading: false,
          isForbidden: false,
          error: error instanceof Error ? error.message : t.admin.messages.loadFailed,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [fetchAdmin, identity.isAuthenticated, identity.userId, t.admin.messages.loadFailed]);

  useEffect(() => {
    if (!adminMe) return;
    void loadSummary();
  }, [adminMe, loadSummary]);

  useEffect(() => {
    if (!adminMe) return;
    if (activeTab === "accounts") void loadUsers();
    if (activeTab === "security") void loadSecurity();
    if (activeTab === "content") void loadContent();
    if (activeTab === "system") void loadSystem();
  }, [activeTab, adminMe, loadContent, loadSecurity, loadSystem, loadUsers]);

  useEffect(() => {
    const detailUser = selectedUserState.data?.user;
    if (!detailUser) return;
    setDraftRole(detailUser.role);
    setDraftStatus(detailUser.status);
  }, [selectedUserState.data]);

  const handleLogout = useCallback(() => {
    clearAuthenticatedSession();
    setAdminMe(null);
    setNotice(null);
    navigate("/admin", { replace: true });
  }, [navigate]);

  const handleLogin = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginError(null);
    const email = loginEmail.trim().toLowerCase();
    const password = loginPassword.trim();
    if (!email || !password) {
      setLoginError(t.admin.login.validation);
      return;
    }

    setIsLoggingIn(true);
    try {
      const response = await fetch(`${AUTH_BASE}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
          ...buildSessionHeaders(identity),
        },
        body: JSON.stringify({ email, password }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setLoginError(typeof payload?.error === "string" ? payload.error : t.admin.login.error);
        return;
      }

      const userId = payload?.user?.userId || payload?.user?.id;
      const sessionToken = payload?.sessionToken || payload?.session_token;
      if (!userId || !sessionToken) {
        throw new Error(t.admin.login.error);
      }

      persistAuthenticatedSession({
        userId,
        sessionToken,
        role: payload?.user?.role,
        status: payload?.user?.status,
      });
      setLoginPassword("");
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : t.admin.login.error);
    } finally {
      setIsLoggingIn(false);
    }
  }, [identity, loginEmail, loginPassword, t.admin.login.error, t.admin.login.validation]);

  const handleSaveUser = useCallback(async () => {
    const selectedUser = selectedUserState.data?.user;
    if (!selectedUser) return;
    setIsSavingUser(true);
    setNotice(null);
    try {
      await fetchAdmin(`/admin/users/${selectedUser.userId}`, {
        method: "PUT",
        body: JSON.stringify({ role: draftRole, status: draftStatus }),
      });
      setNotice({ tone: "success", message: t.admin.messages.userUpdated });
      await Promise.all([loadUserDetail(selectedUser.userId), loadUsers(), loadSummary()]);
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : t.admin.messages.saveFailed });
    } finally {
      setIsSavingUser(false);
    }
  }, [draftRole, draftStatus, fetchAdmin, loadSummary, loadUserDetail, loadUsers, selectedUserState.data, t.admin.messages.saveFailed, t.admin.messages.userUpdated]);

  const executeRevokeAllSessions = useCallback(async () => {
    const selectedUser = selectedUserState.data?.user;
    if (!selectedUser) return;
    setIsRevokingAllSessions(true);
    setNotice(null);
    try {
      await fetchAdmin(`/admin/users/${selectedUser.userId}/revoke-sessions`, { method: "POST" });
      setNotice({ tone: "success", message: t.admin.messages.sessionsRevoked });
      await Promise.all([loadUserDetail(selectedUser.userId), loadUsers(), loadSummary(), activeTab === "security" ? loadSecurity() : Promise.resolve()]);
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : t.admin.messages.saveFailed });
    } finally {
      setIsRevokingAllSessions(false);
    }
  }, [activeTab, fetchAdmin, loadSecurity, loadSummary, loadUserDetail, loadUsers, selectedUserState.data, t.admin.messages.saveFailed, t.admin.messages.sessionsRevoked]);

  const executeRevokeSession = useCallback(async (sessionId: string) => {
    setNotice(null);
    try {
      await fetchAdmin(`/admin/sessions/${sessionId}/revoke`, { method: "POST" });
      setNotice({ tone: "success", message: t.admin.messages.sessionRevoked });
      await Promise.all([loadSummary(), loadSecurity(), selectedUserId ? loadUserDetail(selectedUserId) : Promise.resolve()]);
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : t.admin.messages.saveFailed });
    }
  }, [fetchAdmin, loadSecurity, loadSummary, loadUserDetail, selectedUserId, t.admin.messages.saveFailed, t.admin.messages.sessionRevoked]);

  const handleSubmitDocument = useCallback(async () => {
    const payload = {
      docType: documentForm.docType,
      version: documentForm.version.trim(),
      titleVi: documentForm.titleVi.trim(),
      titleEn: documentForm.titleEn.trim(),
      contentVi: documentForm.contentVi.trim(),
      contentEn: documentForm.contentEn.trim(),
      effectiveDate: documentForm.effectiveDate,
    };

    if (!payload.version || !payload.titleVi || !payload.titleEn || !payload.contentVi || !payload.contentEn || !payload.effectiveDate) {
      setNotice({ tone: "error", message: t.admin.content.validation });
      return;
    }

    setIsSubmittingDocument(true);
    setNotice(null);
    try {
      if (editingDocumentId) {
        await fetchAdmin(`/admin/legal-documents/${editingDocumentId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await fetchAdmin("/admin/legal-documents", {
          method: "POST",
          body: JSON.stringify({ ...payload, isActive: false }),
        });
      }

      setNotice({
        tone: "success",
        message: editingDocumentId ? t.admin.messages.documentUpdated : t.admin.messages.documentCreated,
      });
      resetDocumentForm(null);
      await Promise.all([loadContent(), loadSummary()]);
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : t.admin.messages.saveFailed });
    } finally {
      setIsSubmittingDocument(false);
    }
  }, [documentForm, editingDocumentId, fetchAdmin, loadContent, loadSummary, resetDocumentForm, t.admin.content.validation, t.admin.messages.documentCreated, t.admin.messages.documentUpdated, t.admin.messages.saveFailed]);

  const executeActivateDocument = useCallback(async (document: AdminLegalDocument) => {
    setNotice(null);
    try {
      await fetchAdmin(`/admin/legal-documents/${document.id}/activate`, { method: "POST" });
      setNotice({ tone: "success", message: t.admin.messages.documentActivated });
      await Promise.all([loadContent(), loadSummary()]);
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : t.admin.messages.saveFailed });
    }
  }, [fetchAdmin, loadContent, loadSummary, t.admin.messages.documentActivated, t.admin.messages.saveFailed]);

  const requestRevokeAllSessions = useCallback(() => {
    if (!selectedUserState.data?.user) return;
    setConfirmAction({ kind: "revoke-all-sessions" });
  }, [selectedUserState.data]);

  const requestRevokeSession = useCallback((sessionId: string) => {
    setConfirmAction({ kind: "revoke-session", sessionId });
  }, []);

  const requestActivateDocument = useCallback((document: AdminLegalDocument) => {
    setConfirmAction({ kind: "activate-document", document });
  }, []);

  const handleConfirmAction = useCallback(async () => {
    if (!confirmAction) return;

    setIsConfirmingAction(true);
    try {
      if (confirmAction.kind === "revoke-all-sessions") {
        await executeRevokeAllSessions();
      } else if (confirmAction.kind === "revoke-session") {
        await executeRevokeSession(confirmAction.sessionId);
      } else {
        await executeActivateDocument(confirmAction.document);
      }
      setConfirmAction(null);
    } finally {
      setIsConfirmingAction(false);
    }
  }, [confirmAction, executeActivateDocument, executeRevokeAllSessions, executeRevokeSession]);

  const navItems = useMemo(
    () => [
      { id: "overview" as const, label: t.admin.nav.overview, icon: <ShieldCheck className="h-4 w-4" /> },
      { id: "accounts" as const, label: t.admin.nav.accounts, icon: <Users className="h-4 w-4" /> },
      { id: "security" as const, label: t.admin.nav.security, icon: <ShieldAlert className="h-4 w-4" /> },
      { id: "content" as const, label: t.admin.nav.content, icon: <FileText className="h-4 w-4" /> },
      { id: "system" as const, label: t.admin.nav.system, icon: <Database className="h-4 w-4" /> },
    ],
    [t],
  );

  const selectedUser = selectedUserState.data?.user ?? null;
  const canEditSelectedUser = selectedUser ? canManageRole(actorRole, selectedUser.role) : false;
  const assignableRoles = selectedUser ? getAssignableRoles(actorRole, selectedUser.role) : [];
  const roleHasChanged = selectedUser ? draftRole !== selectedUser.role : false;
  const statusHasChanged = selectedUser ? draftStatus !== selectedUser.status : false;
  const activeLegalDocuments = summaryState.data?.activeLegalDocuments ?? [];
  const systemHealth = activeTab === "system" ? systemState.data : summaryState.data?.systemHealth ?? null;
  const confirmActionTitle =
    confirmAction?.kind === "activate-document"
      ? t.admin.actions.activate
      : confirmAction?.kind === "revoke-all-sessions"
        ? t.admin.actions.revokeSessions
        : t.admin.actions.revoke;
  const confirmActionDescription =
    confirmAction?.kind === "activate-document"
      ? t.admin.messages.confirmActivateDocument
      : confirmAction?.kind === "revoke-all-sessions"
        ? t.admin.messages.confirmRevokeAllSessions
        : t.admin.messages.confirmRevokeSession;
  const confirmActionPendingLabel =
    confirmAction?.kind === "activate-document" ? t.admin.actions.saving : t.admin.actions.revoking;
  const accountDetailBody = (
    <div className="space-y-4 p-4 md:p-6">
      {selectedUserState.isLoading ? <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-6 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />{t.admin.messages.loading}</div> : null}
      {selectedUserState.error ? <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{selectedUserState.error}</div> : null}
      {selectedUser ? (
        <>
          <Card className="border-border/70 bg-background/80 shadow-none">
            <CardHeader><CardTitle className="text-base">{t.admin.accounts.accountSummary}</CardTitle></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{t.admin.tables.role}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={roleBadgeVariant(selectedUser.role)}>{roleLabels[selectedUser.role]}</Badge>
                  {selectedUser.hasUnlimitedQuota ? <Badge variant="outline">{t.admin.status.unlimited}</Badge> : null}
                  {selectedUser.canAccessAdmin ? <Badge variant="secondary">/admin</Badge> : null}
                  {selectedUser.role === "owner" ? <Badge variant="secondary">{t.admin.accounts.ownerLocked}</Badge> : null}
                </div>
              </div>
              <div className="space-y-1"><p className="text-xs uppercase tracking-wide text-muted-foreground">{t.admin.tables.status}</p><Badge variant={statusBadgeVariant(selectedUser.status)}>{statusLabels[selectedUser.status]}</Badge></div>
              <div className="space-y-1"><p className="text-xs uppercase tracking-wide text-muted-foreground">{t.admin.tables.lastLogin}</p><p className="text-sm text-foreground">{formatDateTime(selectedUser.lastLoginAt, locale)}</p></div>
              <div className="space-y-1"><p className="text-xs uppercase tracking-wide text-muted-foreground">{t.admin.tables.sessions}</p><p className="text-sm text-foreground">{selectedUser.sessionCount}</p></div>
            </CardContent>
          </Card>

          {!canEditSelectedUser ? <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700">{selectedUser.role === "owner" ? t.admin.accounts.ownerProtected : t.admin.accounts.insufficientPermissions}</div> : null}

          <Card className="border-border/70 bg-background/80 shadow-none">
            <CardHeader><CardTitle className="text-base">{t.admin.accounts.accessControl}</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <div className="space-y-2">
                <Label>{t.admin.tables.role}</Label>
                {canEditSelectedUser ? (
                  <Select value={draftRole} onValueChange={(value) => setDraftRole(value as AppRole)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="z-[70]">
                      {assignableRoles.map((role) => <SelectItem key={role} value={role}>{roleLabels[role]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : <div className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm">{roleLabels[selectedUser.role]}</div>}
              </div>
              <div className="space-y-2">
                <Label>{t.admin.tables.status}</Label>
                {canEditSelectedUser ? (
                  <Select value={draftStatus} onValueChange={(value) => setDraftStatus(value as "active" | "disabled")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="z-[70]"><SelectItem value="active">{statusLabels.active}</SelectItem><SelectItem value="disabled">{statusLabels.disabled}</SelectItem></SelectContent>
                  </Select>
                ) : <div className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm">{statusLabels[selectedUser.status]}</div>}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-background/80 shadow-none">
            <CardHeader><CardTitle className="text-base">{t.admin.accounts.recentSessions}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {selectedUserState.data?.sessions.length ? selectedUserState.data.sessions.map((session) => (
                <div key={session.id} className="rounded-xl border border-border bg-muted/40 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">{formatDateTime(session.created_at, locale)}</p>
                      <p className="text-xs text-muted-foreground">{session.ip_address || "—"}</p>
                    </div>
                    <Badge variant={session.revoked_at ? "destructive" : "secondary"}>{session.revoked_at ? t.admin.status.revoked : t.admin.status.active}</Badge>
                  </div>
                </div>
              )) : <SectionEmpty label={t.admin.messages.noResults} />}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-background/80 shadow-none">
            <CardHeader><CardTitle className="text-base">{t.admin.security.authLogsTitle}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {selectedUserState.data?.recentAuthLogs.length ? selectedUserState.data.recentAuthLogs.map((log) => (
                <div key={log.id} className="rounded-xl border border-border bg-muted/40 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">{formatDateTime(log.attempted_at, locale)}</p>
                      <p className="text-xs text-muted-foreground">{log.ip_address || "—"}</p>
                    </div>
                    <Badge variant={log.success ? "secondary" : "destructive"}>{log.success ? t.admin.security.filters.successOnly : t.admin.security.filters.failureOnly}</Badge>
                  </div>
                </div>
              )) : <SectionEmpty label={t.admin.messages.noResults} />}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
  const accountDetailActions = (
    <>
      <Button variant="outline" onClick={closeUserDetail}>{t.admin.actions.close}</Button>
      <Button variant="outline" onClick={requestRevokeAllSessions} disabled={!canEditSelectedUser || isRevokingAllSessions}>{isRevokingAllSessions ? <><Loader2 className="h-4 w-4 animate-spin" />{t.admin.actions.revoking}</> : t.admin.actions.revokeSessions}</Button>
      <Button onClick={() => void handleSaveUser()} disabled={!canEditSelectedUser || (!roleHasChanged && !statusHasChanged) || isSavingUser}>{isSavingUser ? <><Loader2 className="h-4 w-4 animate-spin" />{t.admin.actions.saving}</> : t.admin.actions.saveChanges}</Button>
    </>
  );

  if (!identity.isAuthenticated) {
    return (
      <div
        className="min-h-screen bg-background"
        style={{
          fontFamily: FONT,
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--secondary) 7%, var(--background)) 0%, var(--background) 42%)",
        }}
      >
        <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1.1fr)_440px]">
            <div className="hidden rounded-[32px] border border-border/70 bg-card/80 p-8 shadow-sm lg:block">
              <Badge variant="secondary" className="mb-4">{t.admin.login.badge}</Badge>
              <h1 className="text-4xl text-foreground" style={{ fontFamily: FONT, fontWeight: 700, lineHeight: 1.1 }}>
                {t.admin.login.title}
              </h1>
              <p className="mt-4 max-w-xl text-base text-muted-foreground" style={{ fontFamily: FONT, lineHeight: 1.7 }}>
                {t.admin.login.subtitle}
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <Card className="border-border/70 bg-background/70 shadow-none">
                  <CardHeader><CardTitle className="text-base">{t.admin.login.highlights.rolesTitle}</CardTitle></CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>{t.admin.login.highlights.rolesBody}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{roleLabels.user}</Badge>
                      <Badge variant="outline">{roleLabels.tester}</Badge>
                      <Badge variant="default">{roleLabels.admin}</Badge>
                      <Badge variant="secondary">{roleLabels.owner}</Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border/70 bg-background/70 shadow-none">
                  <CardHeader><CardTitle className="text-base">{t.admin.login.highlights.scopeTitle}</CardTitle></CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>{t.admin.login.highlights.scopeBody}</p>
                    <div className="flex items-center gap-2 text-foreground">
                      <ShieldCheck className="h-4 w-4 text-secondary" />
                      <span>{t.admin.login.highlights.scopeFootnote}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="border-border/70 bg-card/95 shadow-sm">
              <CardHeader className="pb-4">
                <Badge variant="secondary" className="mb-3 w-fit">{t.admin.login.formBadge}</Badge>
                <CardTitle className="text-2xl">{t.admin.login.formTitle}</CardTitle>
                <CardDescription>{t.admin.login.formDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleLogin}>
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">{t.admin.login.email}</Label>
                    <Input id="admin-email" type="email" value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} placeholder="job360tt@mailinator.com" autoComplete="email" disabled={isLoggingIn} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">{t.admin.login.password}</Label>
                    <Input id="admin-password" type="password" value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} placeholder="••••••••" autoComplete="current-password" disabled={isLoggingIn} />
                  </div>

                  {loginError ? <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{loginError}</div> : null}

                  <Button type="submit" className="w-full" size="lg" disabled={isLoggingIn}>
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t.admin.login.submitting}
                      </>
                    ) : (
                      <>
                        <ShieldUser className="h-4 w-4" />
                        {t.admin.login.submit}
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button variant="outline" onClick={() => navigate("/")}>{t.common.backToHome}</Button>
                  <Button variant="ghost" onClick={() => navigate("/chat")}>{t.admin.login.goToChat}</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (authProbe.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background" style={{ fontFamily: FONT }}>
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-6 py-4 text-muted-foreground shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-secondary" />
          <span>{t.admin.messages.loading}</span>
        </div>
      </div>
    );
  }

  if (authProbe.isForbidden || !adminMe) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10" style={{ fontFamily: FONT }}>
        <Card className="w-full max-w-xl border-border/70 bg-card/95 shadow-sm">
          <CardHeader>
            <Badge variant="destructive" className="mb-3 w-fit">{t.admin.forbidden.badge}</Badge>
            <CardTitle className="text-3xl">{t.admin.forbidden.title}</CardTitle>
            <CardDescription className="text-base">{t.admin.forbidden.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              {t.admin.forbidden.currentRole}: <span className="font-medium text-foreground">{identity.role ? roleLabels[identity.role] : roleLabels.user}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => navigate("/chat")}>{t.admin.forbidden.backToApp}</Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                {t.admin.forbidden.signOut}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{
        fontFamily: FONT,
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--secondary) 6%, var(--background)) 0%, var(--background) 22%)",
      }}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-[1680px] flex-col px-3 py-3 sm:px-4 lg:px-6">
        <div className="grid flex-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="rounded-[28px] border border-border/70 bg-card/95 p-4 shadow-sm lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
            <div className="mb-5 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-border bg-muted/60 p-3 text-secondary">
                  <ShieldUser className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold">{adminMe.user.displayName || adminMe.user.email}</p>
                  <p className="truncate text-sm text-muted-foreground">{adminMe.user.email}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant={roleBadgeVariant(adminMe.user.role)}>{roleLabels[adminMe.user.role]}</Badge>
                <Badge variant={statusBadgeVariant(adminMe.user.status)}>{statusLabels[adminMe.user.status]}</Badge>
                {identity.hasUnlimitedQuota ? <Badge variant="outline">{t.admin.status.unlimited}</Badge> : null}
              </div>
            </div>

            <nav className="grid gap-2">
              {navItems.map((item) => {
                const isActive = item.id === activeTab;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                      isActive
                        ? "border-secondary/30 bg-secondary/10 text-foreground"
                        : "border-transparent bg-transparent text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 flex flex-col gap-2 border-t border-border pt-4">
              <Button variant="outline" onClick={() => void refreshActiveTab()}>
                <RefreshCw className="h-4 w-4" />
                {t.admin.actions.refresh}
              </Button>
              <Button variant="ghost" onClick={() => navigate("/chat")}>{t.admin.actions.backToApp}</Button>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                {t.admin.actions.signOut}
              </Button>
            </div>
          </aside>

          <main className="min-w-0 space-y-4">
            <section className="rounded-[28px] border border-border/70 bg-card/95 p-5 shadow-sm">
              <div className={`grid gap-4 ${isDesktop ? "lg:grid-cols-[minmax(0,1fr)_320px]" : ""}`}>
                <div>
                  <Badge variant="secondary" className="mb-3">{t.admin.header.badge}</Badge>
                  <h1 className="text-3xl sm:text-4xl" style={{ fontFamily: FONT, fontWeight: 700, lineHeight: 1.05 }}>
                    {t.admin.header.title}
                  </h1>
                  <p className="mt-3 max-w-3xl text-sm text-muted-foreground sm:text-base">{t.admin.header.description}</p>
                </div>
                <div className="grid gap-3 rounded-3xl border border-border bg-muted/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-muted-foreground">{t.admin.header.operator}</span>
                    <Badge variant={roleBadgeVariant(adminMe.user.role)}>{roleLabels[adminMe.user.role]}</Badge>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-muted-foreground">{t.admin.header.canManageAdmins}</span>
                    <Badge variant={canManageAdmins ? "secondary" : "outline"}>{canManageAdmins ? t.admin.status.yes : t.admin.status.no}</Badge>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-muted-foreground">{t.admin.header.sessionScope}</span>
                    <span className="truncate text-sm font-medium text-foreground">{adminMe.user.scopeKey}</span>
                  </div>
                </div>
              </div>
            </section>

            {topNotice ? (
              <div className={`rounded-2xl border px-4 py-3 text-sm ${topNotice.tone === "error" ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-secondary/30 bg-secondary/10 text-secondary"}`}>
                {topNotice.message}
              </div>
            ) : null}

            {activeTab === "overview" ? (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <MetricCard title={t.admin.overview.metrics.totalAccounts} value={summaryState.data ? String(summaryState.data.summary.totalAccounts) : "—"} detail={summaryState.data ? `${roleLabels.user}: ${summaryState.data.summary.roleCounts.user}, ${roleLabels.tester}: ${summaryState.data.summary.roleCounts.tester}, ${roleLabels.admin}: ${summaryState.data.summary.roleCounts.admin}, ${roleLabels.owner}: ${summaryState.data.summary.roleCounts.owner}` : t.admin.messages.noData} icon={<Users className="h-5 w-5" />} />
                  <MetricCard title={t.admin.overview.metrics.activeSessions} value={summaryState.data ? String(summaryState.data.summary.activeSessions) : "—"} detail={t.admin.overview.metrics.activeSessionsHint} icon={<Activity className="h-5 w-5" />} />
                  <MetricCard title={t.admin.overview.metrics.failedLogins} value={summaryState.data ? String(summaryState.data.summary.failedLogins24h) : "—"} detail={t.admin.overview.metrics.failedLoginsHint} icon={<ShieldAlert className="h-5 w-5" />} />
                  <MetricCard title={t.admin.overview.metrics.disabledAccounts} value={summaryState.data ? String(summaryState.data.summary.disabledUsers) : "—"} detail={t.admin.overview.metrics.disabledAccountsHint} icon={<Lock className="h-5 w-5" />} />
                  <MetricCard title={t.admin.overview.metrics.activeLegalDocs} value={summaryState.data ? String(summaryState.data.summary.activeLegalDocuments) : "—"} detail={t.admin.overview.metrics.activeLegalDocsHint} icon={<FileCheck className="h-5 w-5" />} />
                  <MetricCard title={t.admin.overview.metrics.latestImport} value={summaryState.data?.summary.latestJobsImportAt ? formatDateTime(summaryState.data.summary.latestJobsImportAt, locale) : "—"} detail={t.admin.overview.metrics.latestImportHint} icon={<Database className="h-5 w-5" />} />
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
                  <Card className="border-border/70 bg-card/95 shadow-sm">
                    <CardHeader>
                      <CardTitle>{t.admin.overview.alertsTitle}</CardTitle>
                      <CardDescription>{t.admin.overview.alertsDescription}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {summaryState.isLoading ? <div className="flex items-center gap-3 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />{t.admin.messages.loading}</div> : null}
                      {summaryState.error ? <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{summaryState.error}</div> : null}
                      {!summaryState.isLoading && !summaryState.error && summaryState.data?.alerts.length ? summaryState.data.alerts.map((alert) => (
                        <div key={`${alert.level}-${alert.message}`} className={`rounded-2xl border px-4 py-3 ${alertToneClass(alert.level)}`}>
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                            <span className="text-sm">{alert.message}</span>
                          </div>
                        </div>
                      )) : null}
                      {!summaryState.isLoading && !summaryState.error && !summaryState.data?.alerts.length ? <SectionEmpty label={t.admin.overview.noAlerts} /> : null}
                    </CardContent>
                  </Card>

                  <Card className="border-border/70 bg-card/95 shadow-sm">
                    <CardHeader>
                      <CardTitle>{t.admin.overview.systemTitle}</CardTitle>
                      <CardDescription>{t.admin.overview.systemDescription}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={systemHealth?.status === "ready" ? "secondary" : "destructive"}>{systemHealth?.status === "ready" ? t.admin.status.ready : t.admin.status.issuesFound}</Badge>
                        <span className="text-sm text-muted-foreground">{t.admin.overview.systemStatusHint}</span>
                      </div>
                      {systemHealth ? <div className="grid gap-2">{Object.entries(systemHealth.checks).map(([key, check]) => (
                        <div key={key} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 px-3 py-2">
                          <div>
                            <p className="text-sm font-medium capitalize text-foreground">{key}</p>
                            <p className="text-xs text-muted-foreground">{check.detail}</p>
                          </div>
                          <Badge variant={check.ok ? "secondary" : "destructive"}>{check.ok ? t.admin.status.ok : t.admin.status.issue}</Badge>
                        </div>
                      ))}</div> : <SectionEmpty label={t.admin.messages.noData} />}
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-border/70 bg-card/95 shadow-sm">
                  <CardHeader>
                    <CardTitle>{t.admin.overview.activeLegalDocuments}</CardTitle>
                    <CardDescription>{t.admin.overview.activeLegalDocumentsDescription}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {activeLegalDocuments.length ? <div className="grid gap-3 lg:grid-cols-2">{activeLegalDocuments.map((document) => (
                      <div key={document.id} className="rounded-2xl border border-border bg-muted/40 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{docTypeLabels[document.doc_type as keyof typeof docTypeLabels] ?? document.doc_type}</p>
                            <p className="text-xs text-muted-foreground">{t.admin.labels.version}: {document.version}</p>
                          </div>
                          <Badge variant="secondary">{t.admin.status.active}</Badge>
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">{locale === "vi" ? document.title_vi : document.title_en}</p>
                        <p className="mt-2 text-xs text-muted-foreground">{t.admin.labels.effectiveDate}: {formatDateOnly(document.effective_date, locale)}</p>
                      </div>
                    ))}</div> : <SectionEmpty label={t.admin.messages.noData} />}
                  </CardContent>
                </Card>
              </div>
            ) : null}

            {activeTab === "accounts" ? (
              <Card className="border-border/70 bg-card/95 shadow-sm">
                <CardHeader>
                  <CardTitle>{t.admin.accounts.title}</CardTitle>
                  <CardDescription>{t.admin.accounts.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_200px_180px]">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input value={accountFilters.search} onChange={(event) => setAccountFilters((current) => ({ ...current, search: event.target.value }))} className="pl-10" placeholder={t.admin.accounts.searchPlaceholder} />
                    </div>
                    <Select value={accountFilters.role} onValueChange={(value) => setAccountFilters((current) => ({ ...current, role: value as RoleFilter }))}>
                      <SelectTrigger><SelectValue placeholder={t.admin.accounts.filters.role} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t.admin.filters.allRoles}</SelectItem>
                        <SelectItem value="user">{roleLabels.user}</SelectItem>
                        <SelectItem value="tester">{roleLabels.tester}</SelectItem>
                        <SelectItem value="admin">{roleLabels.admin}</SelectItem>
                        <SelectItem value="owner">{roleLabels.owner}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={accountFilters.status} onValueChange={(value) => setAccountFilters((current) => ({ ...current, status: value as StatusFilter }))}>
                      <SelectTrigger><SelectValue placeholder={t.admin.accounts.filters.status} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t.admin.filters.allStatuses}</SelectItem>
                        <SelectItem value="active">{statusLabels.active}</SelectItem>
                        <SelectItem value="disabled">{statusLabels.disabled}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {usersState.error ? <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{usersState.error}</div> : null}

                  <div className="rounded-2xl border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t.admin.tables.email}</TableHead>
                          <TableHead>{t.admin.tables.name}</TableHead>
                          <TableHead>{t.admin.tables.role}</TableHead>
                          <TableHead>{t.admin.tables.status}</TableHead>
                          <TableHead>{t.admin.tables.lastLogin}</TableHead>
                          <TableHead>{t.admin.tables.loginCount}</TableHead>
                          <TableHead>{t.admin.tables.failedLogins}</TableHead>
                          <TableHead>{t.admin.tables.sessions}</TableHead>
                          <TableHead className="text-right">{t.admin.tables.actions}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {usersState.isLoading ? <TableRow><TableCell colSpan={9}><div className="flex items-center gap-3 py-4 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />{t.admin.messages.loading}</div></TableCell></TableRow> : null}
                        {!usersState.isLoading && usersState.data?.items.length ? usersState.data.items.map((user) => (
                          <TableRow key={user.userId}>
                            <TableCell className="max-w-[240px] truncate font-medium">{user.email}</TableCell>
                            <TableCell>{user.displayName || "—"}</TableCell>
                            <TableCell><div className="flex flex-wrap gap-2"><Badge variant={roleBadgeVariant(user.role)}>{roleLabels[user.role]}</Badge>{user.hasUnlimitedQuota ? <Badge variant="outline">{t.admin.status.unlimited}</Badge> : null}</div></TableCell>
                            <TableCell><Badge variant={statusBadgeVariant(user.status)}>{statusLabels[user.status]}</Badge></TableCell>
                            <TableCell>{formatDateTime(user.lastLoginAt, locale)}</TableCell>
                            <TableCell>{user.loginCount}</TableCell>
                            <TableCell>{user.failedLoginCount}</TableCell>
                            <TableCell>{user.sessionCount}</TableCell>
                            <TableCell className="text-right"><Button size="sm" variant={canManageRole(actorRole, user.role) ? "default" : "outline"} onClick={() => void loadUserDetail(user.userId)}>{canManageRole(actorRole, user.role) ? t.admin.actions.manage : t.admin.actions.view}</Button></TableCell>
                          </TableRow>
                        )) : null}
                        {!usersState.isLoading && !usersState.data?.items.length ? <TableRow><TableCell colSpan={9}><SectionEmpty label={t.admin.messages.noResults} /></TableCell></TableRow> : null}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {activeTab === "security" ? (
              <div className="space-y-4">
                <Card className="border-border/70 bg-card/95 shadow-sm">
                  <CardHeader>
                    <CardTitle>{t.admin.security.title}</CardTitle>
                    <CardDescription>{t.admin.security.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 xl:grid-cols-[minmax(0,1.2fr)_200px_200px_200px_200px]">
                      <Input value={securityFilters.userId} onChange={(event) => setSecurityFilters((current) => ({ ...current, userId: event.target.value }))} placeholder={t.admin.security.filters.userId} />
                      <Select value={securityFilters.activeOnly} onValueChange={(value) => setSecurityFilters((current) => ({ ...current, activeOnly: value as BooleanFilter }))}>
                        <SelectTrigger><SelectValue placeholder={t.admin.security.filters.sessions} /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t.admin.filters.allSessions}</SelectItem>
                          <SelectItem value="true">{t.admin.security.filters.activeOnly}</SelectItem>
                          <SelectItem value="false">{t.admin.security.filters.revokedOnly}</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={securityFilters.success} onValueChange={(value) => setSecurityFilters((current) => ({ ...current, success: value as BooleanFilter }))}>
                        <SelectTrigger><SelectValue placeholder={t.admin.security.filters.results} /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t.admin.filters.allResults}</SelectItem>
                          <SelectItem value="true">{t.admin.security.filters.successOnly}</SelectItem>
                          <SelectItem value="false">{t.admin.security.filters.failureOnly}</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input value={securityFilters.auditAction} onChange={(event) => setSecurityFilters((current) => ({ ...current, auditAction: event.target.value }))} placeholder={t.admin.security.filters.auditAction} />
                      <Input value={securityFilters.auditTable} onChange={(event) => setSecurityFilters((current) => ({ ...current, auditTable: event.target.value }))} placeholder={t.admin.security.filters.auditTable} />
                    </div>

                    {securityState.error ? <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{securityState.error}</div> : null}

                    <div className="grid gap-4">
                      <Card className="border-border/70 bg-background/70 shadow-none">
                        <CardHeader><CardTitle className="text-base">{t.admin.security.sessionsTitle}</CardTitle></CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader><TableRow><TableHead>{t.admin.tables.email}</TableHead><TableHead>{t.admin.tables.scopeKey}</TableHead><TableHead>{t.admin.tables.createdAt}</TableHead><TableHead>{t.admin.tables.expiresAt}</TableHead><TableHead>{t.admin.tables.status}</TableHead><TableHead className="text-right">{t.admin.tables.actions}</TableHead></TableRow></TableHeader>
                            <TableBody>
                              {securityState.isLoading ? <TableRow><TableCell colSpan={6}><div className="flex items-center gap-3 py-4 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />{t.admin.messages.loading}</div></TableCell></TableRow> : null}
                              {!securityState.isLoading && securityState.data?.sessions.length ? securityState.data.sessions.map((session) => (
                                <TableRow key={session.id}>
                                  <TableCell className="max-w-[220px] truncate">{session.user?.email ?? session.user_id}</TableCell>
                                  <TableCell className="max-w-[220px] truncate">{session.scope_key}</TableCell>
                                  <TableCell>{formatDateTime(session.created_at, locale)}</TableCell>
                                  <TableCell>{formatDateTime(session.expires_at, locale)}</TableCell>
                                  <TableCell><Badge variant={session.revoked_at ? "destructive" : "secondary"}>{session.revoked_at ? t.admin.status.revoked : t.admin.status.active}</Badge></TableCell>
                                  <TableCell className="text-right"><Button size="sm" variant="outline" disabled={Boolean(session.revoked_at) || !session.canRevoke} onClick={() => requestRevokeSession(session.id)}>{t.admin.actions.revoke}</Button></TableCell>
                                </TableRow>
                              )) : null}
                              {!securityState.isLoading && !securityState.data?.sessions.length ? <TableRow><TableCell colSpan={6}><SectionEmpty label={t.admin.messages.noResults} /></TableCell></TableRow> : null}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>

                      <Card className="border-border/70 bg-background/70 shadow-none">
                        <CardHeader><CardTitle className="text-base">{t.admin.security.authLogsTitle}</CardTitle></CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader><TableRow><TableHead>{t.admin.tables.email}</TableHead><TableHead>{t.admin.tables.result}</TableHead><TableHead>{t.admin.tables.timestamp}</TableHead><TableHead>{t.admin.tables.ipAddress}</TableHead></TableRow></TableHeader>
                            <TableBody>
                              {securityState.isLoading ? <TableRow><TableCell colSpan={4}><div className="flex items-center gap-3 py-4 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />{t.admin.messages.loading}</div></TableCell></TableRow> : null}
                              {!securityState.isLoading && securityState.data?.authLogs.length ? securityState.data.authLogs.map((log) => (
                                <TableRow key={log.id}>
                                  <TableCell className="max-w-[220px] truncate">{log.user?.email ?? log.user_id ?? "—"}</TableCell>
                                  <TableCell><Badge variant={log.success ? "secondary" : "destructive"}>{log.success ? t.admin.security.filters.successOnly : t.admin.security.filters.failureOnly}</Badge></TableCell>
                                  <TableCell>{formatDateTime(log.attempted_at, locale)}</TableCell>
                                  <TableCell>{log.ip_address || "—"}</TableCell>
                                </TableRow>
                              )) : null}
                              {!securityState.isLoading && !securityState.data?.authLogs.length ? <TableRow><TableCell colSpan={4}><SectionEmpty label={t.admin.messages.noResults} /></TableCell></TableRow> : null}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>

                      <Card className="border-border/70 bg-background/70 shadow-none">
                        <CardHeader><CardTitle className="text-base">{t.admin.security.auditLogsTitle}</CardTitle></CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader><TableRow><TableHead>{t.admin.tables.email}</TableHead><TableHead>{t.admin.tables.action}</TableHead><TableHead>{t.admin.tables.tableName}</TableHead><TableHead>{t.admin.tables.timestamp}</TableHead></TableRow></TableHeader>
                            <TableBody>
                              {securityState.isLoading ? <TableRow><TableCell colSpan={4}><div className="flex items-center gap-3 py-4 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />{t.admin.messages.loading}</div></TableCell></TableRow> : null}
                              {!securityState.isLoading && securityState.data?.auditLogs.length ? securityState.data.auditLogs.map((log) => (
                                <TableRow key={log.id}>
                                  <TableCell className="max-w-[220px] truncate">{log.user?.email ?? log.user_id ?? "—"}</TableCell>
                                  <TableCell>{log.action}</TableCell>
                                  <TableCell>{log.table_name}</TableCell>
                                  <TableCell>{formatDateTime(log.created_at, locale)}</TableCell>
                                </TableRow>
                              )) : null}
                              {!securityState.isLoading && !securityState.data?.auditLogs.length ? <TableRow><TableCell colSpan={4}><SectionEmpty label={t.admin.messages.noResults} /></TableCell></TableRow> : null}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}

            {activeTab === "content" ? (
              <div className="space-y-4">
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                  <Card className="border-border/70 bg-card/95 shadow-sm">
                    <CardHeader><CardTitle>{t.admin.content.legalTitle}</CardTitle><CardDescription>{t.admin.content.legalDescription}</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                      {contentState.error ? <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{contentState.error}</div> : null}
                      <div className="rounded-2xl border border-border">
                        <Table>
                          <TableHeader><TableRow><TableHead>{t.admin.tables.docType}</TableHead><TableHead>{t.admin.tables.version}</TableHead><TableHead>{t.admin.tables.effectiveDate}</TableHead><TableHead>{t.admin.tables.status}</TableHead><TableHead className="text-right">{t.admin.tables.actions}</TableHead></TableRow></TableHeader>
                          <TableBody>
                            {contentState.isLoading ? <TableRow><TableCell colSpan={5}><div className="flex items-center gap-3 py-4 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />{t.admin.messages.loading}</div></TableCell></TableRow> : null}
                            {!contentState.isLoading && contentState.data?.legalDocuments.length ? contentState.data.legalDocuments.map((document) => (
                              <TableRow key={document.id}>
                                <TableCell>{docTypeLabels[document.doc_type as keyof typeof docTypeLabels] ?? document.doc_type}</TableCell>
                                <TableCell>{document.version}</TableCell>
                                <TableCell>{formatDateOnly(document.effective_date, locale)}</TableCell>
                                <TableCell><Badge variant={document.is_active ? "secondary" : "outline"}>{document.is_active ? t.admin.status.active : t.admin.status.inactive}</Badge></TableCell>
                                <TableCell className="text-right"><div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => resetDocumentForm(document)}>{t.admin.actions.edit}</Button><Button size="sm" disabled={document.is_active} onClick={() => requestActivateDocument(document)}>{t.admin.actions.activate}</Button></div></TableCell>
                              </TableRow>
                            )) : null}
                            {!contentState.isLoading && !contentState.data?.legalDocuments.length ? <TableRow><TableCell colSpan={5}><SectionEmpty label={t.admin.messages.noResults} /></TableCell></TableRow> : null}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/70 bg-card/95 shadow-sm">
                    <CardHeader><CardTitle>{editingDocumentId ? t.admin.content.editDocument : t.admin.content.createDocument}</CardTitle><CardDescription>{t.admin.content.formDescription}</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>{t.admin.content.fields.docType}</Label>
                        <Select value={documentForm.docType} onValueChange={(value) => setDocumentForm((current) => ({ ...current, docType: value }))} disabled={Boolean(editingDocumentId)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="privacy_policy">{docTypeLabels.privacy_policy}</SelectItem>
                            <SelectItem value="terms_of_service">{docTypeLabels.terms_of_service}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2"><Label>{t.admin.content.fields.version}</Label><Input value={documentForm.version} onChange={(event) => setDocumentForm((current) => ({ ...current, version: event.target.value }))} placeholder="2026.03" /></div>
                        <div className="space-y-2"><Label>{t.admin.content.fields.effectiveDate}</Label><Input type="date" value={documentForm.effectiveDate} onChange={(event) => setDocumentForm((current) => ({ ...current, effectiveDate: event.target.value }))} /></div>
                      </div>
                      <div className="space-y-2"><Label>{t.admin.content.fields.titleVi}</Label><Input value={documentForm.titleVi} onChange={(event) => setDocumentForm((current) => ({ ...current, titleVi: event.target.value }))} /></div>
                      <div className="space-y-2"><Label>{t.admin.content.fields.titleEn}</Label><Input value={documentForm.titleEn} onChange={(event) => setDocumentForm((current) => ({ ...current, titleEn: event.target.value }))} /></div>
                      <div className="space-y-2"><Label>{t.admin.content.fields.contentVi}</Label><Textarea value={documentForm.contentVi} onChange={(event) => setDocumentForm((current) => ({ ...current, contentVi: event.target.value }))} className="min-h-[160px]" /></div>
                      <div className="space-y-2"><Label>{t.admin.content.fields.contentEn}</Label><Textarea value={documentForm.contentEn} onChange={(event) => setDocumentForm((current) => ({ ...current, contentEn: event.target.value }))} className="min-h-[160px]" /></div>
                      <div className="flex flex-wrap gap-3">
                        <Button onClick={() => void handleSubmitDocument()} disabled={isSubmittingDocument}>{isSubmittingDocument ? <><Loader2 className="h-4 w-4 animate-spin" />{t.admin.actions.saving}</> : editingDocumentId ? t.admin.actions.updateDocument : t.admin.actions.createDocument}</Button>
                        <Button variant="outline" onClick={() => resetDocumentForm(null)}>{t.admin.actions.reset}</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-border/70 bg-card/95 shadow-sm">
                  <CardHeader><CardTitle>{t.admin.content.consentsTitle}</CardTitle><CardDescription>{t.admin.content.consentsDescription}</CardDescription></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_260px]">
                      <Input value={contentFilters.consentIdentifier} onChange={(event) => setContentFilters((current) => ({ ...current, consentIdentifier: event.target.value }))} placeholder={t.admin.content.filters.identifier} />
                      <Select value={contentFilters.consentType} onValueChange={(value) => setContentFilters((current) => ({ ...current, consentType: value }))}>
                        <SelectTrigger><SelectValue placeholder={t.admin.content.filters.consentType} /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t.admin.filters.allConsentTypes}</SelectItem>
                          <SelectItem value="privacy_policy">{docTypeLabels.privacy_policy}</SelectItem>
                          <SelectItem value="terms_of_service">{docTypeLabels.terms_of_service}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="rounded-2xl border border-border">
                      <Table>
                        <TableHeader><TableRow><TableHead>{t.admin.tables.identifier}</TableHead><TableHead>{t.admin.tables.docType}</TableHead><TableHead>{t.admin.tables.accepted}</TableHead><TableHead>{t.admin.tables.version}</TableHead><TableHead>{t.admin.tables.timestamp}</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {contentState.isLoading ? <TableRow><TableCell colSpan={5}><div className="flex items-center gap-3 py-4 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />{t.admin.messages.loading}</div></TableCell></TableRow> : null}
                          {!contentState.isLoading && contentState.data?.consents.length ? contentState.data.consents.map((consent) => (
                            <TableRow key={consent.id}>
                              <TableCell>{consent.identifier}</TableCell>
                              <TableCell>{docTypeLabels[consent.consent_type as keyof typeof docTypeLabels] ?? consent.consent_type}</TableCell>
                              <TableCell><Badge variant={consent.accepted ? "secondary" : "destructive"}>{consent.accepted ? t.admin.status.yes : t.admin.status.no}</Badge></TableCell>
                              <TableCell>{consent.doc_version || "—"}</TableCell>
                              <TableCell>{formatDateTime(consent.accepted_at || consent.created_at, locale)}</TableCell>
                            </TableRow>
                          )) : null}
                          {!contentState.isLoading && !contentState.data?.consents.length ? <TableRow><TableCell colSpan={5}><SectionEmpty label={t.admin.messages.noResults} /></TableCell></TableRow> : null}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/70 bg-card/95 shadow-sm">
                  <CardHeader><CardTitle>{t.admin.content.jobsTitle}</CardTitle><CardDescription>{t.admin.content.jobsDescription}</CardDescription></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_220px]">
                      <Input value={contentFilters.jobsSearch} onChange={(event) => setContentFilters((current) => ({ ...current, jobsSearch: event.target.value }))} placeholder={t.admin.content.filters.jobsSearch} />
                      <Select value={contentFilters.jobsHasErrors} onValueChange={(value) => setContentFilters((current) => ({ ...current, jobsHasErrors: value as BooleanFilter }))}>
                        <SelectTrigger><SelectValue placeholder={t.admin.content.filters.jobsErrors} /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t.admin.filters.allImportStates}</SelectItem>
                          <SelectItem value="true">{t.admin.content.filters.hasErrors}</SelectItem>
                          <SelectItem value="false">{t.admin.content.filters.noErrors}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="rounded-2xl border border-border">
                      <Table>
                        <TableHeader><TableRow><TableHead>{t.admin.tables.jobTitle}</TableHead><TableHead>{t.admin.tables.company}</TableHead><TableHead>{t.admin.tables.location}</TableHead><TableHead>{t.admin.tables.status}</TableHead><TableHead>{t.admin.tables.timestamp}</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {contentState.isLoading ? <TableRow><TableCell colSpan={5}><div className="flex items-center gap-3 py-4 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />{t.admin.messages.loading}</div></TableCell></TableRow> : null}
                          {!contentState.isLoading && contentState.data?.jobsImport.length ? contentState.data.jobsImport.map((job, index) => (
                            <TableRow key={`${job.url || job.apply_link || "job"}-${index}`}>
                              <TableCell className="max-w-[280px] truncate">{job.job_title || "—"}</TableCell>
                              <TableCell>{job.company_name || "—"}</TableCell>
                              <TableCell>{job.job_location || "—"}</TableCell>
                              <TableCell><Badge variant={job.error ? "destructive" : "secondary"}>{job.error ? t.admin.status.issue : t.admin.status.ok}</Badge></TableCell>
                              <TableCell>{formatDateTime(job.timestamp, locale)}</TableCell>
                            </TableRow>
                          )) : null}
                          {!contentState.isLoading && !contentState.data?.jobsImport.length ? <TableRow><TableCell colSpan={5}><SectionEmpty label={t.admin.messages.noResults} /></TableCell></TableRow> : null}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}

            {activeTab === "system" ? (
              <Card className="border-border/70 bg-card/95 shadow-sm">
                <CardHeader><CardTitle>{t.admin.system.title}</CardTitle><CardDescription>{t.admin.system.description}</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  {systemState.error ? <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{systemState.error}</div> : null}
                  <div className="flex items-center gap-3">
                    <Badge variant={systemHealth?.status === "ready" ? "secondary" : "destructive"}>{systemHealth?.status === "ready" ? t.admin.status.ready : t.admin.status.issuesFound}</Badge>
                    <span className="text-sm text-muted-foreground">{t.admin.system.summary}</span>
                  </div>
                  {systemState.isLoading ? <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-6 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />{t.admin.messages.loading}</div> : null}
                  {!systemState.isLoading && systemHealth ? <div className="grid gap-3 md:grid-cols-2">{Object.entries(systemHealth.checks).map(([key, check]) => (
                    <Card key={key} className="border-border/70 bg-background/70 shadow-none">
                      <CardHeader className="pb-3"><div className="flex items-center justify-between gap-3"><CardTitle className="text-base capitalize">{key}</CardTitle><Badge variant={check.ok ? "secondary" : "destructive"}>{check.ok ? t.admin.status.ok : t.admin.status.issue}</Badge></div></CardHeader>
                      <CardContent className="pt-0"><p className="text-sm text-muted-foreground">{check.detail}</p></CardContent>
                    </Card>
                  ))}</div> : null}
                  {!systemState.isLoading && !systemHealth ? <SectionEmpty label={t.admin.messages.noData} /> : null}
                </CardContent>
              </Card>
            ) : null}
          </main>
        </div>
      </div>

      {isDesktop ? (
        <Dialog open={Boolean(selectedUserId)} onOpenChange={(open) => { if (!open) closeUserDetail(); }}>
          <DialogContent className="max-w-3xl gap-0 overflow-hidden p-0">
            <DialogHeader className="border-b border-border px-6 py-4">
              <DialogTitle>{selectedUser ? selectedUser.displayName || selectedUser.email : t.admin.accounts.drawerTitle}</DialogTitle>
              <DialogDescription>{selectedUser ? selectedUser.email : t.admin.accounts.drawerDescription}</DialogDescription>
            </DialogHeader>
            <div className="max-h-[80vh] overflow-y-auto">{accountDetailBody}</div>
            <DialogFooter className="border-t border-border px-6 py-4">
              {accountDetailActions}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={Boolean(selectedUserId)} onOpenChange={(open) => { if (!open) closeUserDetail(); }}>
          <DrawerContent className="max-h-[92vh]">
            <DrawerHeader className="border-b border-border pb-4">
              <DrawerTitle>{selectedUser ? selectedUser.displayName || selectedUser.email : t.admin.accounts.drawerTitle}</DrawerTitle>
              <DrawerDescription>{selectedUser ? selectedUser.email : t.admin.accounts.drawerDescription}</DrawerDescription>
            </DrawerHeader>
            <div className="overflow-y-auto">{accountDetailBody}</div>
            <DrawerFooter className="border-t border-border">
              {accountDetailActions}
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}

      <AlertDialog open={Boolean(confirmAction)} onOpenChange={(open) => { if (!open) setConfirmAction(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmActionTitle}</AlertDialogTitle>
            <AlertDialogDescription>{confirmActionDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isConfirmingAction}>{t.admin.actions.close}</AlertDialogCancel>
            <AlertDialogAction
              disabled={isConfirmingAction}
              onClick={(event) => {
                event.preventDefault();
                void handleConfirmAction();
              }}
            >
              {isConfirmingAction ? confirmActionPendingLabel : confirmActionTitle}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
