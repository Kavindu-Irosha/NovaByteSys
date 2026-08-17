"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { calculateMemberSplit, groupProjectsByTimeFrame, groupProjectsByService, MEMBER_COUNT } from "../lib/finance";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DollarSign, Briefcase, TrendingUp, CreditCard } from "lucide-react";

export default function DashboardClient({ initialProjects, initialSubscriptions }) {
  
  let totalRevenue = 0;
  let monthlyRevenue = 0;
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  initialProjects.forEach(p => {
    totalRevenue += (p.price || 0);
    const date = new Date(p.completedAt);
    if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
      monthlyRevenue += (p.price || 0);
    }
  });

  // Calculate Subscriptions Expense (Total per month * 12 for yearly, or simplified to just standard sum)
  let totalExpenses = 0;
  initialSubscriptions.forEach(sub => {
    // For simplicity, we deduct the literal cost they entered (either monthly or yearly).
    // In a full accounting app, you'd amortize yearly over months.
    totalExpenses += (sub.cost || 0);
  });

  const memberSplit = calculateMemberSplit(totalRevenue, totalExpenses);
  const chartData = groupProjectsByTimeFrame(initialProjects, "monthly");
  const serviceData = groupProjectsByService(initialProjects);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses (Subs)</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">Rs. {totalExpenses.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {monthlyRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{initialProjects.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics & Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue progression</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rs.${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line type="monotone" dataKey="totalRevenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Member Equity Split</CardTitle>
              <CardDescription>Equal division among {MEMBER_COUNT} members</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((member) => (
                <div key={member} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg border border-muted">
                  <span className="font-medium">Member {member}</span>
                  <span className="font-bold text-primary">Rs. {memberSplit.toLocaleString()}</span>
                </div>
              ))}
              <p className="text-xs text-muted-foreground text-center mt-4 pt-4 border-t border-muted">
                Based on Net Profit: Rs. {(totalRevenue - totalExpenses).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          
          <Card>
             <CardHeader>
              <CardTitle>Projects by Service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
               {serviceData.length === 0 ? (
                 <p className="text-sm text-muted-foreground text-center">No projects yet.</p>
               ) : (
                 serviceData.map((s, i) => (
                   <div key={i} className="flex justify-between text-sm">
                     <span className="text-muted-foreground">{s.name}</span>
                     <span className="font-medium">{s.count}</span>
                   </div>
                 ))
               )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
