import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const getAccessTokenFromCookie = () => {
  if (typeof document === "undefined") {
    return "";
  }

  const accessTokenCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("accessToken="));

  return accessTokenCookie?.split("=")[1] ?? "";
};

export type DashboardStats = {
  users: number;
  projects: number;
  tasksOpen: number;
  completionRate: number;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type UserInfo = {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  roles: string[];
  emailVerified: boolean;
  phoneVerified: boolean;
  fanVerified: boolean;
  kycStatus: string;
  isProfileComplete: boolean;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  refreshTokenExpiresIn: number;
  userInfo: UserInfo;
  message: string;
  requiresOtpVerification: boolean;
  nextStep: string;
};

export type PaginationRequest = {
  page: number;
  size: number;
};

export type Campaign = {
  id: number;
  title: string;
  shortDescription: string;
  heroImageUrl: string;
  fundingGoal: number;
  equityOffered: number;
  valuation: number;
  minInvestment: number;
  amountRaised: number;
  fundingProgress: number;
  startDate: string;
  endDate: string;
  status: string;
  totalInvestors: number;
  totalComments: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  company?: {
    id: number;
    name: string;
    industry: string;
    description: string;
    website: string;
    logoUrl: string;
    totalCampaigns: number;
  };
};

export type CampaignDocument = {
  id: number;
  documentType: string;
  documentName: string;
  documentUrl: string;
  fileSize: number;
  mimeType: string;
  verificationStatus: string;
};

export type CampaignDetail = Campaign & {
  storyJson?: Record<string, string>;
  risksJson?: Record<string, string>;
  isSavedByCurrentUser?: boolean;
  isInvestedByCurrentUser?: boolean;
  documents?: CampaignDocument[];
};

export type PaginatedResponse<T> = {
  totalElements: number;
  totalPages: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  size: number;
  number: number;
  empty: boolean;
  content: T[];
};

export type CampaignActionResponse = {
  message?: string;
};

export type VerifyCampaignDocumentRequest = {
  campaignId: number;
  documentId: number;
  approved: boolean;
  rejectionReason: string;
};

export type PendingKyc = {
  id: number;
  documentType: string;
  documentNumber: string;
  documentUrl: string;
  originalFileName: string;
  verificationStatus: string;
  rejectionReason: string;
  submittedAt: string;
  verifiedAt: string;
  user: UserInfo;
  data: {
    fullName: string;
    phoneNumber: string;
    dateOfBirth: string;
    nationality: string;
    address: string;
    active: boolean;
  } | null;
};

export type VerifyKycRequest = {
  kycId: number;
  approved: boolean;
  rejectionReason?: string;
};

export type AdminUser = {
  id: number;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phone?: string;
  roles: string[];
  emailVerified: boolean;
  phoneVerified: boolean;
  fanVerified: boolean;
  kycStatus: string;
  isProfileComplete: boolean;
  profilePictureUrl?: string;
  isInvestor?: boolean;
  isInnovator?: boolean;
  active?: boolean;
};

export type UpdateUserStatusRequest = {
  userId: number;
  active: boolean;
};

export type AdminInvitation = {
  id: number;
  email: string;
  status: string;
  expiresAt: string;
  acceptedAt: string | null;
  invitedByEmail: string;
  createdAt: string;
};

export type SendAdminInvitationRequest = {
  email: string;
};

export type AcceptAdminInvitationRequest = {
  token: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
};

export type UnverifiedBankAccount = {
  id: number;
  companyId: number;
  companyName: string;
  founderEmail: string;
  accountHolderName: string;
  bankCode: string;
  maskedAccountNumber: string;
  submittedAt: string;
  verified: boolean;
};

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
    prepareHeaders: (headers) => {
      const accessToken = getAccessTokenFromCookie();

      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }

      return headers;
    },
  }),
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => "/dashboard/stats",
    }),
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
    }),
    getCampaigns: builder.query<PaginatedResponse<Campaign>, PaginationRequest>({
      query: ({ page, size }) => ({
        url: "/admin/campaigns/all",
        method: "GET",
        params: { page, size },
      }),
    }),
    getUsers: builder.query<PaginatedResponse<AdminUser>, PaginationRequest>({
      query: ({ page, size }) => ({
        url: "/admin/users/all",
        method: "GET",
        params: { page, size },
      }),
    }),
    updateUserStatus: builder.mutation<CampaignActionResponse, UpdateUserStatusRequest>({
      query: ({ userId, active }) => ({
        url: `/admin/users/${userId}/status`,
        method: "PUT",
        params: { active },
      }),
    }),
    getCampaignById: builder.query<CampaignDetail, number>({
      query: (id) => ({
        url: `/public/campaign/${id}`,
        method: "GET",
      }),
    }),
    approveCampaign: builder.mutation<CampaignActionResponse, number>({
      query: (campaignId) => ({
        url: `/admin/campaigns/${campaignId}/approve`,
        method: "POST",
      }),
    }),
    rejectCampaign: builder.mutation<CampaignActionResponse, number>({
      query: (campaignId) => ({
        url: `/admin/campaigns/${campaignId}/reject`,
        method: "POST",
      }),
    }),
    verifyCampaignDocument: builder.mutation<CampaignActionResponse, VerifyCampaignDocumentRequest>({
      query: ({ campaignId, documentId, approved, rejectionReason }) => ({
        url: `/campaigns/${campaignId}/documents/${documentId}/verify`,
        method: "POST",
        body: {
          approved,
          rejectionReason,
        },
      }),
    }),
    getPendingKycs: builder.query<PendingKyc[], void>({
      query: () => ({
        url: "/kyc/admin/pending",
        method: "GET",
      }),
    }),
    verifyKyc: builder.mutation<CampaignActionResponse, VerifyKycRequest>({
      query: ({ kycId, approved, rejectionReason }) => ({
        url: `/kyc/admin/verify/${kycId}`,
        method: "POST",
        params: {
          approved,
          rejectionReason: rejectionReason ?? "",
        },
      }),
    }),
    releaseEscrowFunds: builder.mutation<CampaignActionResponse, number>({
      query: (campaignId) => ({
        url: `/admin/escrow/campaign/${campaignId}/release`,
        method: "POST",
      }),
    }),
    getAdminInvitations: builder.query<PaginatedResponse<AdminInvitation>, PaginationRequest>({
      query: ({ page, size }) => ({
        url: "/admin/invitations",
        method: "GET",
        params: { page, size },
      }),
    }),
    sendAdminInvitation: builder.mutation<CampaignActionResponse, SendAdminInvitationRequest>({
      query: (body) => ({
        url: "/admin/invitations",
        method: "POST",
        body,
      }),
    }),
    revokeAdminInvitation: builder.mutation<CampaignActionResponse, number>({
      query: (id) => ({
        url: `/admin/invitations/${id}`,
        method: "DELETE",
      }),
    }),
    acceptAdminInvitation: builder.mutation<CampaignActionResponse, AcceptAdminInvitationRequest>({
      query: (body) => ({
        url: "/auth/admin-invitation/accept",
        method: "POST",
        body,
      }),
    }),
    getUnverifiedBankAccounts: builder.query<
      PaginatedResponse<UnverifiedBankAccount>,
      PaginationRequest
    >({
      query: ({ page, size }) => ({
        url: "/admin/bank-accounts/unverified",
        method: "GET",
        params: { page, size },
      }),
    }),
    verifyBankAccount: builder.mutation<CampaignActionResponse, number>({
      query: (bankAccountId) => ({
        url: `/admin/bank-accounts/${bankAccountId}/verify`,
        method: "POST",
      }),
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useLoginMutation,
  useGetCampaignsQuery,
  useGetUsersQuery,
  useUpdateUserStatusMutation,
  useGetCampaignByIdQuery,
  useApproveCampaignMutation,
  useRejectCampaignMutation,
  useVerifyCampaignDocumentMutation,
  useGetPendingKycsQuery,
  useVerifyKycMutation,
  useReleaseEscrowFundsMutation,
  useGetAdminInvitationsQuery,
  useSendAdminInvitationMutation,
  useRevokeAdminInvitationMutation,
  useAcceptAdminInvitationMutation,
  useGetUnverifiedBankAccountsQuery,
  useVerifyBankAccountMutation,
} = adminApi;
