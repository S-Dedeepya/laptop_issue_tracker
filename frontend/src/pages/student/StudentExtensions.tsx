import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import studentService from "@/services/student.service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import type { ExtensionRequest, LaptopIssue } from "@/types";
import { format } from "date-fns";

type ExtensionFormData = {
  laptopIssueId: number;
  reason: string;
  extensionDays: number;
};

export default function StudentExtensions() {
  console.log("[EXT] Component mounting");
  
  const [extensions, setExtensions] = useState<ExtensionRequest[]>([]);
  const [activeLaptop, setActiveLaptop] = useState<LaptopIssue | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ExtensionFormData>();

  useEffect(() => {
    console.log("[EXT] useEffect running");
    loadData();
  }, []);

  const loadData = async () => {
    console.log("[EXT] loadData() starting");
    try {
      setLoading(true);
      setLoadError(null);
      console.log("[EXT] About to fetch extensions...");
      
      const extensionsRes = await studentService.getMyExtensionRequests();
      console.log("[EXT] Got extensions:", extensionsRes);
      console.log("[EXT] Extensions data:", extensionsRes?.data);
      if (extensionsRes?.data && extensionsRes.data.length > 0) {
        console.log("[EXT] First extension:", extensionsRes.data[0]);
      }
      setExtensions(extensionsRes?.data || []);
      
      console.log("[EXT] About to fetch active laptop...");
      const laptopRes = await studentService.getMyActiveLaptopIssue();
      console.log("[EXT] Got laptop:", laptopRes);
      setActiveLaptop(laptopRes?.data || null);
      
      console.log("[EXT] Data loaded successfully");
    } catch (error: any) {
      console.error("[EXT] loadData error:", error.message);
      console.error("[EXT] Full error:", error);
      setLoadError("Failed to load data");
    } finally {
      setLoading(false);
      console.log("[EXT] loadData() complete, loading set to false");
    }
  };

  const onSubmit = async (data: ExtensionFormData) => {
    try {
      console.log("[Extensions] Submitting extension request:", data);
      setSubmitting(true);
      const response = await studentService.createExtensionRequest(data);
      console.log("[Extensions] Extension request response:", response);
      
      if (!response) {
        throw new Error("No response from server");
      }
      
      if (!response.success) {
        throw new Error(response.message || "Failed to create extension request");
      }
      
      toast.success(response.message || "Extension request submitted successfully");
      
      // Close dialog and reset form
      setDialogOpen(false);
      reset();
      
      console.log("[Extensions] Refreshing data after submission...");
      // Refresh data after a brief delay to ensure backend processed it
      await new Promise(resolve => setTimeout(resolve, 800));
      await loadData();
      console.log("[Extensions] Data refreshed successfully");
    } catch (error: any) {
      console.error("[Extensions] Submit error:", error);
      console.error("[Extensions] Error details:", {
        message: error?.message,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        stack: error?.stack,
      });
      const errorMsg = error.response?.data?.message || error.message || "Failed to create extension request";
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (open && activeLaptop) {
      reset({
        laptopIssueId: activeLaptop.id,
        reason: "",
        extensionDays: 1,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      PENDING: "secondary",
      APPROVED: "default",
      REJECTED: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Extension Requests
          </h2>
          <p className="text-muted-foreground">
            Manage your laptop return deadline extensions
          </p>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (loadError) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Extension Requests
          </h2>
          <p className="text-muted-foreground">
            Manage your laptop return deadline extensions
          </p>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-destructive mb-4">{loadError}</p>
              <Button onClick={loadData}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main render - SIMPLIFIED
  try {
    const canCreateExtension = activeLaptop && !activeLaptop.isReturned;
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Extension Requests
            </h2>
            <p className="text-muted-foreground">
              Manage your laptop return deadline extensions
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button disabled={!canCreateExtension}>
                <Plus className="mr-2 h-4 w-4" />
                New Extension
              </Button>
            </DialogTrigger>
            {!canCreateExtension && (
              <p className="text-sm text-muted-foreground mt-2">
                {activeLaptop
                  ? "You don't have an active laptop to request an extension for."
                  : "Request a laptop first before requesting an extension."}
              </p>
            )}
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Laptop Extension</DialogTitle>
                <DialogDescription>
                  Request additional time to return your laptop
                </DialogDescription>
              </DialogHeader>
              {activeLaptop ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="laptopIssueId">Laptop</Label>
                    <Input
                      id="laptopIssueId"
                      value={`${activeLaptop.laptop.brand} ${activeLaptop.laptop.model} (${activeLaptop.laptop.serialNumber})`}
                      disabled
                    />
                    <input
                      type="hidden"
                      {...register("laptopIssueId")}
                      value={activeLaptop.id}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="extensionDays">Days to Extend</Label>
                    <Input
                      id="extensionDays"
                      type="number"
                      min="1"
                      max="30"
                      {...register("extensionDays", {
                        required: "Extension days is required",
                        min: { value: 1, message: "Must extend at least 1 day" },
                        max: { value: 30, message: "Cannot extend more than 30 days" },
                      })}
                    />
                    {errors.extensionDays && (
                      <p className="text-sm text-destructive">
                        {errors.extensionDays.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason</Label>
                    <Textarea
                      id="reason"
                      placeholder="Explain why you need an extension..."
                      {...register("reason", {
                        required: "Reason is required",
                      })}
                    />
                    {errors.reason && (
                      <p className="text-sm text-destructive">
                        {errors.reason.message}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? "Submitting..." : "Submit Request"}
                    </Button>
                  </div>
                </form>
              ) : (
                <p className="text-muted-foreground">
                  You don't have an active laptop to request an extension for.
                </p>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Extension History</CardTitle>
            <CardDescription>All your extension requests</CardDescription>
          </CardHeader>
          <CardContent>
            {extensions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No extension requests yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Laptop</TableHead>
                    <TableHead>No. of Days to Extend</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extensions.map((ext) => {
                    // Use laptop details from the extension request itself, not just the active laptop
                    const laptop = ext.laptopIssue?.laptop;
                    const laptopDetails = laptop ? `${laptop.brand} ${laptop.model} (${laptop.serialNumber})` : "N/A";
                    return (
                      <TableRow key={ext.id}>
                        <TableCell>{laptopDetails}</TableCell>
                        <TableCell>{ext.extensionDays || "N/A"}</TableCell>
                        <TableCell>{ext.reason || "N/A"}</TableCell>
                        <TableCell>{getStatusBadge(ext.status || "PENDING")}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    );
  } catch (err: any) {
    console.error("[EXT] Render error:", err);
    return (
      <div style={{ padding: "20px", backgroundColor: "#ffe0e0" }}>
        <h1>Error Rendering Page</h1>
        <p>{err?.message}</p>
        <p>{err?.stack}</p>
        <button onClick={() => window.location.reload()}>Reload Page</button>
      </div>
    );
  }
}
