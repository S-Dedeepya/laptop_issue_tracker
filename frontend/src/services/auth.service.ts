import apiClient from "@/lib/api-client";
import type {
  ApiResponse,
  LoginRequest,
  StudentSignupRequest,
  AuthResponse,
} from "@/types";

export const authApi = {
  // Student Signup
  studentSignup: async (
    data: StudentSignupRequest
  ): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post("/auth/student/signup", data);
    return response.data;
  },

  // Student Login
  studentLogin: async (
    data: LoginRequest
  ): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post("/auth/student/login", data);
    return response.data;
  },

  // Manager Login
  managerLogin: async (
    data: LoginRequest
  ): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post("/auth/manager/login", data);
    return response.data;
  },

  // Verify Student Email for Password Reset
  verifyStudentEmail: async (
    email: string
  ): Promise<ApiResponse<{ success: boolean }>> => {
    const response = await apiClient.post("/auth/student/verify-email", {
      email,
    });
    return response.data;
  },

  // Reset Student Password
  resetStudentPassword: async (data: {
    email: string;
    newPassword: string;
    phoneNumber: string;
  }): Promise<ApiResponse<{ success: boolean }>> => {
    const response = await apiClient.post("/auth/student/reset-password", data);
    return response.data;
  },
};

export default authApi;
