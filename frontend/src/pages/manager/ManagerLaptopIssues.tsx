import { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle } from "lucide-react";
import type { LaptopIssue } from "@/types";
import { format } from "date-fns";

export default function ManagerLaptopIssues() {
  const [allIssues, setAllIssues] = useState<LaptopIssue[]>([]);
  const [activeIssues, setActiveIssues] = useState<LaptopIssue[]>([]);
  const [overdueIssues, setOverdueIssues] = useState<LaptopIssue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const [allRes, activeRes, overdueRes] = await Promise.all([
        managerService.getAllLaptopIssues(),
        managerService.getActiveLaptopIssues(),
        managerService.getOverdueLaptops(),
      ]);
      setAllIssues(allRes.data || []);
      setActiveIssues(activeRes.data || []);
      setOverdueIssues(overdueRes.data || []);
    } catch (error) {
      toast.error("Failed to fetch laptop issues");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsReturned = async (id: number) => {
    if (!confirm("Mark this laptop as returned?")) return;
    try {
      await managerService.markLaptopAsReturned(id);
      toast.success("Laptop marked as returned successfully");
      fetchIssues();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to mark as returned"
      );
    }
  };

  const getIssueStatus = (issue: LaptopIssue): string => {
    if (issue.isReturned) return "RETURNED";
    const deadline = new Date(issue.currentReturnDeadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return deadline < today ? "OVERDUE" : "ISSUED";
  };

  const isIssueOverdue = (issue: LaptopIssue): boolean => {
    if (issue.isReturned) return false;
    const deadline = new Date(issue.currentReturnDeadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return deadline < today;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      ISSUED: "default",
      RETURNED: "secondary",
      OVERDUE: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const IssueTable = ({
    issues,
    showReturnAction = false,
  }: {
    issues: LaptopIssue[];
    showReturnAction?: boolean;
  }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Laptop</TableHead>
          <TableHead>Serial Number</TableHead>
          <TableHead>Issue Date</TableHead>
          <TableHead>Return Deadline</TableHead>
          <TableHead>Returned Date</TableHead>
          <TableHead>Status</TableHead>
          {showReturnAction && (
            <TableHead className="text-right">Actions</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {issues.map((issue) => (
          <TableRow key={issue.id}>
            <TableCell className="font-medium">
              {issue.student.fullName}
              <br />
              <span className="text-sm text-muted-foreground">
                {issue.student.registrationNumber}
              </span>
            </TableCell>
            <TableCell>
              {issue.laptop.brand} {issue.laptop.model}
            </TableCell>
            <TableCell>{issue.laptop.serialNumber}</TableCell>
            <TableCell>
              {format(new Date(issue.issueDate), "MMM dd, yyyy")}
            </TableCell>
            <TableCell
              className={isIssueOverdue(issue) ? "text-destructive font-medium" : ""}
            >
              {format(new Date(issue.currentReturnDeadline), "MMM dd, yyyy")}
            </TableCell>
            <TableCell>
              {issue.actualReturnDate
                ? format(new Date(issue.actualReturnDate), "MMM dd, yyyy")
                : "-"}
            </TableCell>
            <TableCell>{getStatusBadge(getIssueStatus(issue))}</TableCell>
            {showReturnAction && (
              <TableCell className="text-right">
                {!issue.actualReturnDate && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMarkAsReturned(issue.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mark Returned
                  </Button>
                )}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Issued Laptops</h2>
        <p className="text-muted-foreground">Track and manage issued laptops</p>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Active ({activeIssues.length})
          </TabsTrigger>
          <TabsTrigger value="overdue" className="text-destructive">
            Overdue ({overdueIssues.length})
          </TabsTrigger>
          <TabsTrigger value="all">All ({allIssues.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Issues</CardTitle>
              <CardDescription>Currently issued laptops</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : activeIssues.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active laptop issues.
                </div>
              ) : (
                <IssueTable issues={activeIssues} showReturnAction />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue">
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">
                Overdue Laptops
              </CardTitle>
              <CardDescription>
                Laptops past their return deadline
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : overdueIssues.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No overdue laptops. Great!
                </div>
              ) : (
                <IssueTable issues={overdueIssues} showReturnAction />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Issues</CardTitle>
              <CardDescription>
                Complete history of laptop issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : allIssues.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No laptop issues recorded.
                </div>
              ) : (
                <IssueTable issues={allIssues} showReturnAction />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
