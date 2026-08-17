"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { groupProjectsByTimeFrame, calculateMemberSplit } from "../lib/finance";
import { FileText, Download, UploadCloud, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { storage } from "../lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL, listAll } from "firebase/storage";

export default function ReportsClient({ initialProjects, initialSubscriptions }) {
  const [timeFrame, setTimeFrame] = useState("monthly");
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  
  // Calculate total monthly/yearly expenses to deduct per report period
  // For precise accounting this would map exact dates, but we use a simplified approach here
  const totalExpenses = useMemo(() => {
    return initialSubscriptions.reduce((acc, sub) => acc + (sub.cost || 0), 0);
  }, [initialSubscriptions]);

  const reportData = useMemo(() => {
    return groupProjectsByTimeFrame(initialProjects, timeFrame);
  }, [initialProjects, timeFrame]);

  useEffect(() => {
    fetchUploadedPDFs();
  }, []);

  const fetchUploadedPDFs = async () => {
    try {
      const listRef = ref(storage, 'audits/');
      const res = await listAll(listRef);
      const files = await Promise.all(res.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return { name: itemRef.name, url };
      }));
      setUploadedFiles(files);
    } catch (error) {
      console.error("Error fetching PDFs", error);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`NovaByte Financial Audit (${timeFrame.toUpperCase()})`, 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Total Active Subscriptions Expense: Rs. ${totalExpenses.toLocaleString()}`, 14, 36);

    const tableColumn = ["Period", "Projects Completed", "Gross Revenue (Rs.)", "Net Profit (Rs.)", "Member Split (Rs.)"];
    const tableRows = [];

    reportData.forEach(data => {
      const netProfit = data.totalRevenue - totalExpenses;
      const split = calculateMemberSplit(data.totalRevenue, totalExpenses);
      tableRows.push([
        data.name,
        data.count.toString(),
        data.totalRevenue.toLocaleString(),
        netProfit.toLocaleString(),
        split.toLocaleString()
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 42,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [16, 185, 129] } // emerald-500 matching Green Mist theme
    });

    doc.save(`novabyte_audit_${timeFrame}.pdf`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== "application/pdf") {
      alert("Please upload a valid PDF file.");
      return;
    }

    setUploading(true);
    const storageRef = ref(storage, `audits/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      null,
      (error) => {
        console.error("Upload failed", error);
        setUploading(false);
      },
      () => {
        setUploading(false);
        fetchUploadedPDFs();
      }
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Reports</h1>
          <p className="text-muted-foreground">Review financial performance, upload external audits, and generate PDFs.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex bg-muted p-1 rounded-md h-10">
            <Button variant={timeFrame === "daily" ? "default" : "ghost"} size="sm" onClick={() => setTimeFrame("daily")}>Daily</Button>
            <Button variant={timeFrame === "weekly" ? "default" : "ghost"} size="sm" onClick={() => setTimeFrame("weekly")}>Weekly</Button>
            <Button variant={timeFrame === "monthly" ? "default" : "ghost"} size="sm" onClick={() => setTimeFrame("monthly")}>Monthly</Button>
          </div>
          <Button onClick={generatePDF} className="h-10">
            <Download className="mr-2 h-4 w-4" />
            Generate PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generated Reports Section */}
        <div className="lg:col-span-2 space-y-6">
          {reportData.length === 0 ? (
            <Card className="border-muted shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <FileText className="h-12 w-12 mb-4 opacity-20" />
                <p>No data available for the selected timeframe.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reportData.map((data, index) => {
                const split = calculateMemberSplit(data.totalRevenue, totalExpenses);
                return (
                  <Card key={index} className="shadow-sm border-muted">
                    <CardHeader className="pb-3 border-b border-muted">
                      <CardTitle className="text-lg">{data.name}</CardTitle>
                      <CardDescription>{data.count} Project(s) Completed</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-sm font-medium text-muted-foreground">Gross Revenue</span>
                        <span className="text-xl font-bold text-primary">Rs. {data.totalRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-end border-b border-muted pb-2">
                        <span className="text-sm font-medium text-muted-foreground">Expenses Deduction</span>
                        <span className="text-md font-bold text-destructive">- Rs. {totalExpenses.toLocaleString()}</span>
                      </div>
                      
                      <div className="pt-2">
                        <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-2">Member Distribution</h4>
                        <div className="space-y-2">
                          {[1, 2, 3].map((member) => (
                            <div key={member} className="flex justify-between text-sm p-2 bg-muted/50 rounded">
                              <span>Member {member}</span>
                              <span className="font-medium">Rs. {split.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Uploaded Audits Section */}
        <div className="space-y-6">
          <Card className="shadow-sm border-muted">
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <UploadCloud className="h-5 w-5" /> External PDF Audits
               </CardTitle>
               <CardDescription>Upload accounting or third-party PDF reports</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="relative">
                 <Input type="file" accept="application/pdf" onChange={handleFileUpload} disabled={uploading} className="cursor-pointer file:cursor-pointer" />
                 {uploading && <Loader2 className="absolute right-3 top-2.5 h-5 w-5 animate-spin text-muted-foreground" />}
               </div>
               
               <div className="space-y-2 pt-4">
                 <h4 className="text-sm font-medium text-muted-foreground mb-3">Available Documents</h4>
                 {uploadedFiles.length === 0 ? (
                   <p className="text-sm text-muted-foreground">No PDFs uploaded yet.</p>
                 ) : (
                   uploadedFiles.map((file, i) => (
                     <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-md text-sm border border-muted hover:border-primary transition-colors">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="h-4 w-4 shrink-0 text-primary" />
                          <span className="truncate">{file.name.replace(/^\d+_/, '')}</span>
                        </div>
                        <a href={file.url} target="_blank" rel="noreferrer" className="text-primary hover:underline shrink-0 text-xs font-medium ml-2">
                          View
                        </a>
                     </div>
                   ))
                 )}
               </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
