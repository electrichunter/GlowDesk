// GlowDesk — Automatic Error Logger & System Monitor

import { safeJsonParse } from "@/lib/sanitize";

export interface SystemLog {
  id: string;
  type: "ERROR" | "WARNING" | "INFO";
  message: string;
  stack?: string;
  source?: string;
  timestamp: string;
  path?: string;
}

const STORAGE_KEY = "glowdesk_system_errors";

class Logger {
  private logs: SystemLog[] = [];

  constructor() {
    if (typeof window !== "undefined") {
      this.loadLogs();
      this.initGlobalListeners();
    }
  }

  private loadLogs() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      this.logs = safeJsonParse<SystemLog[]>(data, []);
    } catch {
      this.logs = [];
    }
  }

  private saveLogs() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.logs.slice(0, 100)));
    } catch {
      // localStorage full or disabled
    }
  }

  private initGlobalListeners() {
    window.addEventListener("error", (event) => {
      this.error(
        event.message || "Bilinmeyen Tarayıcı Hatası",
        event.error?.stack,
        event.filename ? `${event.filename}:${event.lineno}` : "Global"
      );
    });

    window.addEventListener("unhandledrejection", (event) => {
      this.error(
        `Yakalanmamış Promise Hatası: ${event.reason?.message || event.reason || "Bilinmeyen Sebep"}`,
        event.reason?.stack,
        "Promise Rejection"
      );
    });
  }

  public error(message: string, stack?: string, source?: string) {
    const newLog: SystemLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: "ERROR",
      message,
      stack,
      source: source || "App",
      timestamp: new Date().toISOString(),
      path: typeof window !== "undefined" ? window.location.pathname : "/",
    };

    this.logs.unshift(newLog);
    this.saveLogs();
    console.error("🔴 [GlowDesk Error Logger]:", message, stack);
  }

  public info(message: string, source?: string) {
    const newLog: SystemLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: "INFO",
      message,
      source: source || "App",
      timestamp: new Date().toISOString(),
      path: typeof window !== "undefined" ? window.location.pathname : "/",
    };

    this.logs.unshift(newLog);
    this.saveLogs();
  }

  public getLogs(): SystemLog[] {
    this.loadLogs();
    return this.logs;
  }

  public clearLogs() {
    this.logs = [];
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

export const logger = new Logger();
