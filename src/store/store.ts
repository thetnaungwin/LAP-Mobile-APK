import postReducer from "../store/slices/postSlice";
import authReducer from "../store/slices/authSlice";
import groupReducer from "../store/slices/groupSlice";
import { configureStore } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import { reduxStorage } from "../config/mmkvStorage";

const authPersistConfig = {
  key: "auth",
  storage: reduxStorage,
  version: 1,
};
const postPersistConfig = {
  key: "post",
  storage: reduxStorage,
  version: 1,
};
const groupPersistConfig = {
  key: "group",
  storage: reduxStorage,
  version: 1,
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedPostsReducer = persistReducer(postPersistConfig, postReducer);
const persistedGroupsReducer = persistReducer(groupPersistConfig, groupReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    post: persistedPostsReducer,
    group: persistedGroupsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store);
