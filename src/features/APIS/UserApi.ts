import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  // Pointing to your production Render URL
  baseUrl: 'https://laikipiavotingsystem-f3aabefwhrendaae.southafricanorth-01.azurewebsites.net/api/',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token'); 
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: baseQuery,
  tagTypes: ['users', 'user'],
  endpoints: (builder) => ({
    // GET ALL USERS - Matches GET /api/users/
    getAllUsers: builder.query<any, void>({
      query: () => 'users/', 
      providesTags: ['users'],
    }),

    // GET USER BY ID - Matches GET /api/users/by-id/{{userId}}
    getUserById: builder.query<any, string>({
      query: (userId) => `users/by-id/${userId}`,
      providesTags: ['user'],
    }),

    // GET USER BY REG NO - Matches GET /api/users/by-reg-no?reg_no=...
    getUserByRegNo: builder.query<any, string>({
      query: (reg_no) => `users/by-reg-no?reg_no=${encodeURIComponent(reg_no)}`,
      providesTags: ['user'],
    }),

    // GET USER BY LAST NAME - Matches GET /api/users/by-last-name?lastName=...
    getUserByLastName: builder.query<any, string>({
      query: (lastName) => `users/by-last-name?lastName=${encodeURIComponent(lastName)}`,
      providesTags: ['user'],
    }),

    // GET USER BY EMAIL - Matches GET /api/users/by-email?email=...
    getUserByEmail: builder.query<any, string>({
      query: (email) => `users/by-email?email=${encodeURIComponent(email)}`,
      providesTags: ['user'],
    }),

    // GET USERS BY SCHOOL - Matches GET /api/users/by-school?school=...
    getUsersBySchool: builder.query<any, string>({
      query: (school) => `users/by-school?school=${encodeURIComponent(school)}`,
      providesTags: ['users'],
    }),

    // GET TOTAL COUNT - Matches GET /api/users/count
    getUsersCount: builder.query<any, void>({
      query: () => 'users/count',
    }),

    // GET COUNT BY SCHOOL - Matches GET /api/users/count-by-school?school=...
    getUsersCountBySchool: builder.query<any, string>({
      query: (school) => `users/count-by-school?school=${encodeURIComponent(school)}`,
    }),

    // UPDATE USER - Matches PUT /api/users/update/{{userId}}
    updateUser: builder.mutation<any, { userId: string; [key: string]: any }>({
      query: ({ userId, ...patch }) => ({
        url: `users/update/${userId}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['user', 'users'],
    }),

    // DELETE USER - Matches DELETE /api/users/delete/{{userId}}
    deleteUser: builder.mutation<any, string>({
      query: (userId) => ({
        url: `users/delete/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['user', 'users'],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useGetUserByRegNoQuery,
  useGetUserByLastNameQuery,
  useGetUserByEmailQuery,
  useGetUsersBySchoolQuery,
  useGetUsersCountQuery,
  useGetUsersCountBySchoolQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;