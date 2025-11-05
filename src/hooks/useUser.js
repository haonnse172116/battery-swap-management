import { useState, useEffect } from 'react';
import { useGetMyProfileQuery } from '../services/user.service';
import { getAccessToken } from '../utils/auth';

export const useUser = () => {
  const accessToken = getAccessToken();
  
  const [userInfo, setUserInfo] = useState(null);

  const { 
    data: profileResponse, 
    isLoading, 
    error,
    isSuccess
  } = useGetMyProfileQuery(undefined, {
    skip: !accessToken, // Skip nếu không có token
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (isSuccess && profileResponse?.content) {
      const userData = {
        userId: profileResponse.content.userId,
        fullName: profileResponse.content.fullName,
        email: profileResponse.content.email,
        phone: profileResponse.content.phone,
        avatar_url: profileResponse.content.avatarUrl, // Map to consistent field name
        role: profileResponse.content.role,
        status: profileResponse.content.status,
        createdAt: profileResponse.content.createdAt,
      };
      setUserInfo(userData);
    } else if (!isLoading && !accessToken) {
      // Clear user info nếu không có token
      setUserInfo(null);
    }
  }, [profileResponse, isSuccess, isLoading, accessToken]);


  return {
    userInfo,
    isLoading,
    error,
  };
};

export default useUser;