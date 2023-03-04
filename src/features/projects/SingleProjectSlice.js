import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { TOKEN } from "../auth/authSlice";

import {
  get,
  getNoCatch,
  getWithTokenNoCatch,
  getWithToken,
  putWithToken,
  postWithToken,
  deleteWithToken,
} from "../requestWithToken";

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const getFilesAsync = createAsyncThunk(
  "getFiles",
  async ({ projectId, availableFiles, checkIfShareable }) => {

  }
);

export const getFileAsync = createAsyncThunk(
  "getFile",
  async ({ fileLabel, projectId, filePath }) => {
  }
);

export const writeFileAsync = createAsyncThunk(
  "writeFile",
  async ({ projectId, filePath, file }) => {
  }
);

export const addFileAsync = createAsyncThunk("addFile", async (formData) => {

});

export const deleteFileAsync = createAsyncThunk(
  "deleteFile",
  async ({ deleteParam, type }) => {

  }
);

export const fetchSingleProjectAsync = createAsyncThunk(
  "singleProject",
  async ({ projectId, checkIfShareable }) => {

  }
);

export const updateProjectAsync = createAsyncThunk(
  "updateProject",
  async ({ projectId, updateData }) => {

  }
);

export const createSectionAsync = createAsyncThunk(
  "createSection",
  async (payload) => {

  }
);

export const deleteSectionAsync = createAsyncThunk(
  "deleteSection",
  async (sectionId) => {

  }
);

export const singleProjectSlice = createSlice({
  name: "singleProject",
  initialState: {
    id: 1,
    name: "junk",
    type: "x",
    recordLatencyAdjustment: .45,
    sectionDuration: null,
    graphicsFn: 0,
    shareable: true,
    sections: [],
    availableFiles: {}, // de-duped, key is file.name
    audioRawFiles: {}, // de-duped, key is file.name
    audioPlayerFile: "No Audio Yet"
  },

  reducers: {
    setAudioPlayerFile(state, action) {
      state.audioPlayerFile = action.payload;
    }
  }

});

export const { setAudioPlayerFile } = singleProjectSlice.actions

export default singleProjectSlice.reducer;
