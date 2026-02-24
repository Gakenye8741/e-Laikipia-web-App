import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.css';
import { Home } from './pages/Home';
import { About } from './pages/About';
import Login from './pages/Login';
import { AdminDashBoard } from './pages/AdminDashBoard';

import ProtectedRoutes from './components/ProtectedRoutes';
import Error from './pages/Error';
import { Analytics } from './DashBoards/adminDashboard/Analytics';
import { AllUsers } from './DashBoards/adminDashboard/AllUsers';
import ContactForm from './pages/Contact';
import RootLayout from './DashBoards/dashboardDesign/RootLayout';
import EmailVerification from './pages/EmailVerification';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/PasswordReset';
import AdminUserProfile from './DashBoards/adminDashboard/AdminUserProfile';
import { Toaster } from 'react-hot-toast';
import { AllElections } from './DashBoards/adminDashboard/AllElections';
import { AllPositions } from './DashBoards/adminDashboard/AllPositions';
import CandidateApplication from './DashBoards/adminDashboard/Applications';
import NotificationManager from './DashBoards/adminDashboard/AllNotifications';
import { AdminCandidateManager } from './DashBoards/adminDashboard/AllCandidates';

function App() {
  const Router = createBrowserRouter([
    {
      path: '/',
      element: <RootLayout/>, // 👈 Apply TokenExpiryWatcher here
      children: [
        { path: '/', element: <Home /> },
        { path: '/about', element: <About /> },
        { path: '/login', element: <Login /> },
        { path: '/contact', element: <ContactForm /> },
        { path: "/email-verification", element: <EmailVerification />, errorElement: <Error /> },
        { path: "/forgot-password",element: <ForgotPassword />,errorElement: <Error /> },
        { path: "/reset-password/:token",element: <ResetPassword />,errorElement: <Error />,
  },
      ],
    },
    {
      path: 'admindashboard',
      element: (
        <ProtectedRoutes>
          <AdminDashBoard />
        </ProtectedRoutes>
      ),
      errorElement: <Error />,
      children: [
        { path: 'Analytics', element: <Analytics /> },
        { path: 'AllElections', element:<AllElections/>},
        { path: 'Manage-positions', element:<AllPositions/>},
        { path: 'Manage-Applications', element: <CandidateApplication/>},
        { path: 'Manage-Users', element: <AllUsers /> },
        { path: 'AllNotifications', element: <NotificationManager/>} ,
        { path: 'adminprofile', element: <AdminUserProfile /> },
         { path: 'Manage-Candidates', element: <AdminCandidateManager /> },
        
        
      ],
    },
  ]);

  return(
    <>
      <Toaster position='top-right' reverseOrder={false}/>
      <RouterProvider router={Router} />
    </>
    
  ) 
}

export default App;
