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
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Laptop,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import type { LaptopRequest, LaptopIssue, ExtensionRequest } from "@/types";
import { format } from "date-fns";

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<LaptopRequest[]>([]);
  const [activeLaptop, setActiveLaptop] = useState<LaptopIssue | null>(null);
  const [extensions, setExtensions] = useState<ExtensionRequest[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [requestsRes, activeLaptopRes, extensionsRes] = await Promise.all([
        studentService.getMyLaptopRequests(),
        studentService.getMyActiveLaptopIssue(),
        studentService.getMyExtensionRequests(),
      ]);
      console.log("Dashboard - Requests:", requestsRes);
      console.log("Dashboard - Active Laptop:", activeLaptopRes);
      console.log("Dashboard - Extensions:", extensionsRes);
      setRequests(requestsRes.data || []);
      setActiveLaptop(activeLaptopRes.data);
      setExtensions(extensionsRes.data || []);
    } catch (error: any) {
      console.error("Failed to fetch dashboard data:", error);
      console.error("Error details:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: "Total Requests",
      value: requests.length,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Laptop",
      value: activeLaptop ? 1 : 0,
      icon: Laptop,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Extension Requests",
      value: extensions.length,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Pending Requests",
      value: requests.filter((r) => r.status === "PENDING").length,
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      PENDING: "secondary",
      APPROVED: "default",
      REJECTED: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your laptop requests.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Active Laptop */}
      {activeLaptop && (
        <Card>
          <CardHeader>
            <CardTitle>Active Laptop</CardTitle>
            <CardDescription>Currently issued laptop</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Serial Number</p>
                  <p className="font-medium">
                    {activeLaptop.laptop.serialNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Model</p>
                  <p className="font-medium">
                    {activeLaptop.laptop.brand} {activeLaptop.laptop.model}
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-right">
                <div>
                  <p className="text-sm text-muted-foreground">Issue Date</p>
                  <p className="font-medium">
                    {format(new Date(activeLaptop.issueDate), "MMM dd, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Return Deadline
                  </p>
                  <p
                    className={`font-medium ${
                      !activeLaptop.isReturned &&
                      new Date(activeLaptop.currentReturnDeadline) < new Date()
                        ? "text-destructive"
                        : ""
                    }`}
                  >
                    {format(
                      new Date(activeLaptop.currentReturnDeadline),
                      "MMM dd, yyyy"
                    )}
                    {!activeLaptop.isReturned &&
                      new Date(activeLaptop.currentReturnDeadline) <
                        new Date() && " (Overdue)"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Requests</CardTitle>
          <CardDescription>Your latest laptop requests</CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No requests yet. Create your first request!
            </div>
          ) : (
            <div className="space-y-4">
              {requests.slice(0, 5).map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">
                      {request.reason.substring(0, 50)}...
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Requested on{" "}
                      {format(new Date(request.requestDate), "MMM dd, yyyy")}
                    </p>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
