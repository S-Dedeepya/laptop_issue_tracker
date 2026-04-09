// User and Auth Types
export interface User {
  id: number;
  email: string;
  fullName: string;
  role: "STUDENT" | "MANAGER";
}

export interface StudentProfile {
  id: number;
  registrationNumber: string;
  phoneNumber?: string;
  address?: string;
}

export interface UserProfileDTO {
  id?: number;
  email: string;
  fullName: string;
  role?: string;
  phoneNumber?: string;
  address?: string;
}

export interface AuthResponse {
  token: string;
  id: number;
  email: string;
  role: string;
  fullName: string;
  registrationNumber?: string;
  type?: string; // e.g., Bearer
  userId?: number; // legacy fallback
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface StudentSignupRequest {
  email: string;
  password: string;
  fullName: string;
  registrationNumber: string;
  phoneNumber?: string;
  address?: string;
}

// Laptop Types
export interface Laptop {
  id: number;
  serialNumber: string;
  brand: string;
  model: string;
  specifications?: string;
   gpuSpecification?: string;
  status: "AVAILABLE" | "ISSUED" | "MAINTENANCE";
  createdAt: string;
  updatedAt: string;
}

export interface LaptopDTO {
  serialNumber: string;
  brand: string;
  model: string;
  specifications?: string;
  gpuSpecification?: string;
}

// Laptop Request Types
export interface LaptopRequest {
  id: number;
  student: {
    id: number;
    fullName: string;
    registrationNumber: string;
  };
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestDate: string;
  requestedReturnDate?: string;
  selectedLaptop?: Laptop;
  selectedLaptopSpecification?: string;
  managerApprovedReturnDate?: string;
  managerReturnDateReason?: string;
  reviewedBy?: {
    id: number;
    fullName: string;
  };
  reviewDate?: string;
  rejectionReason?: string;
}

export interface LaptopRequestDTO {
  reason: string;
  requestDate: string;
  requestedReturnDate: string;
  laptopId: number;
}

// Laptop Issue Types
export interface LaptopIssue {
  id: number;
  laptop: {
    id: number;
    serialNumber: string;
    brand: string;
    model: string;
    specifications?: string;
  };
  student: {
    id: number;
    fullName: string;
    registrationNumber: string;
  };
  issueDate: string;
  currentReturnDeadline: string;
  actualReturnDate?: string;
  isReturned: boolean;
  extensionCount: number;
}

export interface LaptopIssueApprovalDTO {
  laptopId: number;
  issueDate: string;
  returnDeadline: string;
}

// Extension Request Types
export interface ExtensionRequest {
  id: number;
  laptopIssue: {
    id: number;
    currentReturnDeadline: string;
    issueDate: string;
    student: {
      id: number;
      fullName: string;
      registrationNumber: string;
      email: string;
    };
    laptop: {
      serialNumber: string;
      brand: string;
      model: string;
    };
    extensionCount?: number;
  };
  reason: string;
  extensionDays: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  reviewedBy?: number;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface ExtensionRequestDTO {
  laptopIssueId: number;
  reason: string;
  extensionDays: number;
}

// Notification Types
export interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface RequestReviewDTO {
  approved: boolean;
  rejectionReason?: string;
}
