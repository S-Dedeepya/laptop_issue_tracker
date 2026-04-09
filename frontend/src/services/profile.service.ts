import apiClient from "@/lib/api-client";
import type { ApiResponse, UserProfileDTO } from "@/types";

export interface UpdateProfileRequest {
  fullName: string;
  phoneNumber?: string;
  address?: string;
}

export const profileApi = {
  // Get current user profile
  getProfile: async (): Promise<ApiResponse<UserProfileDTO>> => {
    const response = await apiClient.get("/student/profile");
    return response.data;
  },

  // Update user profile
  updateProfile: async (
    data: UpdateProfileRequest
  ): Promise<ApiResponse<UserProfileDTO>> => {
    const response = await apiClient.put("/student/profile", data);
    return response.data;
  },
};

export default profileApi;
