# 📘 Hướng dẫn tích hợp API với RTK Query

## 📋 Mục lục
1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Setup ban đầu](#2-setup-ban-đầu)
3. [Cách tạo API Service mới](#3-cách-tạo-api-service-mới)
4. [Sử dụng API trong Component](#4-sử-dụng-api-trong-component)
5. [Error Handling](#5-error-handling)
6. [Best Practices](#6-best-practices)
7. [Examples](#7-examples)

---

## 1. Tổng quan kiến trúc

### 📁 Cấu trúc thư mục
```
src/
├── api/
│   ├── axiosInstance.js       # Cấu hình axios + interceptors
│   ├── axiosBaseQuery.js      # Base query cho RTK Query
│   └── apiSlice.js            # RTK Query setup chính
├── services/
│   ├── auth.service.js        # Auth endpoints
│   ├── vehicle.service.js     # Vehicle endpoints
│   └── booking.service.js     # Booking endpoints
├── redux/
│   ├── store.js               # Redux store
│   └── slices/
│       └── authSlice.js       # Auth state
└── hooks/
    ├── redux.js               # Custom Redux hooks
    └── useDebounce.js         # Debounce hook
```

### 🔄 Luồng hoạt động
```
Component → RTK Query Hook → apiSlice → axiosBaseQuery → axiosInstance → Backend API
                                                              ↓
                                                      Interceptors (Auth + 401 handling)
```

---

## 2. Setup ban đầu

### ⚙️ Cấu hình môi trường

Tạo file `.env.local`:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### 📦 Các package cần thiết
```json
{
  "@reduxjs/toolkit": "^2.0.0",
  "react-redux": "^9.0.0",
  "axios": "^1.6.0",
  "redux-persist": "^6.0.0"
}
```

---

## 3. Cách tạo API Service mới

### 📝 Template cơ bản

```javascript
// filepath: src/services/[feature].service.js
import { apiSlice } from "../api/apiSlice";

export const [featureName]Api = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET: Lấy danh sách
    getAll[Feature]: builder.query({
      query: (params) => ({
        url: '/[endpoint]',
        method: 'GET',
        params, // Query params: ?page=1&limit=10
      }),
      providesTags: ['[TagName]'],
    }),

    // GET: Lấy chi tiết theo ID
    get[Feature]ById: builder.query({
      query: (id) => ({
        url: `/[endpoint]/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: '[TagName]', id }],
    }),

    // POST: Tạo mới
    create[Feature]: builder.mutation({
      query: (data) => ({
        url: '/[endpoint]',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['[TagName]'],
    }),

    // PUT: Cập nhật
    update[Feature]: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/[endpoint]/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: '[TagName]', id }],
    }),

    // DELETE: Xóa
    delete[Feature]: builder.mutation({
      query: (id) => ({
        url: `/[endpoint]/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['[TagName]'],
    }),
  }),
});

export const {
  useGetAll[Feature]Query,
  useGet[Feature]ByIdQuery,
  useCreate[Feature]Mutation,
  useUpdate[Feature]Mutation,
  useDelete[Feature]Mutation,
} = [featureName]Api;
```

---

## 4. Sử dụng API trong Component

### 📥 GET Request (Query)

#### Ví dụ 1: Lấy danh sách
```javascript
import { useGetAllVehiclesQuery } from '../../services/vehicle.service';

function VehicleList() {
  const { data, isLoading, isError, error } = useGetAllVehiclesQuery({
    page: 1,
    limit: 10,
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.data.map((vehicle) => (
        <div key={vehicle.id}>{vehicle.model}</div>
      ))}
    </div>
  );
}
```

#### Ví dụ 2: Lấy chi tiết với params
```javascript
import { useGetVehicleByIdQuery } from '../../services/vehicle.service';

function VehicleDetail({ vehicleId }) {
  const { data, isLoading } = useGetVehicleByIdQuery(vehicleId, {
    skip: !vehicleId, // Không gọi API nếu không có ID
    refetchOnMountOrArgChange: true, // Refetch khi mount
  });

  if (isLoading) return <Spinner />;

  return <div>{data?.data.model}</div>;
}
```

### 📤 POST/PUT/DELETE (Mutation)

#### Ví dụ 1: Tạo mới
```javascript
import { useCreateVehicleMutation } from '../../services/vehicle.service';

function AddVehicleForm() {
  const [createVehicle, { isLoading }] = useCreateVehicleMutation();
  const [formData, setFormData] = useState({ brand: '', model: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await createVehicle(formData).unwrap();
      alert('Vehicle created successfully!');
      console.log('Result:', result);
    } catch (error) {
      console.error('Failed to create vehicle:', error);
      alert(`Error: ${error.data?.errorMessage || 'Unknown error'}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.brand}
        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
      />
      <button disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}
```

#### Ví dụ 2: Cập nhật
```javascript
import { useUpdateVehicleMutation } from '../../services/vehicle.service';

function EditVehicle({ vehicleId, initialData }) {
  const [updateVehicle, { isLoading }] = useUpdateVehicleMutation();
  const [formData, setFormData] = useState(initialData);

  const handleUpdate = async () => {
    try {
      await updateVehicle({ id: vehicleId, ...formData }).unwrap();
      alert('Updated successfully!');
    } catch (error) {
      alert('Update failed');
    }
  };

  return (
    <button onClick={handleUpdate} disabled={isLoading}>
      Update
    </button>
  );
}
```

#### Ví dụ 3: Xóa
```javascript
import { useDeleteVehicleMutation } from '../../services/vehicle.service';

function DeleteButton({ vehicleId }) {
  const [deleteVehicle, { isLoading }] = useDeleteVehicleMutation();

  const handleDelete = async () => {
    if (!confirm('Are you sure?')) return;

    try {
      await deleteVehicle(vehicleId).unwrap();
      alert('Deleted successfully!');
    } catch (error) {
      alert('Delete failed');
    }
  };

  return (
    <button onClick={handleDelete} disabled={isLoading}>
      {isLoading ? 'Deleting...' : 'Delete'}
    </button>
  );
}
```

---

## 5. Error Handling

### 🚨 Xử lý lỗi trong Component

```javascript
function MyComponent() {
  const { data, isError, error } = useGetDataQuery();

  if (isError) {
    // Cấu trúc error từ axiosBaseQuery
    const errorCode = error?.data?.errorCode || 'UNKNOWN_ERROR';
    const errorMessage = error?.data?.errorMessage || 'Something went wrong';
    const statusCode = error?.status || 500;

    return (
      <div className="error">
        <h3>Error {statusCode}</h3>
        <p>{errorMessage}</p>
        <small>Code: {errorCode}</small>
      </div>
    );
  }

  return <div>{/* Success UI */}</div>;
}
```

### 🔒 Xử lý 401 (Unauthorized)

**Tự động xử lý bởi `axiosInstance.js`:**
- Khi nhận 401 → Tự động dispatch `logout()`
- User bị đăng xuất và chuyển về login page

---

## 6. Best Practices

### ✅ DO (Nên làm)

1. **Sử dụng `unwrap()` để catch error**
   ```javascript
   try {
     const result = await createData(data).unwrap();
     // Success
   } catch (error) {
     // Handle error
   }
   ```

2. **Dùng `skip` option để conditional fetching**
   ```javascript
   useGetDataQuery(id, { skip: !id });
   ```

3. **Dùng `providesTags` và `invalidatesTags` để auto-refetch**
   ```javascript
   // Query: cung cấp tag
   providesTags: ['Vehicle']
   
   // Mutation: invalidate tag → refetch tất cả query có tag này
   invalidatesTags: ['Vehicle']
   ```

4. **Tạo custom hooks cho logic phức tạp**
   ```javascript
   // hooks/useVehicleData.js
   export function useVehicleData(vehicleId) {
     const { data, isLoading } = useGetVehicleByIdQuery(vehicleId);
     const [updateVehicle] = useUpdateVehicleMutation();
     
     const handleUpdate = async (newData) => {
       await updateVehicle({ id: vehicleId, ...newData }).unwrap();
     };
     
     return { vehicle: data?.data, isLoading, handleUpdate };
   }
   ```

### ❌ DON'T (Không nên làm)

1. **Không gọi API trực tiếp bằng axios trong component**
   ```javascript
   // ❌ SAI
   useEffect(() => {
     axios.get('/api/vehicles').then(...)
   }, []);
   
   // ✅ ĐÚNG
   const { data } = useGetVehiclesQuery();
   ```

2. **Không quên handle loading state**
   ```javascript
   // ❌ SAI
   const { data } = useGetDataQuery();
   return <div>{data.value}</div>; // data có thể undefined
   
   // ✅ ĐÚNG
   const { data, isLoading } = useGetDataQuery();
   if (isLoading) return <Spinner />;
   return <div>{data?.value}</div>;
   ```

3. **Không dispatch thủ công state đã có trong RTK Query**
   ```javascript
   // ❌ SAI - không cần lưu vào local state
   const [vehicles, setVehicles] = useState([]);
   const { data } = useGetVehiclesQuery();
   useEffect(() => setVehicles(data), [data]);
   
   // ✅ ĐÚNG - dùng trực tiếp từ query
   const { data: vehicles } = useGetVehiclesQuery();
   ```

---

## 7. Examples

### 📦 Example 1: Vehicle Service (CRUD đầy đủ)

```javascript
// filepath: src/services/vehicle.service.js
import { apiSlice } from "../api/apiSlice";

export const vehicleApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /vehicles/my - Lấy xe của driver hiện tại
    getMyVehicles: builder.query({
      query: () => ({
        url: '/vehicles/my',
        method: 'GET',
      }),
      providesTags: ['Vehicle'],
    }),

    // GET /vehicles/:id - Chi tiết xe
    getVehicleById: builder.query({
      query: (id) => ({
        url: `/vehicles/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Vehicle', id }],
    }),

    // POST /vehicles/link - Liên kết xe mới
    linkVehicle: builder.mutation({
      query: (vehicleData) => ({
        url: '/vehicles/link',
        method: 'POST',
        data: vehicleData,
      }),
      invalidatesTags: ['Vehicle'],
    }),

    // DELETE /vehicles/:id - Hủy liên kết xe
    unlinkVehicle: builder.mutation({
      query: (vehicleId) => ({
        url: `/vehicles/${vehicleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Vehicle'],
    }),

    // PUT /vehicles/:id - Cập nhật thông tin xe
    updateVehicle: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/vehicles/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Vehicle', id }],
    }),
  }),
});

