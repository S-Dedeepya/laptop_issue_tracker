import apiClient from "@/lib/api-client";
import type {
  ApiResponse,
  Laptop,
  LaptopRequest,
  LaptopRequestDTO,
  LaptopIssue,
  ExtensionRequest,
  ExtensionRequestDTO,
  Notification,
} from "@/types";

const studentService = {
  // Laptop Requests
  createLaptopRequest: async (
    data: LaptopRequestDTO
  ): Promise<ApiResponse<LaptopRequest>> => {
    const response = await apiClient.post("/student/laptop-requests", data);
    return response.data;
  },

  getAvailableLaptops: async (): Promise<ApiResponse<Laptop[]>> => {
    const response = await apiClient.get("/student/laptops/available");
    return response.data;
  },

  getMyLaptopRequests: async (): Promise<ApiResponse<LaptopRequest[]>> => {
    const response = await apiClient.get("/student/laptop-requests");
    return response.data;
  },

  // Laptop Issues
  getMyLaptopIssueHistory: async (): Promise<ApiResponse<LaptopIssue[]>> => {
    const response = await apiClient.get("/student/laptop-issues");
    return response.data;
  },

  getMyActiveLaptopIssue: async (): Promise<
    ApiResponse<LaptopIssue | null>
  > => {
    const response = await apiClient.get("/student/laptop-issues/active");
    return response.data;
  },

  // Extension Requests
  createExtensionRequest: async (
    data: ExtensionRequestDTO
  ): Promise<ApiResponse<ExtensionRequest>> => {
    const response = await apiClient.post("/student/extension-requests", data);
    return response.data;
  },

  getMyExtensionRequests: async (): Promise<
    ApiResponse<ExtensionRequest[]>
  > => {
    const response = await apiClient.get("/student/extension-requests");
    return response.data;
  },

  // Notifications
  getMyNotifications: async (): Promise<ApiResponse<Notification[]>> => {
    const response = await apiClient.get("/student/notifications");
    return response.data;
  },

  getMyUnreadNotifications: async (): Promise<ApiResponse<Notification[]>> => {
    const response = await apiClient.get("/student/notifications/unread");
    return response.data;
  },

  getUnreadNotificationCount: async (): Promise<ApiResponse<number>> => {
    const response = await apiClient.get("/student/notifications/unread/count");
    return response.data;
  },

  markNotificationAsRead: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.put(`/student/notifications/${id}/read`);
    return response.data;
  },

  markAllNotificationsAsRead: async (): Promise<ApiResponse<void>> => {
    const response = await apiClient.put("/student/notifications/read-all");
    return response.data;
  },
};

export default studentService;
