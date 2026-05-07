import { configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import authReducer from "../features/Auth/AuthSlice"
import { authApi } from "../features/APIS/Auth.Api";
import { userApi } from "../features/APIS/UserApi";
import { electionApi } from "../features/APIS/Election.Api";
import { positionApi } from "../features/APIS/Position.APi";
import { applicationApi } from "../features/APIS/Applcation.Api";
import { notificationApi } from "../features/APIS/Notification.Api";
import { candidatesApi } from "../features/APIS/CandidateApi";
import { votesApi } from "../features/APIS/Vote.Api";
import { coalitionApi } from "../features/APIS/CoalitionApi";
import { delegatesApi } from "../features/APIS/Delegate.Api";
import { appealsApi } from "../features/APIS/Appeals.Api";
import { adminApi } from "../features/APIS/Admin.Apis";


// Create Persist Configuration for auth Slice

 const authPersistConfiguration ={
    key: 'auth',
    storage,
    whitelist: ['user','token','isAuthenticated','role']
 }
//  Create A persistent Reducer for the AUTH
const persistedAuthReducer =persistReducer(authPersistConfiguration,authReducer)


export const store = configureStore({
    reducer: {
        [authApi.reducerPath]:authApi.reducer,
        [userApi.reducerPath]:userApi.reducer,
        [electionApi.reducerPath]:electionApi.reducer,
        [positionApi.reducerPath]:positionApi.reducer,   
        [applicationApi.reducerPath]: applicationApi.reducer,  
        [notificationApi.reducerPath]: notificationApi.reducer,   
        [candidatesApi.reducerPath]: candidatesApi.reducer,
        [votesApi.reducerPath]: votesApi.reducer,
        [coalitionApi.reducerPath]: coalitionApi.reducer,
        [delegatesApi.reducerPath]: delegatesApi.reducer,
        [appealsApi.reducerPath]: appealsApi.reducer,
        [adminApi.reducerPath]:  adminApi.reducer,
        auth: persistedAuthReducer,
    },
    middleware: (getDefaultMiddleware)=>
        getDefaultMiddleware({
            serializableCheck: false
        }).concat(authApi.middleware,electionApi.middleware,applicationApi.middleware, positionApi.middleware,userApi.middleware,notificationApi.middleware,candidatesApi.middleware, votesApi.middleware, coalitionApi.middleware, delegatesApi.middleware,appealsApi.middleware,adminApi.middleware)
})

export const persister = persistStore(store);
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch