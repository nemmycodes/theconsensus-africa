import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SuperAdminHeader from "./SuperAdminHeader";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend,
} from "recharts";

const COLORS = ["#f59e0b", "#10b981", "#6366f1", "#ef4444", "#06b6d4", "#ec4899"];

const SuperAdminAnalytics = () => {
  const [roleData, setRoleData] = useState<{ name: string; value: number }[]>([]);
  const [postsByCategory, setPostsByCategory] = useState<{ name: string; count: number }[]>([]);
  const [updatesByCategory, setUpdatesByCategory] = useState<{ name: string; count: number }[]>([]);
  const [registrationTrend, setRegistrationTrend] = useState<{ date: string; count: number }[]>([]);
  const [eventsByType, setEventsByType] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [rolesRes, postsRes, updatesRes, profilesRes, eventsRes] = await Promise.all([
        supabase.from("user_roles").select("role"),
        supabase.from("blog_posts").select("category"),
        supabase.from("situation_updates").select("category"),
        supabase.from("profiles").select("created_at"),
        supabase.from("events").select("event_type"),
      ]);

      // Roles distribution
      const roles = rolesRes.data || [];
      const roleCounts: Record<string, number> = {};
      roles.forEach((r) => {
        roleCounts[r.role] = (roleCounts[r.role] || 0) + 1;
      });
      setRoleData(Object.entries(roleCounts).map(([name, value]) => ({ name, value })));

      // Posts by category
      const posts = postsRes.data || [];
      const postCats: Record<string, number> = {};
      posts.forEach((p) => {
        postCats[p.category] = (postCats[p.category] || 0) + 1;
      });
      setPostsByCategory(Object.entries(postCats).map(([name, count]) => ({ name, count })));

      // Updates by category
      const updates = updatesRes.data || [];
      const updateCats: Record<string, number> = {};
      updates.forEach((u) => {
        updateCats[u.category] = (updateCats[u.category] || 0) + 1;
      });
      setUpdatesByCategory(Object.entries(updateCats).map(([name, count]) => ({ name, count })));

      // Registration trend (last 30 days)
      const profiles = profilesRes.data || [];
      const dayMap: Record<string, number> = {};
      const now = new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        dayMap[d.toISOString().slice(0, 10)] = 0;
      }
      profiles.forEach((p) => {
        const day = p.created_at.slice(0, 10);
        if (dayMap[day] !== undefined) dayMap[day]++;
      });
      setRegistrationTrend(Object.entries(dayMap).map(([date, count]) => ({ date: date.slice(5), count })));

      // Events by type
      const events = eventsRes.data || [];
      const evtTypes: Record<string, number> = {};
      events.forEach((e) => {
        evtTypes[e.event_type] = (evtTypes[e.event_type] || 0) + 1;
      });
      setEventsByType(Object.entries(evtTypes).map(([name, count]) => ({ name, count })));
    };
    fetchData();
  }, []);

  return (
    <div>
      <SuperAdminHeader title="Analytics & Statistics" subtitle="Comprehensive data insights across the entire platform" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Trend */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wide">User Registrations (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={registrationTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" fontSize={11} tick={{ fill: "#6b7280" }} />
                <YAxis fontSize={11} tick={{ fill: "#6b7280" }} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Role Distribution */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wide">Role Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={roleData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`} fontSize={12}>
                  {roleData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Posts by Category */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wide">Blog Posts by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={postsByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" fontSize={11} tick={{ fill: "#6b7280" }} />
                <YAxis fontSize={11} tick={{ fill: "#6b7280" }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Situation Updates by Category */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wide">Situation Updates by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={updatesByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" fontSize={11} tick={{ fill: "#6b7280" }} />
                <YAxis fontSize={11} tick={{ fill: "#6b7280" }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Events by Type */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wide">Events by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={eventsByType} cx="50%" cy="50%" outerRadius={90} dataKey="count" label={({ name, count }) => `${name}: ${count}`} fontSize={12}>
                  {eventsByType.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminAnalytics;
