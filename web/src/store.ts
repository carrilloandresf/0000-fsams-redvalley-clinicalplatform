import { combineReducers, configureStore } from '@reduxjs/toolkit';

// Root reducer placeholder – add slices here as they are implemented.
const rootReducer = combineReducers({});

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
