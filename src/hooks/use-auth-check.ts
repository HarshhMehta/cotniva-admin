"use client";
import { useState, useEffect, useCallback } from "react";
import { RootState } from "./../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { userLoggedIn, userLoggedOut } from "@/redux/auth/authSlice";
import { API_BASE } from "@/utils/admin-auth-headers";
import { refreshAdminSession } from "@/redux/auth/authApi";

export default function useAuthCheck() {
  const dispatch = useDispatch();
  const { user, authenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const [authChecked, setAuthChecked] = useState<boolean>(false);

  const verifySession = useCallback(async () => {
    try {
      let res = await fetch(`${API_BASE}/api/admin/me`, {
        credentials: "include",
      });
      if (res.status === 401) {
        const refreshed = await refreshAdminSession();
        if (refreshed) {
          res = await fetch(`${API_BASE}/api/admin/me`, {
            credentials: "include",
          });
        }
      }
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          dispatch(userLoggedIn({ user: data.user }));
          return;
        }
      }
      dispatch(userLoggedOut());
    } catch {
      dispatch(userLoggedOut());
    } finally {
      setAuthChecked(true);
    }
  }, [dispatch]);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  return {
    authChecked,
    user,
    authenticated,
  };
}
