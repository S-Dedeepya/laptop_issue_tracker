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
import { Plus, Edit, Trash2 } from "lucide-react";
import type { Laptop } from "@/types";

type LaptopFormData = {
  serialNumber: string;
  brand: string;
  model: string;
  specifications?: string;
  gpuSpecification?: string;
};

export default function ManagerLaptops() {
  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLaptop, setEditingLaptop] = useState<Laptop | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LaptopFormData>();

  useEffect(() => {
    fetchLaptops();
  }, []);

  const fetchLaptops = async () => {
    try {
      setLoading(true);
      const response = await managerService.getAllLaptops();
      setLaptops(response.data || []);
    } catch (error) {
      toast.error("Failed to fetch laptops");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: LaptopFormData) => {
    try {
      setSubmitting(true);
      if (editingLaptop) {
        await managerService.updateLaptop(editingLaptop.id, data);
        toast.success("Laptop updated successfully");
      } else {
        await managerService.addLaptop(data);
        toast.success("Laptop added successfully");
      }
      setDialogOpen(false);
      setEditingLaptop(null);
      reset();
      fetchLaptops();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (laptop: Laptop) => {
    setEditingLaptop(laptop);
    reset(laptop);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this laptop?")) return;
    try {
      await managerService.deleteLaptop(id);
      toast.success("Laptop deleted successfully");
      fetchLaptops();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete laptop");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      AVAILABLE: "default",
      ISSUED: "secondary",
      MAINTENANCE: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Laptop Inventory
          </h2>
          <p className="text-muted-foreground">Manage your laptop inventory</p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setEditingLaptop(null);
              reset();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Laptop
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingLaptop ? "Edit Laptop" : "Add New Laptop"}
              </DialogTitle>
              <DialogDescription>
                {editingLaptop
                  ? "Update laptop information"
                  : "Add a new laptop to the inventory"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial Number *</Label>
                <Input
                  id="serialNumber"
                  placeholder="LAP001"
                  {...register("serialNumber", {
                    required: "Serial number is required",
                  })}
                />
                {errors.serialNumber && (
                  <p className="text-sm text-destructive">
                    {errors.serialNumber.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand *</Label>
                  <Input
                    id="brand"
                    placeholder="Dell"
                    {...register("brand", { required: "Brand is required" })}
                  />
                  {errors.brand && (
                    <p className="text-sm text-destructive">
                      {errors.brand.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    placeholder="Latitude 5520"
                    {...register("model", { required: "Model is required" })}
                  />
                  {errors.model && (
                    <p className="text-sm text-destructive">
                      {errors.model.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="specifications">Specifications</Label>
                <Textarea
                  id="specifications"
                  placeholder="Intel i5, 8GB RAM, 256GB SSD"
                  rows={3}
                  {...register("specifications")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gpuSpecification">GPU Specification</Label>
                <Input
                  id="gpuSpecification"
                  placeholder="NVIDIA RTX 4060 8GB"
                  {...register("gpuSpecification")}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting
                    ? "Saving..."
                    : editingLaptop
                    ? "Update"
                    : "Add Laptop"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Laptops ({laptops.length})</CardTitle>
          <CardDescription>Complete laptop inventory</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : laptops.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No laptops in inventory. Add your first laptop!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Specifications</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {laptops.map((laptop) => (
                  <TableRow key={laptop.id}>
                    <TableCell className="font-medium">
                      {laptop.serialNumber}
                    </TableCell>
                    <TableCell>{laptop.brand}</TableCell>
                    <TableCell>{laptop.model}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="space-y-1">
                        <p className="truncate">{laptop.specifications || "-"}</p>
                        {laptop.gpuSpecification && (
                          <p className="text-xs text-muted-foreground truncate">
                            GPU: {laptop.gpuSpecification}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(laptop.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(laptop)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(laptop.id)}
                          disabled={laptop.status !== "AVAILABLE"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
