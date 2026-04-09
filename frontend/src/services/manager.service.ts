import apiClient from "@/lib/api-client";
import type {
  ApiResponse,
  Laptop,
  LaptopDTO,
  LaptopRequest,
  LaptopIssue,
  LaptopIssueApprovalDTO,
  ExtensionRequest,
} from "@/types";

const managerService = {
  // Laptop Management
  addLaptop: async (data: LaptopDTO): Promise<ApiResponse<Laptop>> => {
    const response = await apiClient.post("/manager/laptops", data);
    return response.data;
  },

  getAllLaptops: async (): Promise<ApiResponse<Laptop[]>> => {
    const response = await apiClient.get("/manager/laptops");
    return response.data;
  },

  getAvailableLaptops: async (): Promise<ApiResponse<Laptop[]>> => {
    const response = await apiClient.get("/manager/laptops/available");
    return response.data;
  },

  getLaptopById: async (id: number): Promise<ApiResponse<Laptop>> => {
    const response = await apiClient.get(`/manager/laptops/${id}`);
    return response.data;
  },

  updateLaptop: async (
    id: number,
    data: LaptopDTO
  ): Promise<ApiResponse<Laptop>> => {
    const response = await apiClient.put(`/manager/laptops/${id}`, data);
    return response.data;
  },

  deleteLaptop: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/manager/laptops/${id}`);
    return response.data;
  },

  // Laptop Requests
  getAllLaptopRequests: async (): Promise<ApiResponse<LaptopRequest[]>> => {
    const response = await apiClient.get("/manager/laptop-requests");
    return response.data;
  },

  getPendingLaptopRequests: async (): Promise<ApiResponse<LaptopRequest[]>> => {
    const response = await apiClient.get("/manager/laptop-requests/pending");
    return response.data;
  },

  getLaptopRequestById: async (
    id: number
  ): Promise<ApiResponse<LaptopRequest>> => {
    const response = await apiClient.get(`/manager/laptop-requests/${id}`);
    return response.data;
  },

  approveLaptopRequest: async (
    id: number,
    data: any
  ): Promise<ApiResponse<LaptopIssue>> => {
    const response = await apiClient.post(
      `/manager/laptop-requests/${id}/approve`,
      data
    );
    return response.data;
  },

  rejectLaptopRequest: async (
    id: number,
    rejectionReason: string
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(
      `/manager/laptop-requests/${id}/reject`,
      {
        rejectionReason,
      }
    );
    return response.data;
  },

  // Laptop Issues
  getAllLaptopIssues: async (): Promise<ApiResponse<LaptopIssue[]>> => {
    const response = await apiClient.get("/manager/laptop-issues");
    return response.data;
  },

  getActiveLaptopIssues: async (): Promise<ApiResponse<LaptopIssue[]>> => {
    const response = await apiClient.get("/manager/laptop-issues/active");
    return response.data;
  },

  getOverdueLaptops: async (): Promise<ApiResponse<LaptopIssue[]>> => {
    const response = await apiClient.get("/manager/laptop-issues/overdue");
    return response.data;
  },

  getLaptopsNearingDeadline: async (
    days: number = 7
  ): Promise<ApiResponse<LaptopIssue[]>> => {
    const response = await apiClient.get(
      `/manager/laptop-issues/nearing-deadline?days=${days}`
    );
    return response.data;
  },

  getLaptopIssueById: async (id: number): Promise<ApiResponse<LaptopIssue>> => {
    const response = await apiClient.get(`/manager/laptop-issues/${id}`);
    return response.data;
  },

  markLaptopAsReturned: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.put(`/manager/laptop-issues/${id}/return`);
    return response.data;
  },

  // Extension Requests
  getAllExtensionRequests: async (): Promise<
    ApiResponse<ExtensionRequest[]>
  > => {
    const response = await apiClient.get("/manager/extension-requests");
    return response.data;
  },

  getPendingExtensionRequests: async (): Promise<
    ApiResponse<ExtensionRequest[]>
  > => {
    const response = await apiClient.get("/manager/extension-requests/pending");
    return response.data;
  },

  getExtensionRequestById: async (
    id: number
  ): Promise<ApiResponse<ExtensionRequest>> => {
    const response = await apiClient.get(`/manager/extension-requests/${id}`);
    return response.data;
  },

  approveExtensionRequest: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(
      `/manager/extension-requests/${id}/approve`
    );
    return response.data;
  },

  rejectExtensionRequest: async (
    id: number,
    rejectionReason: string
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(
      `/manager/extension-requests/${id}/reject`,
      {
        rejectionReason,
      }
    );
    return response.data;
  },
};

export default managerService;
