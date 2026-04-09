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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const filterColumns = [
  { value: "student", label: "Student Name" },
  { value: "registrationNumber", label: "Registration Number" },
  { value: "laptop", label: "Laptop (Brand / Model)" },
  { value: "serialNumber", label: "Serial Number" },
  { value: "issueDate", label: "Issue Date" },
  { value: "returnDeadline", label: "Return Deadline" },
  { value: "returnedDate", label: "Returned Date" },
  { value: "extensionCount", label: "Times Extended" },
  { value: "status", label: "Status" },
];

export default function ManagerLaptopIssuesFilter() {
  const [allIssues, setAllIssues] = useState<LaptopIssue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<LaptopIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedColumn, setSelectedColumn] = useState<string>("student");
  const [searchValue, setSearchValue] = useState<string>("");
  const [appliedFilter, setAppliedFilter] = useState<
    { column: string; value: string } | null
  >(null);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await managerService.getAllLaptopIssues();
      setAllIssues(response.data || []);
    } catch (error) {
      toast.error("Failed to fetch laptop issues");
    } finally {
      setLoading(false);
    }
  };

  const formatDateValue = (dateString?: string): string => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  const isIssueOverdue = (issue: LaptopIssue): boolean => {
    if (issue.isReturned) return false;
    const deadline = new Date(issue.currentReturnDeadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return deadline < today;
  };

  const getIssueStatus = (issue: LaptopIssue): string => {
    if (issue.isReturned) return "RETURNED";
    return isIssueOverdue(issue) ? "OVERDUE" : "ISSUED";
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      ISSUED: "default",
      RETURNED: "secondary",
      OVERDUE: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const getColumnValue = (issue: LaptopIssue, column: string): string => {
    switch (column) {
      case "student":
        return issue.student.fullName;
      case "registrationNumber":
        return issue.student.registrationNumber;
      case "laptop":
        return `${issue.laptop.brand} ${issue.laptop.model}`.trim();
      case "serialNumber":
        return issue.laptop.serialNumber;
      case "issueDate":
        return formatDateValue(issue.issueDate);
      case "returnDeadline":
        return formatDateValue(issue.currentReturnDeadline);
      case "returnedDate":
        return formatDateValue(issue.actualReturnDate);
      case "extensionCount":
        return issue.extensionCount?.toString() || "0";
      case "status":
        return getIssueStatus(issue);
      default:
        return "";
    }
  };

  const applyFilter = (
    issues: LaptopIssue[],
    column: string,
    value: string
  ): LaptopIssue[] => {
    const query = value.trim().toLowerCase();
    if (!query) return [];

    return issues.filter((issue) => {
      const columnValue = getColumnValue(issue, column).toLowerCase();
      return columnValue.includes(query);
    });
  };

  const handleFilter = () => {
    const trimmedValue = searchValue.trim();
    if (!trimmedValue) {
      toast.error("Enter a value to search");
      setAppliedFilter(null);
      setFilteredIssues([]);
      return;
    }

    const results = applyFilter(allIssues, selectedColumn, trimmedValue);
    setFilteredIssues(results);
    setAppliedFilter({ column: selectedColumn, value: trimmedValue });
  };

  useEffect(() => {
    if (!appliedFilter) return;
    const results = applyFilter(
      allIssues,
      appliedFilter.column,
      appliedFilter.value
    );
    setFilteredIssues(results);
  }, [allIssues, appliedFilter]);

  const IssueTable = ({ issues }: { issues: LaptopIssue[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Laptop</TableHead>
          <TableHead>Serial Number</TableHead>
          <TableHead>Issue Date</TableHead>
          <TableHead>Return Deadline</TableHead>
          <TableHead>Returned Date</TableHead>
          <TableHead>Times Extended</TableHead>
          <TableHead>Status</TableHead>
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
            <TableCell>{formatDateValue(issue.issueDate)}</TableCell>
            <TableCell
              className={isIssueOverdue(issue) ? "text-destructive font-medium" : ""}
            >
              {formatDateValue(issue.currentReturnDeadline)}
            </TableCell>
            <TableCell>
              {issue.actualReturnDate ? formatDateValue(issue.actualReturnDate) : "-"}
            </TableCell>
            <TableCell className="text-center font-medium">
              {issue.extensionCount || 0}
            </TableCell>
            <TableCell>{getStatusBadge(getIssueStatus(issue))}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Filter Issued Laptops</h2>
        <p className="text-muted-foreground">
          Select a column, enter a value, and view matching issued laptops
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Issued Laptops</CardTitle>
          <CardDescription>
            Display all rows where the selected column matches the entered value
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[240px_1fr_auto] items-end">
            <div className="space-y-2">
              <Label htmlFor="filter-column">Column</Label>
              <Select
                value={selectedColumn}
                onValueChange={(value) => setSelectedColumn(value)}
              >
                <SelectTrigger id="filter-column">
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {filterColumns.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-value">Value</Label>
              <Input
                id="filter-value"
                placeholder="Type value to search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
              />
            </div>

            <Button onClick={handleFilter} className="md:w-auto w-full">
              OK
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : !appliedFilter ? (
            <div className="text-center py-8 text-muted-foreground">
              Choose a column, enter a value, and click OK to see results.
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No issued laptops match the provided filter.
            </div>
          ) : (
            <IssueTable issues={filteredIssues} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
