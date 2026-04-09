import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import managerService from "@/services/manager.service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, XCircle } from "lucide-react";
import type { ExtensionRequest } from "@/types";

type RejectionFormData = {
  rejectionReason: string;
};

export default function ManagerExtensions() {
  const [extensions, setExtensions] = useState<ExtensionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedExtension, setSelectedExtension] =
    useState<ExtensionRequest | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const rejectionForm = useForm<RejectionFormData>();

  useEffect(() => {
    fetchExtensions();
  }, []);

  const fetchExtensions = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      console.log("[ManagerExt] Fetching extensions...");
      const response = await managerService.getPendingExtensionRequests();
      console.log("[ManagerExt] Got response:", response);
      if (response.data && response.data.length > 0) {
        console.log("[ManagerExt] First extension data:", response.data[0]);
        console.log("[ManagerExt] Student:", response.data[0].laptopIssue?.student);
        console.log("[ManagerExt] Laptop Issue:", response.data[0].laptopIssue);
      }
      setExtensions(response.data || []);
    } catch (error: any) {
      console.error("[ManagerExt] Error fetching:", error);
      setLoadError("Failed to load extension requests");
      setExtensions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm("Approve this extension request?")) return;
    try {
      console.log("[ManagerExt] Approving extension:", id);
      await managerService.approveExtensionRequest(id);
      toast.success("Extension request approved successfully");
      console.log("[ManagerExt] Approved, refetching...");
      fetchExtensions();
    } catch (error: any) {
      console.error("[ManagerExt] Approve error:", error);
      toast.error(
        error.response?.data?.message || "Failed to approve extension"
      );
    }
  };

  const handleReject = async (data: RejectionFormData) => {
    if (!selectedExtension) return;
    try {
      setSubmitting(true);
      console.log("[ManagerExt] Rejecting extension:", selectedExtension.id);
      await managerService.rejectExtensionRequest(
        selectedExtension.id,
        data.rejectionReason
      );
      toast.success("Extension request rejected successfully");
      setRejectDialogOpen(false);
      rejectionForm.reset();
      setSelectedExtension(null);
      console.log("[ManagerExt] Rejected, refetching...");
      fetchExtensions();
    } catch (error: any) {
      console.error("[ManagerExt] Reject error:", error);
      toast.error(
        error.response?.data?.message || "Failed to reject extension"
      );
    } finally {
      setSubmitting(false);
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
            Review and manage laptop return extension requests
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
            Review and manage laptop return extension requests
          </p>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-destructive mb-4">{loadError}</p>
              <Button onClick={fetchExtensions}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main render
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Extension Requests
        </h2>
        <p className="text-muted-foreground">
          Review and manage laptop return extension requests
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Extensions ({extensions.length})</CardTitle>
          <CardDescription>Extension requests awaiting review</CardDescription>
        </CardHeader>
        <CardContent>
          {extensions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending extension requests.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Laptop</TableHead>
                  <TableHead>Issued Date</TableHead>
                  <TableHead>Expected Deadline</TableHead>
                  <TableHead>Times Extended</TableHead>
                  <TableHead>Days Requested</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {extensions.map((ext) => (
                  <TableRow key={ext.id}>
                    <TableCell>
                      <div className="font-medium">{ext.laptopIssue?.student?.fullName || "N/A"}</div>
                      <div className="text-sm text-muted-foreground">
                        {ext.laptopIssue?.student?.registrationNumber || "N/A"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {ext.laptopIssue?.student?.email || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">
                        {ext.laptopIssue?.laptop?.brand} {ext.laptopIssue?.laptop?.model || "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        S/N: {ext.laptopIssue?.laptop?.serialNumber || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {ext.laptopIssue?.issueDate ? new Date(ext.laptopIssue.issueDate).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell>
                      {ext.laptopIssue?.currentReturnDeadline ? new Date(ext.laptopIssue.currentReturnDeadline).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="text-center font-medium">
                        {ext.laptopIssue?.extensionCount || 0}
                      </div>
                    </TableCell>
                    <TableCell>{ext.extensionDays} days</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {ext.reason}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(ext.status || "PENDING")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        {ext.status === "PENDING" ? (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => {
                                console.log("[ManagerExt] Approve clicked for:", ext.id);
                                handleApprove(ext.id);
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                console.log("[ManagerExt] Reject clicked for:", ext.id);
                                setSelectedExtension(ext);
                                setRejectDialogOpen(true);
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {ext.status}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedExtension && (
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Extension Request</DialogTitle>
              <DialogDescription>
                Provide a reason for rejecting this extension request
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={rejectionForm.handleSubmit(handleReject)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Student</Label>
                <p className="text-sm font-medium">
                  {selectedExtension.laptopIssue?.student?.fullName || "N/A"}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Extension Requested</Label>
                <p className="text-sm">{selectedExtension.extensionDays} days</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rejectionReason">
                  Rejection Reason *
                </Label>
                <Textarea
                  id="rejectionReason"
                  placeholder="Explain why this extension is being rejected..."
                  rows={4}
                  {...rejectionForm.register("rejectionReason", {
                    required: "Rejection reason is required",
                    minLength: {
                      value: 10,
                      message: "Reason must be at least 10 characters",
                    },
                  })}
                />
                {rejectionForm.formState.errors.rejectionReason && (
                  <p className="text-sm text-destructive">
                    {rejectionForm.formState.errors.rejectionReason.message}
                  </p>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRejectDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Rejecting..." : "Reject Request"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
