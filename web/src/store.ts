import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    // aquí agregaremos slices si hacen falta
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;