import { useEffect, useState } from "react";
import studentService from "@/services/student.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LaptopIssue } from "@/types";
import { format } from "date-fns";
import { toast } from "sonner";

export default function StudentLaptopIssues() {
  const [issues, setIssues] = useState<LaptopIssue[]>([]);
  const [activeLaptop, setActiveLaptop] = useState<LaptopIssue | null>(null);
  const [loading, setLoading] = useState(true);

  const computeStatus = (issue: LaptopIssue): "ISSUED" | "OVERDUE" | "RETURNED" => {
    if (issue.isReturned) return "RETURNED";
    const deadline = new Date(issue.currentReturnDeadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return deadline < today ? "OVERDUE" : "ISSUED";
  };

  const isOverdue = (issue: LaptopIssue) => {
    if (issue.isReturned) return false;
    const deadline = new Date(issue.currentReturnDeadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return deadline < today;
  };

  useEffect(() => {
    fetchLaptopIssues();
  }, []);

  const fetchLaptopIssues = async () => {
    try {
      setLoading(true);
      const [historyRes, activeRes] = await Promise.all([
        studentService.getMyLaptopIssueHistory(),
        studentService.getMyActiveLaptopIssue(),
      ]);
      setIssues(historyRes.data || []);
      setActiveLaptop(activeRes.data);
    } catch (error) {
      toast.error("Failed to fetch laptop issues");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      ISSUED: "default",
      RETURNED: "secondary",
      OVERDUE: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Records</h2>
        <p className="text-muted-foreground">
          View your issued laptops and history
        </p>
      </div>

      {activeLaptop && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Currently Issued Laptop</CardTitle>
            <CardDescription>Active laptop assignment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Laptop Details
                  </p>
                  <p className="text-lg font-semibold">
                    {activeLaptop.laptop.brand} {activeLaptop.laptop.model}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Serial: {activeLaptop.laptop.serialNumber}
                  </p>
                  {activeLaptop.laptop.specifications && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {activeLaptop.laptop.specifications}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Issue Date</p>
                  <p className="font-medium">
                    {format(new Date(activeLaptop.issueDate), "MMMM dd, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Return Deadline
                  </p>
                  <p
                    className={`font-medium ${
                      isOverdue(activeLaptop) ? "text-destructive" : ""
                    }`}
                  >
                    {format(
                      new Date(activeLaptop.currentReturnDeadline),
                      "MMMM dd, yyyy"
                    )}
                    {isOverdue(activeLaptop) && " - OVERDUE!"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">
                    {getStatusBadge(computeStatus(activeLaptop))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Issue History</CardTitle>
          <CardDescription>All your laptop assignments</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : issues.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No laptop history yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Laptop</TableHead>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Return Deadline</TableHead>
                  <TableHead>Returned Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {issues.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell>
                      {issue.laptop.brand} {issue.laptop.model}
                    </TableCell>
                    <TableCell>{issue.laptop.serialNumber}</TableCell>
                    <TableCell>
                      {format(new Date(issue.issueDate), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell
                      className={isOverdue(issue) ? "text-destructive" : ""}
                    >
                      {format(new Date(issue.currentReturnDeadline), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      {issue.actualReturnDate
                        ? format(
                            new Date(issue.actualReturnDate),
                            "MMM dd, yyyy"
                          )
                        : "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(computeStatus(issue))}</TableCell>
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
