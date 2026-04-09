import { useEffect, useState } from "react";
import managerService from "@/services/manager.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Laptop, FileText, Clock, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function ManagerDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLaptops: 0,
    availableLaptops: 0,
    pendingRequests: 0,
    activeLaptops: 0,
    overdueLaptops: 0,
    pendingExtensions: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [
        laptops,
        availableLaptops,
        pendingRequests,
        activeLaptops,
        overdueLaptops,
        pendingExtensions,
      ] = await Promise.all([
        managerService.getAllLaptops(),
        managerService.getAvailableLaptops(),
        managerService.getPendingLaptopRequests(),
        managerService.getActiveLaptopIssues(),
        managerService.getOverdueLaptops(),
        managerService.getPendingExtensionRequests(),
      ]);

      setStats({
        totalLaptops: laptops.data?.length || 0,
        availableLaptops: availableLaptops.data?.length || 0,
        pendingRequests: pendingRequests.data?.length || 0,
        activeLaptops: activeLaptops.data?.length || 0,
        overdueLaptops: overdueLaptops.data?.length || 0,
        pendingExtensions: pendingExtensions.data?.length || 0,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Laptops",
      value: stats.totalLaptops,
      icon: Laptop,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      link: "/manager/laptops",
    },
    {
      title: "Available Laptops",
      value: stats.availableLaptops,
      icon: Laptop,
      color: "text-green-600",
      bgColor: "bg-green-100",
      link: "/manager/laptops",
    },
    {
      title: "Pending Requests",
      value: stats.pendingRequests,
      icon: FileText,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      link: "/manager/requests",
    },
    {
      title: "Active Issues",
      value: stats.activeLaptops,
      icon: Laptop,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      link: "/manager/issues",
    },
    {
      title: "Overdue Laptops",
      value: stats.overdueLaptops,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      link: "/manager/issues",
    },
    {
      title: "Pending Extensions",
      value: stats.pendingExtensions,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      link: "/manager/extensions",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
          Overview of laptop inventory and requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} to={stat.link}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
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
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/manager/requests">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Review Requests ({stats.pendingRequests})
              </Button>
            </Link>
            <Link to="/manager/extensions">
              <Button variant="outline" className="w-full justify-start">
                <Clock className="mr-2 h-4 w-4" />
                Review Extensions ({stats.pendingExtensions})
              </Button>
            </Link>
            <Link to="/manager/issues">
              <Button
                variant="outline"
                className="w-full justify-start text-destructive"
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Check Overdue ({stats.overdueLaptops})
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
