/**
 * Chat history persistence via localStorage.
 *
 * Storage schema (scoped by session):
 *   "careerai-chat-index-v2:{scope}"             -> ConversationMeta[] (conversation index)
 *   "careerai-chat-message-v2:{convId}:{scope}"  -> CompactMessage[]    (messages per conversation)
 *
 * Legacy support:
 *   "cai_idx" and "cai_m_{id}" are migrated into the current guest scope
 *   on first access so existing guest chats do not disappear.
 */

import { resolveSessionIdentity, scopeStorageKey } from "./sessionScope";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
export interface ConversationMeta {
  id: string;
  /** First user message, truncated */
  title: string;
  /** Last updated timestamp (epoch ms) */
  u: number;
  /** Total user message count */
  n: number;
}

interface CompactMessage {
  /** 0 = user, 1 = assistant */
  r: 0 | 1;
  c: string;
  t: number;
  f?: { n: string; u: string; p: string; s: number };
}

export interface StoredFileAttachment {
  name: string;
  url: string;
  publicId: string;
  size: number;
}

export interface StoredMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  attachment?: StoredFileAttachment;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */
const IDX_KEY = "careerai-chat-index-v2";
const MSG_KEY_BASE = "careerai-chat-message-v2";
const LEGACY_IDX_KEY = "cai_idx";
const LEGACY_MSG_PREFIX = "cai_m_";
/** Max conversations kept in storage */
const MAX_CONVERSATIONS = 10;
/** Max messages stored per conversation (keeps recent ones) */
const MAX_MESSAGES_PER_CONV = 40;

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full — try evicting oldest conversation
    try {
      const list = getConversationList();
      if (list.length > 0) {
        const oldest = list[list.length - 1];
        deleteConversation(oldest.id);
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch {
      /* give up silently */
    }
  }
}

