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
import type { Laptop, LaptopIssue, LaptopRequest } from "@/types";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck } from "lucide-react";

type RequestFormData = {
  reason: string;
  requestDate: string;
  requestedReturnDate: string;
};

export default function StudentLaptopRequests() {
  const [requests, setRequests] = useState<LaptopRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeLaptop, setActiveLaptop] = useState<LaptopIssue | null>(null);
  const [requestBanner, setRequestBanner] = useState<string | null>(null);
  const [availableLaptops, setAvailableLaptops] = useState<Laptop[]>([]);
  const [availableLoading, setAvailableLoading] = useState(false);
  const [selectedLaptopId, setSelectedLaptopId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<RequestFormData>();

  const reason = watch("reason");
  const requestDate = watch("requestDate");
  const requestedReturnDate = watch("requestedReturnDate");

  useEffect(() => {
    fetchRequests();
    fetchActiveLaptop();
  }, []);

  useEffect(() => {
    // Only fetch laptops when reason, date, and return date are filled
    const isReasonValid = reason && reason.trim().length >= 10;
    const isDateValid = requestDate && requestDate.trim().length > 0;
    const isReturnDateValid = requestedReturnDate && requestedReturnDate.trim().length > 0;
    
    if (isReasonValid && isDateValid && isReturnDateValid && dialogOpen) {
      fetchAvailableLaptops();
    } else {
      // Clear laptops and selection if fields are incomplete
      setAvailableLaptops([]);
      setSelectedLaptopId(null);
    }
  }, [reason, requestDate, requestedReturnDate, dialogOpen]);

  useEffect(() => {
    if (selectedLaptopId && !availableLaptops.find((l) => l.id === selectedLaptopId)) {
      setSelectedLaptopId(null);
    }
  }, [availableLaptops, selectedLaptopId]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await studentService.getMyLaptopRequests();
      setRequests(response.data || []);
    } catch (error: any) {
      console.error('Failed to fetch requests:', error);
      toast.error(error.response?.data?.message || "Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveLaptop = async () => {
    try {
      const response = await studentService.getMyActiveLaptopIssue();
      // Explicitly set to null if data is null or undefined
      setActiveLaptop(response.data ?? null);
    } catch (error) {
      // silent; a toast here would be noisy
      // If fetch fails, assume no active laptop
      setActiveLaptop(null);
    }
  };

  const fetchAvailableLaptops = async () => {
    try {
      setAvailableLoading(true);
      const response = await studentService.getAvailableLaptops();
      setAvailableLaptops(response.data || []);
    } catch (error: any) {
      console.error('Failed to fetch available laptops:', error);
      setAvailableLaptops([]);
      toast.error(error.response?.data?.message || "Failed to load available laptops");
    } finally {
      setAvailableLoading(false);
    }
  };

  const onSubmit = async (data: RequestFormData) => {
    try {
      setSubmitting(true);
      if (!selectedLaptopId) {
        toast.error("Please select one available laptop specification.");
        return;
      }
      // Format date properly to avoid parsing errors
      const formattedRequestDate = new Date(data.requestDate).toISOString().split('T')[0];
      const formattedReturnDate = new Date(data.requestedReturnDate).toISOString().split('T')[0];
      
      // Validate that return date is after request date
      if (new Date(formattedReturnDate) <= new Date(formattedRequestDate)) {
        toast.error("Requested return date must be after the laptop request date");
        return;
      }
      
      const response = await studentService.createLaptopRequest({ 
        reason: data.reason, 
        requestDate: formattedRequestDate,
        requestedReturnDate: formattedReturnDate,
        laptopId: selectedLaptopId
      });
      toast.success(response.message || "Request sent");
      setRequestBanner("Request sent. You’ll be notified when it’s reviewed.");
      setDialogOpen(false);
      reset();
      setSelectedLaptopId(null);
      fetchRequests();
      fetchActiveLaptop();
      fetchAvailableLaptops();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create request");
    } finally {
      setSubmitting(false);
    }
  };

  // Backend validation: can create request if:
  // 1. No active (unreturned) laptop
  // 2. No pending requests
  const hasPendingRequest = requests.some((r) => r.status === "PENDING");
  const hasActiveLaptop = activeLaptop && !activeLaptop.isReturned;
  const canCreateRequest = !hasActiveLaptop && !hasPendingRequest;

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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            My Laptop Requests
          </h2>
          <p className="text-muted-foreground">
            View and manage your laptop requests
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!canCreateRequest}>
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Button>
          </DialogTrigger>
          {!canCreateRequest && (
            <p className="text-sm text-muted-foreground mt-2">
              {hasActiveLaptop
                ? "Please return your current laptop before requesting a new one."
                : "Please wait for your pending request to be approved or rejected."}
            </p>
          )}
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Laptop Request</DialogTitle>
              <DialogDescription>
                Provide a detailed reason for requesting a laptop
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason *</Label>
                <Textarea
                  id="reason"
                  {...register("reason", {
                    required: "Reason is required",
                    minLength: {
                      value: 10,
                      message: "Reason must be at least 10 characters",
                    },
                    maxLength: {
                      value: 500,
                      message: "Reason must not exceed 500 characters",
                    },
                  })}
                  rows={4}
                  placeholder="Describe why you need a laptop..."
                />
                {errors.reason && (
                  <p className="text-sm text-destructive">
                    {errors.reason.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="requestDate">Select the date you need a laptop *</Label>
                <Input
                  id="requestDate"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  {...register("requestDate", {
                    required: "Please select the date you need a laptop",
                  })}
                />
                {errors.requestDate && (
                  <p className="text-sm text-destructive">
                    {errors.requestDate.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="requestedReturnDate">Requested return date *</Label>
                <Input
                  id="requestedReturnDate"
                  type="date"
                  min={requestDate ? new Date(new Date(requestDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                  {...register("requestedReturnDate", {
                    required: "Please select a requested return date",
                  })}
                />
                {errors.requestedReturnDate && (
                  <p className="text-sm text-destructive">
                    {errors.requestedReturnDate.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">The return date must be after the laptop start date.</p>
              </div>
              <div className="space-y-2">
                <Label>Choose a laptop specification *</Label>
                {!reason || reason.trim().length < 10 || !requestDate || !requestedReturnDate ? (
                  <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                    Please fill in the reason, request date, and return date fields above to view available laptops.
                  </div>
                ) : availableLoading ? (
                  <div className="text-sm text-muted-foreground">Loading available laptops...</div>
                ) : availableLaptops.length === 0 ? (
                  <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                    No laptops available at the moment.
                  </div>
                ) : (
                  <div className="rounded-md border divide-y max-h-[300px] overflow-y-auto">
                    {availableLaptops.map((laptop) => {
                      const isChecked = selectedLaptopId === laptop.id;
                      return (
                        <label
                          key={laptop.id}
                          className="flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/60 transition-colors"
                        >
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 flex-shrink-0"
                            checked={isChecked}
                            onChange={() =>
                              setSelectedLaptopId((prev) =>
                                prev === laptop.id ? null : laptop.id
                              )
                            }
                          />
                          <div className="space-y-1 min-w-0 flex-1">
                            <p className="font-semibold">
                              {laptop.brand} {laptop.model}
                            </p>
                            <p className="text-sm text-muted-foreground break-words">
                              {laptop.specifications || "Specs unavailable"}
                            </p>
                            <p className="text-xs text-muted-foreground break-words">
                              GPU: {laptop.gpuSpecification || "N/A"} · Serial: {laptop.serialNumber}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || availableLaptops.length === 0}
                >
                  {submitting ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
          <CardDescription>History of all your laptop requests</CardDescription>
        </CardHeader>
        <CardContent>
          {requestBanner && (
            <Alert className="mb-4" variant="default">
              <ShieldCheck className="h-4 w-4" />
              <AlertTitle>Request sent</AlertTitle>
              <AlertDescription>{requestBanner}</AlertDescription>
            </Alert>
          )}
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No requests yet. Create your first request using the button above!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Requested Return Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Selected Spec</TableHead>
                  <TableHead>Status</TableHead>
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
                    <TableCell className="max-w-md truncate">
                      {request.reason}
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {request.selectedLaptopSpecification ||
                        request.selectedLaptop?.specifications ||
                        "—"}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
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
