import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { Tables } from "../../types/database.types";

type Group = Tables<"groups">;

export type TGroupData = {
  groupData: Group[];
  group: Group | null;
};

const initialState: TGroupData = {
  groupData: [],
  group: null,
};

const groupSlice = createSlice({
  name: "groupData",
  initialState,
  reducers: {
    getGroup: (state, action: PayloadAction<Group[]>) => {
      state.groupData = action.payload;
    },
    setGroup: (state, action: PayloadAction<Group | null>) => {
      state.group = action.payload;
    },
  },
});

export const { getGroup, setGroup } = groupSlice.actions;

export default groupSlice.reducer;