/** Generate a compact unique id */
function newId(): string {
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function getScopeKey(): string {
  return resolveSessionIdentity().scopeKey;
}

function getIndexKey(scopeKey = getScopeKey()): string {
  return scopeStorageKey(IDX_KEY, scopeKey);
}

function getMessageKey(scopeKey: string, convId: string): string {
  return scopeStorageKey(`${MSG_KEY_BASE}:${convId}`, scopeKey);
}

function migrateLegacyGuestHistory(scopeKey: string): void {
  if (!scopeKey.startsWith("guest:")) return;

  const scopedIndexKey = getIndexKey(scopeKey);
  if (localStorage.getItem(scopedIndexKey)) return;

  const legacyList = read<ConversationMeta[]>(LEGACY_IDX_KEY, []);
  if (legacyList.length === 0) return;

  try {
    for (const conv of legacyList) {
      const raw = localStorage.getItem(`${LEGACY_MSG_PREFIX}${conv.id}`);
      if (raw) {
        localStorage.setItem(getMessageKey(scopeKey, conv.id), raw);
      }
      localStorage.removeItem(`${LEGACY_MSG_PREFIX}${conv.id}`);
    }

    localStorage.setItem(scopedIndexKey, JSON.stringify(legacyList));
    localStorage.removeItem(LEGACY_IDX_KEY);
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------ */
/*  Compact ↔ Full message conversion                                   */
/* ------------------------------------------------------------------ */
function toCompact(msg: StoredMessage): CompactMessage {
  const cm: CompactMessage = {
    r: msg.role === "user" ? 0 : 1,
    c: msg.content,
    t: msg.timestamp.getTime(),
  };
  if (msg.attachment) {
    cm.f = {
      n: msg.attachment.name,
      u: msg.attachment.url,
      p: msg.attachment.publicId,
      s: msg.attachment.size,
    };
  }
  return cm;
}

function fromCompact(cm: CompactMessage): StoredMessage {
  const msg: StoredMessage = {
    role: cm.r === 0 ? "user" : "assistant",
    content: cm.c,
    timestamp: new Date(cm.t),
  };
  if (cm.f) {
    msg.attachment = {
      name: cm.f.n,
      url: cm.f.u,
      publicId: cm.f.p,
      size: cm.f.s,
    };
  }
  return msg;
}

/* ------------------------------------------------------------------ */
/*  Public API                                                          */
/* ------------------------------------------------------------------ */

/** Get sorted conversation list (newest first) */
export function getConversationList(): ConversationMeta[] {
  const scopeKey = getScopeKey();
  migrateLegacyGuestHistory(scopeKey);

  const list = read<ConversationMeta[]>(getIndexKey(scopeKey), []);
  return list.sort((a, b) => b.u - a.u);
}

/** Get messages for a conversation (excludes welcome message) */
export function getMessages(convId: string): StoredMessage[] {
  const scopeKey = getScopeKey();
  migrateLegacyGuestHistory(scopeKey);

  const compact = read<CompactMessage[]>(getMessageKey(scopeKey, convId), []);
  return compact.map(fromCompact);
}

/** Create a new conversation, returns its ID */
export function createConversation(): string {
  const id = newId();
  // Don't add to index until first message is saved
  return id;
}

/**
 * Save messages for a conversation.
 * - Skips welcome messages (role=assistant with no prior user message).
 * - Generates title from first user message.
 * - Enforces per-conversation message limit.
 * - Enforces max conversation count (evicts oldest).
 */
export function saveMessages(
  convId: string,
  messages: StoredMessage[],
): void {
  const scopeKey = getScopeKey();
  migrateLegacyGuestHistory(scopeKey);

  // Filter out the welcome message (first assistant msg before any user msg)
  const filtered = messages.filter((m, i) => {
    if (i === 0 && m.role === "assistant") return false; // skip welcome
    return true;
  });

  // Don't save if no real messages
  if (filtered.length === 0) return;

  // Trim to max limit (keep most recent)
  const trimmed =
    filtered.length > MAX_MESSAGES_PER_CONV
      ? filtered.slice(-MAX_MESSAGES_PER_CONV)
      : filtered;

  // Save messages
  write(getMessageKey(scopeKey, convId), trimmed.map(toCompact));

  // Build / update index entry
  const firstUserMsg = filtered.find((m) => m.role === "user");
  const title = firstUserMsg
    ? firstUserMsg.content.slice(0, 60).replace(/\n/g, " ")
    : "...";
  const userCount = filtered.filter((m) => m.role === "user").length;

  const list = read<ConversationMeta[]>(getIndexKey(scopeKey), []);
  const existingIdx = list.findIndex((c) => c.id === convId);

  const meta: ConversationMeta = {
    id: convId,
    title,
    u: Date.now(),
    n: userCount,
  };

  if (existingIdx >= 0) {
    list[existingIdx] = meta;
  } else {
    list.unshift(meta);
  }

  // Enforce max conversations — evict oldest
  if (list.length > MAX_CONVERSATIONS) {
    const evicted = list
      .sort((a, b) => b.u - a.u)
      .splice(MAX_CONVERSATIONS);
    for (const conv of evicted) {
      try {
        localStorage.removeItem(getMessageKey(scopeKey, conv.id));
      } catch {
        /* ignore */
      }
    }
  }

  write(getIndexKey(scopeKey), list.sort((a, b) => b.u - a.u));
}

/** Delete a conversation and its messages */
export function deleteConversation(convId: string): void {
  const scopeKey = getScopeKey();

  try {
    localStorage.removeItem(getMessageKey(scopeKey, convId));
  } catch {
    /* ignore */
  }

  const list = read<ConversationMeta[]>(getIndexKey(scopeKey), []);
  const updated = list.filter((c) => c.id !== convId);
  write(getIndexKey(scopeKey), updated);
}

/** Estimate total storage used by chat history (bytes) */
export function getStorageUsage(): { bytes: number; label: string } {
  const scopeKey = getScopeKey();
  migrateLegacyGuestHistory(scopeKey);

  let total = 0;
  try {
    const idxRaw = localStorage.getItem(getIndexKey(scopeKey));
    if (idxRaw) total += idxRaw.length * 2; // UTF-16

    const list = read<ConversationMeta[]>(getIndexKey(scopeKey), []);
    for (const conv of list) {
      const msgRaw = localStorage.getItem(getMessageKey(scopeKey, conv.id));
      if (msgRaw) total += msgRaw.length * 2;
    }
  } catch {
    /* ignore */
  }

  if (total < 1024) return { bytes: total, label: `${total} B` };
  if (total < 1024 * 1024) return { bytes: total, label: `${(total / 1024).toFixed(1)} KB` };
  return { bytes: total, label: `${(total / (1024 * 1024)).toFixed(1)} MB` };
}