export const {
  useGetMyVehiclesQuery,
  useGetVehicleByIdQuery,
  useLinkVehicleMutation,
  useUnlinkVehicleMutation,
  useUpdateVehicleMutation,
} = vehicleApi;
```

**Sử dụng trong MyCar page:**
```javascript
// filepath: src/pages/driver/mycar/index.jsx
import { useGetMyVehiclesQuery, useUnlinkVehicleMutation } from '../../../services/vehicle.service';

function MyCar() {
  const { data, isLoading, isError } = useGetMyVehiclesQuery();
  const [unlinkVehicle] = useUnlinkVehicleMutation();

  const handleUnlink = async (vehicleId) => {
    try {
      await unlinkVehicle(vehicleId).unwrap();
      alert('Vehicle unlinked!');
    } catch (error) {
      alert('Failed to unlink vehicle');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading vehicles</div>;

  return (
    <div>
      {data?.data.map((vehicle) => (
        <div key={vehicle.id}>
          <h3>{vehicle.brand} {vehicle.model}</h3>
          <button onClick={() => handleUnlink(vehicle.id)}>Unlink</button>
        </div>
      ))}
    </div>
  );
}
```

---

### 📦 Example 2: Booking Service với params phức tạp

```javascript
// filepath: src/services/booking.service.js
import { apiSlice } from "../api/apiSlice";

export const bookingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /bookings - Lấy danh sách booking với filter
    getBookings: builder.query({
      query: ({ page = 1, limit = 10, status, startDate, endDate }) => ({
        url: '/bookings',
        method: 'GET',
        params: { page, limit, status, startDate, endDate },
      }),
      providesTags: ['Booking'],
    }),

    // POST /bookings - Tạo booking mới
    createBooking: builder.mutation({
      query: (bookingData) => ({
        url: '/bookings',
        method: 'POST',
        data: bookingData,
      }),
      invalidatesTags: ['Booking'],
    }),

    // POST /bookings/:id/cancel - Hủy booking
    cancelBooking: builder.mutation({
      query: (bookingId) => ({
        url: `/bookings/${bookingId}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: ['Booking'],
    }),
  }),
});

export const {
  useGetBookingsQuery,
  useCreateBookingMutation,
  useCancelBookingMutation,
} = bookingApi;
```

**Sử dụng với filter và pagination:**
```javascript
import { useState } from 'react';
import { useGetBookingsQuery } from '../../../services/booking.service';

function BookingHistory() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const { data, isLoading } = useGetBookingsQuery({
    page,
    limit: 10,
    status,
  });

  return (
    <div>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">All</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          {data?.data.map((booking) => (
            <div key={booking.id}>{booking.station_name}</div>
          ))}
        </div>
      )}

      <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
        Previous
      </button>
      <button onClick={() => setPage((p) => p + 1)}>Next</button>
    </div>
  );
}
```

---

### 📦 Example 3: Station Service với search

```javascript
// filepath: src/services/station.service.js
import { apiSlice } from "../api/apiSlice";

export const stationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /stations/nearby - Tìm trạm gần nhất
    getNearbyStations: builder.query({
      query: ({ latitude, longitude, radius = 5 }) => ({
        url: '/stations/nearby',
        method: 'GET',
        params: { latitude, longitude, radius },
      }),
      providesTags: ['Station'],
    }),

    // GET /stations/search - Tìm kiếm trạm theo tên
    searchStations: builder.query({
      query: (searchTerm) => ({
        url: '/stations/search',
        method: 'GET',
        params: { q: searchTerm },
      }),
      providesTags: ['Station'],
    }),

    // GET /stations/:id/availability - Kiểm tra pin có sẵn
    getStationAvailability: builder.query({
      query: (stationId) => ({
        url: `/stations/${stationId}/availability`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Station', id }],
    }),
  }),
});

export const {
  useGetNearbyStationsQuery,
  useSearchStationsQuery,
  useGetStationAvailabilityQuery,
} = stationApi;
```

**Sử dụng với debounce:**
```javascript
import { useState } from 'react';
import { useDebounce } from '../../../hooks/useDebounce';
import { useSearchStationsQuery } from '../../../services/station.service';

function StationSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, isLoading } = useSearchStationsQuery(debouncedSearch, {
    skip: debouncedSearch.length < 3, // Chỉ search khi >= 3 ký tự
  });

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search stations..."
      />
      {isLoading && <div>Searching...</div>}
      {data?.data.map((station) => (
        <div key={station.id}>{station.name}</div>
      ))}
    </div>
  );
}
```

---

## 🆘 Troubleshooting

### Vấn đề 1: API không được gọi
**Kiểm tra:**
- `.env.local` có đúng `VITE_API_BASE_URL`?
- Server backend có đang chạy?
- Network tab trong DevTools có request không?

### Vấn đề 2: 401 Unauthorized
**Kiểm tra:**
- Access token có trong Redux state không? (`state.auth.accessToken`)
- Token có hết hạn không?
- Header `Authorization` có được gửi không?

### Vấn đề 3: Data không update sau mutation
**Giải pháp:**
- Đảm bảo dùng đúng `invalidatesTags` trong mutation
- Đảm bảo dùng đúng `providesTags` trong query

### Vấn đề 4: TypeScript errors (nếu dùng TS)
**Giải pháp:**
- Định nghĩa types cho request/response
- Dùng generics: `builder.query<ResponseType, RequestType>`

---

## 📚 Tài liệu tham khảo

- [RTK Query Docs](https://redux-toolkit.js.org/rtk-query/overview)
- [Axios Docs](https://axios-http.com/docs/intro)
- [Redux Toolkit Docs](https://redux-toolkit.js.org/)

---

## 💡 Tips cuối

1. **Luôn kiểm tra response structure từ BE** trước khi code
2. **Dùng Postman/Thunder Client** để test API trước
3. **Console.log** response trong `onQueryStarted` để debug
4. **Đọc error message** từ `error.data.errorMessage`
5. **Hỏi khi không hiểu** - đừng ngại!

---

**Happy coding! 🚀**