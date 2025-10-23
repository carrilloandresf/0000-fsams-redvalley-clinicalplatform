import { configureStore } from '@reduxjs/toolkit';

// Root reducer placeholder – replace with actual slices as they are implemented.
type EmptyState = Record<string, never>;

const rootReducer = (state: EmptyState = {}): EmptyState => state;

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
