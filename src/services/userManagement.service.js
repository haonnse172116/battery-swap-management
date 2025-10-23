import { apiSlice } from '../api/apiSlice';

export const userManagementApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		getUsers: builder.query({
			// args: { page, pageSize, search, role, token }
			query: ({ page = 1, pageSize = 10, search = '', role = null, token = null }) => ({
				url: '/UserManagement/users',
				method: 'GET',
				params: {
					page,
					pageSize,
					search,
					role,
				},
				headers: token ? { Authorization: `Bearer ${token}` } : {},
			}),
			providesTags: ['User'],
		}),

		promoteToStaff: builder.mutation({
			query: ({ userId, token }) => ({
				url: `/UserManagement/promote-to-staff/${userId}`,
				method: 'PUT',
				headers: token ? { Authorization: `Bearer ${token}` } : {},
			}),
			invalidatesTags: ['User'],
		}),

		demoteToUser: builder.mutation({
			query: ({ userId, token }) => ({
				url: `/UserManagement/demote-to-user/${userId}`,
				method: 'PUT',
				headers: token ? { Authorization: `Bearer ${token}` } : {},
			}),
			invalidatesTags: ['User'],
		}),
	}),
});

export const { useGetUsersQuery, usePromoteToStaffMutation, useDemoteToUserMutation } = userManagementApi;
