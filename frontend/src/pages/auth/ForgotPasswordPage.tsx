import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Laptop, Mail, Lock, Phone, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import authApi from "@/services/auth.service";

type ForgotPasswordFormData = {
  email: string;
  newPassword: string;
  confirmPassword: string;
  phoneNumber: string;
};

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"email" | "reset">("email");
  const [userEmail, setUserEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<ForgotPasswordFormData>();
  const newPassword = watch("newPassword");

  const handleEmailSubmit = async (data: { email: string }) => {
    setIsLoading(true);
    try {
      // First, verify the email exists and get user info
      const response = await authApi.verifyStudentEmail(data.email);
      if (response.success) {
        setUserEmail(data.email);
        setStep("reset");
        toast.success("Please verify with your phone number and set a new password");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Email not found");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const resetData = {
        email: userEmail,
        newPassword: data.newPassword,
        phoneNumber: data.phoneNumber,
      };

      const response = await authApi.resetStudentPassword(resetData);

      if (response.success) {
        toast.success("Password reset successfully! Please login with your new password.");
        navigate("/login");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Failed to reset password. Please verify your details."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep("email");
    setUserEmail("");
    reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Laptop className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">
            Reset Password
          </CardTitle>
          <CardDescription className="text-center">
            {step === "email"
              ? "Enter your email to get started"
              : "Verify your phone number and set a new password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "email" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEmailSubmit({ email: watch("email") || "" });
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: "Invalid email address",
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Continue"}
              </Button>
              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm text-primary hover:underline flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+1234567890"
                    className="pl-10"
                    {...register("phoneNumber", {
                      required: "Phone number is required for verification",
                      pattern: {
                        value: /^[0-9+\-\s()]{10,}$/,
                        message: "Please enter a valid phone number",
                      },
                    })}
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-sm text-destructive">
                    {errors.phoneNumber.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Must match your registered phone number
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    {...register("newPassword", {
                      required: "New password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                  />
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-destructive">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    {...register("confirmPassword", {
                      required: "Please confirm password",
                      validate: (value) =>
                        value === newPassword || "Passwords do not match",
                    })}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleBackToEmail}
                disabled={isLoading}
              >
                Back
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
