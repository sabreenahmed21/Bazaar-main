import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { selectCurrentAdmin } from "../redux/AdminSlice";


const baseQueryWithReauth = async (args, api, extraOptions) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_URL}/api/`,
  });
  const state = api.getState();
  const token = selectCurrentAdmin(state)?.token;

  if (typeof args === "string") {
    args = { url: args };
  }

  if (token) {
    args.headers = {
      ...args.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return baseQuery(args, api, extraOptions);
};

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    signIn: builder.mutation({
      query: (formData) => ({
        url: "/login",
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    signUp: builder.mutation({
      query: (formData) => ({
        url: "/signup",
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    verifyCodePassword: builder.mutation({
      query: (verificationCode) => ({
        url: "/verifycode",
        method: "POST",
        body: { code: verificationCode },
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    verifyCodeEmail: builder.mutation({
      query: (data) => ({
        method: "GET",
        url: `/verify-email?verificationCode=${data.verificationCode}`,
        credentials: "include",
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ password, passwordConfirm, token }) => ({
        url: `/resetpassword/${token}`,
        method: "PATCH",
        body: { password, passwordConfirm },
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    forgetPassword: builder.mutation({
      query: (email) => ({
        url: "/forgetpassword",
        method: "POST",
        body: email,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    deleteAccount: builder.mutation({
      query: (currentPassword) => ({
        url: '/delete-me',
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${currentPassword.accessToken}`,
        },
        body: currentPassword,
      }),
    }),
    updatePassword: builder.mutation({
      query: (data) => ({
        url: '/updatePassword',
        method: 'PATCH',
        body: data,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.accessToken}`,
        },
      }),
    }),
    updateUserData: builder.mutation({
      query: (formData) => ({
        url: "/updateUserData",
        method: "PATCH",
        body: formData,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
        credentials: "include",
      }),
    }),
    getproductByName: builder.query({
      query: (name) => `${name}`,
    }),
    addProductByAdmin: builder.mutation({
      query: (formData) => ({
        url: "/admin/create_product",
        method: "POST",
        body: formData,
      }),
    }),
    updateProduct: builder.mutation({
      query: ({ productId, formData }) => ({
        url: `/product/${productId}`,
        method: "PUT",
        body: formData,
      }),
    }),    
    deleteProduct: builder.mutation({
      query: (productId) => ({
        url: `/product/${productId}`,
        method: "DELETE",
      }),
    }),
    getAllUsers: builder.query({
      query: () => ({
        url: "/admin/users",
        method: "GET",
      }),
    }),
    getAllAdmins: builder.query({
      query: () => ({
        url: "/admins",
        method: "GET",
      }),
    }),
    deleteUserByAdmin: builder.mutation({
      query: (userId) => ({
        url: `/admin/deleteUser/${userId}`,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    deleteAdminByAdmin: builder.mutation({
      query: (adminId) => ({
        url: `/admin/deleteAdmin/${adminId}`,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    getOrders: builder.query({
      query: () => '/all-orders'
    }),
    getSingleOrder: builder.query({
      query: (orderId) => `/order/${orderId}`, 
    }),
    deleteOrder: builder.mutation({
      query: (id) => ({
        url: `/admin/order/${id}`,
        method: 'DELETE',
      }),
    }),
    updateOrder: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/order/${id}`,
        method: 'PUT',
        body: { status },
      }),
    }),
    getSales: builder.query({
      query: () => "/get-sales"
    }),
  }),
})

export const {
  useSignInMutation,
  useSignUpMutation,
  useVerifyCodePasswordMutation,
  useVerifyCodeEmailMutation,
  useResetPasswordMutation,
  useForgetPasswordMutation,
  useDeleteAccountMutation ,
  useUpdatePasswordMutation ,
  useUpdateUserDataMutation,
  useLogoutMutation,
  useGetproductByNameQuery,
  useAddProductByAdminMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetAllUsersQuery,
  useGetAllAdminsQuery,
  useDeleteUserByAdminMutation,
  useDeleteAdminByAdminMutation,
  useGetOrdersQuery,
  useGetSingleOrderQuery,
  useDeleteOrderMutation, 
  useUpdateOrderMutation,
  useGetSalesQuery
} = productApi;
