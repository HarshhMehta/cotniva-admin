import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type IUser = {
  _id: string;
  name: string;
  email: string;
  role?: string;
  image?: string;
  phone?: string;
};

type AuthState = {
  user: IUser | undefined;
  authenticated: boolean;
};

const initialState: AuthState = {
  user: undefined,
  authenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userLoggedIn: (state, { payload }: PayloadAction<{ user: IUser }>) => {
      state.user = payload.user;
      state.authenticated = true;
    },
    userLoggedOut: (state) => {
      state.user = undefined;
      state.authenticated = false;
    },
  },
});

export const { userLoggedIn, userLoggedOut } = authSlice.actions;
export default authSlice.reducer;
