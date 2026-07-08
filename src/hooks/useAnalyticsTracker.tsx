import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const COOKIE_NAME = "tpc_vid";
const COOKIE_DAYS = 365;

function getCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : null;
}
function setCookie(name: string, value: string, days: number) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${d.toUTCString()}; path=/; SameSite=Lax`;
}

export function getOrCreateVisitorId(): string {
  let vid = getCookie(COOKIE_NAME) || localStorage.getItem(COOKIE_NAME);
  if (!vid) {
    vid = (crypto.randomUUID?.() || `v-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    setCookie(COOKIE_NAME, vid, COOKIE_DAYS);
    localStorage.setItem(COOKIE_NAME, vid);
  } else {
    setCookie(COOKIE_NAME, vid, COOKIE_DAYS);
  }
  return vid;
}

export function getClientContext() {
  const ua = navigator.userAgent;
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(ua);
  const isTablet = /iPad|Tablet/i.test(ua);
  const device_type = isTablet ? "tablet" : isMobile ? "mobile" : "desktop";
  let browser = "Other";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/Chrome\//i.test(ua)) browser = "Chrome";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Safari\//i.test(ua)) browser = "Safari";
  let os = "Other";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS/i.test(ua)) os = "macOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iOS/i.test(ua)) os = "iOS";
  else if (/Linux/i.test(ua)) os = "Linux";
  return {
    device_type, browser, os,
    screen_size: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language,
    user_agent: ua,
  };
}

export function AnalyticsTracker() {
  const location = useLocation();
  const lastPath = useRef<string>("");

  useEffect(() => {
    if (lastPath.current === location.pathname) return;
    lastPath.current = location.pathname;

    // Skip admin dashboards
    if (/^\/(admin|super-admin|agent)(\/|$)/.test(location.pathname)) return;

    const visitor_id = getOrCreateVisitorId();
    const params = new URLSearchParams(location.search);
    const ctx = getClientContext();

    supabase.auth.getUser().then(({ data }) => {
      supabase.functions.invoke("track-visitor", {
        body: {
          visitor_id,
          user_id: data?.user?.id || null,
          event_type: "pageview",
          path: location.pathname,
          referrer: document.referrer || null,
          utm_source: params.get("utm_source"),
          utm_medium: params.get("utm_medium"),
          utm_campaign: params.get("utm_campaign"),
          utm_term: params.get("utm_term"),
          utm_content: params.get("utm_content"),
          ...ctx,
        },
      }).catch(() => { /* silent */ });
    });
  }, [location.pathname, location.search]);

  return null;
}
