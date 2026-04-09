import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import profileApi from "@/services/profile.service";
import type { UpdateProfileRequest } from "@/services/profile.service";
import { Edit2, Save, X } from "lucide-react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, login } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    fullName: user?.fullName || "",
    phoneNumber: "",
    address: "",
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    return role === "STUDENT" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800";
  };

  const handleEditClick = () => {
    setFormData({
      fullName: user?.fullName || "",
      phoneNumber: "",
      address: "",
    });
    setError(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setFormData({
      fullName: user?.fullName || "",
      phoneNumber: "",
      address: "",
    });
  };

  const handleSave = async () => {
    if (!formData.fullName.trim()) {
      setError("Full name is required");
      return;
    }

    if (formData.fullName.length < 2) {
      setError("Full name must be at least 2 characters");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await profileApi.updateProfile(formData);
      
      if (response.success && response.data && user) {
        // Update auth store with new data
        const updatedUser = {
          ...user,
          fullName: response.data.fullName || user.fullName,
          email: response.data.email || user.email,
        };
        
        // Update the user in auth store
        login({
          token: localStorage.getItem("authToken") || "",
          id: user.userId,
          email: updatedUser.email,
          role: user.role,
          fullName: updatedUser.fullName,
          userId: user.userId,
        });
        
        setIsEditing(false);
      } else {
        setError(response.message || "Failed to update profile");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to update profile. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md select-none">
        <DialogHeader className="flex flex-row items-center justify-between select-none">
          <DialogTitle>Profile Details</DialogTitle>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditClick}
              className="h-8 w-8 p-0"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
                {formData?.fullName ? getInitials(formData.fullName) : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {formData.fullName}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  {/* Full Name Input */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-xs font-semibold text-gray-600">
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="text-sm"
                    />
                  </div>

                  {/* Phone Number Input */}
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-xs font-semibold text-gray-600">
                      Phone Number (Optional)
                    </Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber || ""}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      className="text-sm"
                    />
                  </div>

                  {/* Address Input */}
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-xs font-semibold text-gray-600">
                      Address (Optional)
                    </Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address || ""}
                      onChange={handleInputChange}
                      placeholder="Enter your address"
                      className="text-sm min-h-[80px]"
                    />
                  </div>

                  {/* Email (Read-only) */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-600">
                      Email
                    </Label>
                    <Input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="text-sm bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  {/* User ID & Role (Read-only) */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-600">
                      Role
                    </Label>
                    <div className="mt-2">
                      <Badge className={`${getRoleColor(user?.role || "")}`}>
                        {user?.role}
                      </Badge>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 justify-end pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={isLoading}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Full Name
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {user?.fullName}
                    </p>
                  </div>

                  {/* Email */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Email
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-1 break-words">
                      {user?.email}
                    </p>
                  </div>

                  {/* Role */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Role
                    </p>
                    <div className="mt-1">
                      <Badge className={`${getRoleColor(user?.role || "")}`}>
                        {user?.role}
                      </Badge>
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Phone Number
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {user?.phoneNumber || "Not provided"}
                    </p>
                  </div>

                  {/* Address */}
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Address
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {user?.address || "Not provided"}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
