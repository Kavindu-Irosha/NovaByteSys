"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Loader2, Trash2, Cpu } from "lucide-react";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

export default function SubscriptionsClient({ initialSubscriptions = [] }) {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let unsub = () => {};
    try {
      unsub = onSnapshot(collection(db, "subscriptions"), (snapshot) => {
        const docs = snapshot.docs.map(doc => {
          const data = doc.data();
          let cAt = "N/A";
          if (data.createdAt) {
            if (typeof data.createdAt.toDate === "function") {
              try { cAt = data.createdAt.toDate().toLocaleDateString(); } catch(e){}
            } else if (typeof data.createdAt === "string") {
              cAt = data.createdAt;
            }
          }
          return { id: doc.id, ...data, createdAt: cAt };
        });
        setSubscriptions(docs);
      }, (err) => console.error("Subscriptions snapshot error:", err));
    } catch(e) {
      console.error("Subscriptions sync error:", e);
    }
    return () => unsub();
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    toolName: "",
    planName: "",
    cost: 0,
    cycle: "monthly",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "subscriptions"), {
        toolName: formData.toolName,
        planName: formData.planName,
        cost: Number(formData.cost),
        cycle: formData.cycle,
        createdAt: serverTimestamp(),
      });
      setShowForm(false);
      setFormData({
        toolName: "",
        planName: "",
        cost: 0,
        cycle: "monthly",
      });
    } catch (error) {
      console.error("Error adding subscription: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to remove this subscription?")) {
      try {
        await deleteDoc(doc(db, "subscriptions", id));
      } catch (error) {
        console.error("Error deleting document: ", error);
      }
    }
  };

  // Table Configuration
  const columns = [
    { header: "Tool Name", accessorKey: "toolName" },
    { header: "Plan", accessorKey: "planName" },
    { header: "Billing Cycle", accessorKey: "cycle", cell: info => <span className="capitalize">{info.getValue()}</span> },
    { 
      header: "Cost", 
      accessorKey: "cost",
      cell: info => `Rs. ${(info.getValue() || 0).toLocaleString()}`
    },
    { header: "Added On", accessorKey: "createdAt" },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="icon" onClick={() => handleDelete(row.original.id)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      )
    }
  ];

  const table = useReactTable({
    data: subscriptions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground">Manage your AI and Dev Tool recurring expenses.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          {showForm ? "Cancel" : "Add Subscription"}
        </Button>
      </div>

      {showForm && (
        <Card className="shadow-sm border-muted animate-in fade-in zoom-in-95 duration-200">
          <CardHeader>
            <CardTitle>Log New Subscription</CardTitle>
            <CardDescription>Enter details of the tool/service you subscribed to.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tool Name</label>
                <Input required value={formData.toolName} onChange={e => setFormData({...formData, toolName: e.target.value})} placeholder="e.g. ChatGPT Plus, Vercel" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Plan Name</label>
                <Input required value={formData.planName} onChange={e => setFormData({...formData, planName: e.target.value})} placeholder="e.g. Pro, Team" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cost (Rs.)</label>
                <Input required type="number" min="0" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} placeholder="2000" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Billing Cycle</label>
                <select value={formData.cycle} onChange={e => setFormData({...formData, cycle: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2 flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Subscription
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm border-muted">
        <CardHeader>
          <CardTitle>Active Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
               <Cpu className="h-10 w-10 mb-2 opacity-20" />
               <p>No active subscriptions tracked.</p>
            </div>
          ) : (
            <div className="rounded-md border border-muted overflow-x-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b [&_tr]:border-muted">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      {headerGroup.headers.map((header) => (
                        <th key={header.id} className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="border-b border-muted transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="p-4 align-middle">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
