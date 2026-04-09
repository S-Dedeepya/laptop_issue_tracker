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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { CheckCircle, XCircle } from "lucide-react";
import type { LaptopRequest, Laptop } from "@/types";
import { format } from "date-fns";

type ApprovalFormData = {
  issueDate: string;
  approveRequestedDate: boolean;
  returnDeadline: string;
  returnDateReason?: string;
};

type RejectionFormData = {
  rejectionReason: string;
};

export default function ManagerLaptopRequests() {
  const [requests, setRequests] = useState<LaptopRequest[]>([]);
  const [availableLaptops, setAvailableLaptops] = useState<Laptop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<LaptopRequest | null>(
    null
  );
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [approveWithOverride, setApproveWithOverride] = useState(false);

  const approvalForm = useForm<ApprovalFormData>({
    defaultValues: {
      issueDate: format(new Date(), "yyyy-MM-dd"),
      approveRequestedDate: true,
      returnDeadline: "",
      returnDateReason: "",
    },
  });

  const rejectionForm = useForm<RejectionFormData>();

  useEffect(() => {
    fetchRequests();
    fetchAvailableLaptops();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      // Only show pending requests so approved/rejected drop off the list
      const response = await managerService.getPendingLaptopRequests();
      setRequests(response.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableLaptops = async () => {
    try {
      const response = await managerService.getAvailableLaptops();
      setAvailableLaptops(response.data || []);
    } catch (error) {
      console.error("Failed to fetch available laptops");
    }
  };

  const handleApprove = async (data: ApprovalFormData) => {
    if (!selectedRequest) return;
    if (!selectedRequest.selectedLaptop) {
      toast.error("No laptop selected by student");
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Validate approved return date if manager is overriding student's request
      if (!data.approveRequestedDate && selectedRequest.requestedReturnDate) {
        const managerDate = new Date(data.returnDeadline);
        const studentDate = new Date(selectedRequest.requestedReturnDate);
        const requestDate = new Date(selectedRequest.requestDate);
        
        // Manager date must be BETWEEN request date and student's requested return date
        if (managerDate < requestDate) {
          toast.error("Approved return date cannot be before the request date");
          return;
        }
        
        if (managerDate >= studentDate) {
          toast.error("Approved return date must be earlier than the student's requested return date");
          return;
        }
      }
      
      const returnDeadline = data.approveRequestedDate
        ? selectedRequest.requestedReturnDate
        : data.returnDeadline;
      
      const approvalData = {
        issueDate: data.issueDate,
        approveRequestedDate: data.approveRequestedDate,
        returnDeadline: returnDeadline,
        returnDateReason: data.returnDateReason,
      };
      
      await managerService.approveLaptopRequest(selectedRequest.id, approvalData);
      toast.success("Request approved and laptop issued successfully");
      setApproveDialogOpen(false);
      approvalForm.reset();
      setSelectedRequest(null);
      setApproveWithOverride(false);
      fetchRequests();
      fetchAvailableLaptops();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (data: RejectionFormData) => {
    if (!selectedRequest) return;
    try {
      setSubmitting(true);
      await managerService.rejectLaptopRequest(
        selectedRequest.id,
        data.rejectionReason
      );
      toast.success("Request rejected successfully");
      setRejectDialogOpen(false);
      rejectionForm.reset();
      setSelectedRequest(null);
      fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reject request");
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Laptop Requests</h2>
        <p className="text-muted-foreground">
          Review and manage student laptop requests
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Laptop Requests ({requests.length})</CardTitle>
          <CardDescription>Only requests waiting for your decision</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending requests at the moment.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Requested Return</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Registration</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Requested Spec</TableHead>
                  <TableHead>Requested Laptop</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      {format(new Date(request.requestDate), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      {request.requestedReturnDate ? format(new Date(request.requestedReturnDate), "MMM dd, yyyy") : "—"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {request.student.fullName}
                    </TableCell>
                    <TableCell>{request.student.registrationNumber}</TableCell>
                    <TableCell className="max-w-md truncate">
                      {request.reason}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {request.selectedLaptopSpecification ? (
                        <div className="text-sm">
                          <p className="truncate">{request.selectedLaptopSpecification}</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {request.selectedLaptop ? (
                        <div className="text-sm space-y-0.5">
                          <p className="font-semibold">
                            {request.selectedLaptop.brand} {request.selectedLaptop.model}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Serial: {request.selectedLaptop.serialNumber}
                          </p>
                          {request.selectedLaptop.gpuSpecification && (
                            <p className="text-xs text-muted-foreground truncate">
                              GPU: {request.selectedLaptop.gpuSpecification}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Dialog
                          open={
                            approveDialogOpen &&
                            selectedRequest?.id === request.id
                          }
                          onOpenChange={(open) => {
                            setApproveDialogOpen(open);
                            if (open) {
                              approvalForm.reset({
                                issueDate: format(new Date(), "yyyy-MM-dd"),
                                approveRequestedDate: true,
                                returnDeadline: request.requestedReturnDate || "",
                                returnDateReason: "",
                              });
                              setApproveWithOverride(false);
                            } else {
                              setSelectedRequest(null);
                              setApproveWithOverride(false);
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => setSelectedRequest(request)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>
                                Approve Request & Issue Laptop
                              </DialogTitle>
                              <DialogDescription>
                                Review the student's target return date and set your approved return date
                              </DialogDescription>
                            </DialogHeader>
                            <form
                              onSubmit={approvalForm.handleSubmit(
                                handleApprove
                              )}
                              className="space-y-4"
                            >
                              <div className="space-y-2">
                                <Label>Student</Label>
                                <p className="text-sm font-medium">
                                  {request.student.fullName}
                                </p>
                              </div>
                              {request.selectedLaptop && (
                                <div className="space-y-2">
                                  <Label>Student's Requested Laptop</Label>
                                  <div className="rounded-md border p-3 bg-muted/50">
                                    <p className="text-sm font-medium">
                                      {request.selectedLaptop.brand} {request.selectedLaptop.model}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Serial: {request.selectedLaptop.serialNumber}
                                    </p>
                                    {request.selectedLaptop.specifications && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {request.selectedLaptop.specifications}
                                      </p>
                                    )}
                                    {request.selectedLaptop.gpuSpecification && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        GPU: {request.selectedLaptop.gpuSpecification}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {request.requestedReturnDate && (
                                <div className="space-y-2">
                                  <Label>Student's Target Return Date</Label>
                                  <div className="rounded-md border p-3 bg-blue-50 border-blue-200">
                                    <p className="text-sm font-medium text-blue-900">
                                      {format(new Date(request.requestedReturnDate), "MMMM dd, yyyy")}
                                    </p>
                                    <p className="text-xs text-blue-700 mt-1">
                                      The student plans to return the laptop by this date.
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              <div className="space-y-3 border rounded-lg p-3 bg-muted/30">
                                <Label className="text-base">Do you approve this return date?</Label>
                                <div className="space-y-2">
                                  <label className="flex items-center gap-3 p-2 border rounded cursor-pointer hover:bg-muted/50">
                                    <input
                                      type="radio"
                                      checked={!approveWithOverride}
                                      onChange={() => {
                                        setApproveWithOverride(false);
                                        approvalForm.setValue("approveRequestedDate", true);
                                      }}
                                      className="h-4 w-4"
                                    />
                                    <span className="text-sm font-medium">
                                      ✓ Yes, approve the student's target date
                                    </span>
                                  </label>
                                  
                                  <label className="flex items-center gap-3 p-2 border rounded cursor-pointer hover:bg-muted/50">
                                    <input
                                      type="radio"
                                      checked={approveWithOverride}
                                      onChange={() => {
                                        setApproveWithOverride(true);
                                        approvalForm.setValue("approveRequestedDate", false);
                                      }}
                                      className="h-4 w-4"
                                    />
                                    <span className="text-sm font-medium">
                                      ✗ No, set an earlier approved return date
                                    </span>
                                  </label>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="issueDate">
                                    Issue Date *
                                  </Label>
                                  <Input
                                    id="issueDate"
                                    type="date"
                                    {...approvalForm.register("issueDate", {
                                      required: true,
                                    })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="returnDeadline">
                                    Approved Return Date *
                                  </Label>
                                  <Input
                                    id="returnDeadline"
                                    type="date"
                                    min={request.requestDate ? new Date(request.requestDate).toISOString().split('T')[0] : undefined}
                                    max={request.requestedReturnDate ? new Date(request.requestedReturnDate).toISOString().split('T')[0] : undefined}
                                    disabled={!approveWithOverride && !!request.requestedReturnDate}
                                    {...approvalForm.register(
                                      "returnDeadline",
                                      { required: true }
                                    )}
                                  />
                                  {!approveWithOverride && request.requestedReturnDate && (
                                    <p className="text-xs text-muted-foreground">
                                      Will use: {format(new Date(request.requestedReturnDate), "MMM dd, yyyy")}
                                    </p>
                                  )}
                                  {approveWithOverride && (
                                    <p className="text-xs text-amber-600">
                                      Must be between the request date and the student's target date.
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              {approveWithOverride && (
                                <div className="space-y-2">
                                  <Label htmlFor="returnDateReason">
                                    Reason for Different Return Date *
                                  </Label>
                                  <Textarea
                                    id="returnDateReason"
                                    placeholder="Explain why the approved return date is different from the student's request..."
                                    rows={3}
                                    {...approvalForm.register("returnDateReason", {
                                      validate: (value) => {
                                        if (approveWithOverride && (!value || value.trim().length === 0)) {
                                          return "Please provide a reason when changing the return date";
                                        }
                                        return true;
                                      }
                                    })}
                                  />
                                </div>
                              )}
                              
                              <div className="flex justify-end space-x-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    setApproveDialogOpen(false);
                                    setApproveWithOverride(false);
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button type="submit" disabled={submitting}>
                                  {submitting
                                    ? "Approving..."
                                    : "Approve & Issue"}
                                </Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>

                        <Dialog
                          open={
                            rejectDialogOpen &&
                            selectedRequest?.id === request.id
                          }
                          onOpenChange={(open) => {
                            setRejectDialogOpen(open);
                            if (!open) setSelectedRequest(null);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setSelectedRequest(request)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reject Request</DialogTitle>
                              <DialogDescription>
                                Provide a reason for rejecting this request
                              </DialogDescription>
                            </DialogHeader>
                            <form
                              onSubmit={rejectionForm.handleSubmit(
                                handleReject
                              )}
                              className="space-y-4"
                            >
                              <div className="space-y-2">
                                <Label htmlFor="rejectionReason">
                                  Rejection Reason *
                                </Label>
                                <Textarea
                                  id="rejectionReason"
                                  placeholder="Explain why this request is being rejected..."
                                  rows={4}
                                  {...rejectionForm.register(
                                    "rejectionReason",
                                    {
                                      required: "Rejection reason is required",
                                    }
                                  )}
                                />
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setRejectDialogOpen(false)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  type="submit"
                                  variant="destructive"
                                  disabled={submitting}
                                >
                                  {submitting
                                    ? "Rejecting..."
                                    : "Reject Request"}
                                </Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
