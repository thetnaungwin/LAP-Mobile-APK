import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { Tables } from "../../types/database.types";

type Post = Tables<"posts"> & {
  group: Tables<"groups">;
  upvotes: { sum: number }[];
};

export type TPostData = {
  postData: Post[];
};

const initialState: TPostData = {
  postData: [],
};

const postSlice = createSlice({
  name: "postData",
  initialState,
  reducers: {
    getPost: (state, action: PayloadAction<Post[]>) => {
      state.postData = action.payload;
    },
    addPost: (state, action: PayloadAction<Post>) => {
      state.postData.push(action.payload);
    },
    deletePost: (state, action: PayloadAction<string>) => {
      state.postData = state.postData.filter(
        (post) => post.id !== action.payload
      );
    },
    updatePost: (state, action: PayloadAction<Post>) => {
      const findPostIndex = state.postData.findIndex(
        (post) => post.id === action.payload.id
      );

      if (findPostIndex !== -1) {
        state.postData[findPostIndex] = action.payload;
      } else {
        console.warn(`Post ID ${action.payload.id} not found in Posts`);
      }
    },
  },
});

export const { getPost, addPost, deletePost, updatePost } = postSlice.actions;

export default postSlice.reducer;
