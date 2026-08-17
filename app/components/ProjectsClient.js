"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SERVICES, PACKAGES } from "../lib/constants";
import { Plus, Loader2 } from "lucide-react";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

export default function ProjectsClient({ initialProjects }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    projectName: "",
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    service: Object.values(SERVICES)[0],
    packageChosen: "",
    price: 0,
    advanceMoney: 0,
  });

  const handleServiceChange = (e) => {
    const service = e.target.value;
    const defaultPackage = PACKAGES[service]?.[0];
    setFormData({
      ...formData,
      service,
      packageChosen: defaultPackage?.name || "",
      price: defaultPackage?.price || 0,
    });
  };

  const handlePackageChange = (e) => {
    const pkgName = e.target.value;
    const selectedPkg = PACKAGES[formData.service]?.find(p => p.name === pkgName);
    setFormData({
      ...formData,
      packageChosen: pkgName,
      price: selectedPkg ? selectedPkg.price : formData.price,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "projects"), {
        projectName: formData.projectName,
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        clientEmail: formData.clientEmail,
        service: formData.service,
        packageChosen: formData.packageChosen,
        price: Number(formData.price),
        advanceMoney: Number(formData.advanceMoney),
        completedAt: serverTimestamp(),
      });
      setShowForm(false);
      setFormData({
        projectName: "",
        clientName: "",
        clientPhone: "",
        clientEmail: "",
        service: Object.values(SERVICES)[0],
        packageChosen: "",
        price: 0,
        advanceMoney: 0
      });
      // Refresh the page data from server
      router.refresh();
    } catch (error) {
      console.error("Error adding document: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Table Configuration
  const columns = [
    { header: "Project Name", accessorKey: "projectName" },
    { 
      header: "Client", 
      accessorKey: "clientName",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.clientName}</p>
          {(row.original.clientEmail || row.original.clientPhone) && (
            <div className="text-xs text-muted-foreground">
              {row.original.clientEmail} {row.original.clientEmail && row.original.clientPhone && "•"} {row.original.clientPhone}
            </div>
          )}
        </div>
      )
    },
    { header: "Service", accessorKey: "service" },
    { header: "Package", accessorKey: "packageChosen" },
    { 
      header: "Revenue", 
      accessorKey: "price",
      cell: info => `Rs. ${(info.getValue() || 0).toLocaleString()}`
    },
    { 
      header: "Advance", 
      accessorKey: "advanceMoney",
      cell: info => <span className="text-muted-foreground">Rs. {(info.getValue() || 0).toLocaleString()}</span>
    },
    { header: "Date", accessorKey: "completedAt" },
  ];

  const table = useReactTable({
    data: initialProjects,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects Ledger</h1>
          <p className="text-muted-foreground">Manage and track your completed client projects.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          {showForm ? "Cancel" : "Add Project"}
        </Button>
      </div>

      {showForm && (
        <Card className="shadow-sm border-muted animate-in fade-in zoom-in-95 duration-200">
          <CardHeader>
            <CardTitle>Log Completed Project</CardTitle>
            <CardDescription>Enter the details of the successfully delivered project to update company networth.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Name</label>
                <Input required value={formData.projectName} onChange={e => setFormData({...formData, projectName: e.target.value})} placeholder="e.g. Acme Corp Redesign" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Client Name</label>
                <Input required value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} placeholder="e.g. John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Client Email</label>
                <Input type="email" value={formData.clientEmail} onChange={e => setFormData({...formData, clientEmail: e.target.value})} placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Client Phone</label>
                <Input type="tel" value={formData.clientPhone} onChange={e => setFormData({...formData, clientPhone: e.target.value})} placeholder="+94 77 123 4567" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Service Category</label>
                <select value={formData.service} onChange={handleServiceChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  {Object.values(SERVICES).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Pricing Package</label>
                <select value={formData.packageChosen} onChange={handlePackageChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="" disabled>Select Package</option>
                  {PACKAGES[formData.service]?.map(pkg => <option key={pkg.name} value={pkg.name}>{pkg.name} (Rs. {pkg.price.toLocaleString()})</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Total Price (Rs.)</label>
                <Input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Advance Money Received (Rs.)</label>
                <Input type="number" required value={formData.advanceMoney} onChange={e => setFormData({...formData, advanceMoney: e.target.value})} />
              </div>
              <div className="space-y-2 md:col-span-2 flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting || !formData.packageChosen}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save to Ledger
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm border-muted">
        <CardHeader>
          <CardTitle>Completed Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {initialProjects.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">No projects recorded yet. Add your first project!</p>
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
