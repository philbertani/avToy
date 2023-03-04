import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

/*
  CONSTANT VARIABLES
*/
export const TOKEN = "token";

/*
  THUNKS
*/
export const me = createAsyncThunk("auth/me", async () => {
  const token = window.localStorage.getItem(TOKEN);
  console.log('there is a token:',token)
});

export const authenticate = createAsyncThunk(
  "auth/authenticate",
  async ({ username, password, method }, thunkAPI) => {
    console.log('no auth happening - sorry')
  });

/*
  SLICE
*/
export const authSlice = createSlice({
  name: "auth",
  initialState: {
    me: {id:1, username:"philip"},
    error: 0,
    globalGraphicsFn: 0,
  },
  reducers: {
    logout(state, action) {
      window.localStorage.removeItem(TOKEN);
    },
    setGlobalGraphics(state, action) {
      state.globalGraphicsFn = action.payload;
    },
  },

});

/*
  ACTIONS
*/
export const { logout, setGlobalGraphics } = authSlice.actions;

/*
  REDUCER
*/
export default authSlice.reducer;
