import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.css';
import { Home } from './pages/Home';
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
import AboutPage from './pages/About';
import DeveloperPage from './pages/Developer';
import { AccountRegistry } from './DashBoards/adminDashboard/AccountRegistry';
import { DeanStudentDashBoard } from './pages/Dean_Student_Dashboard';
import { AllStudents } from './DashBoards/DeanStudentDashboard/AllStudents';
import CandidateApplicationDeansDashBoard from './DashBoards/DeanStudentDashboard/Applications';
import { Elections } from './DashBoards/DeanStudentDashboard/Elections';
import { Positions } from './DashBoards/DeanStudentDashboard/Positions';
import { DeanSchoolDashBoard } from './pages/Dean_schools_Dashboard';
import { AllSchoolStudents } from './DashBoards/SchoolDeansDashboard/Users';
import CandidateApplicationSchoolDeans from './DashBoards/SchoolDeansDashboard/Applications';
import { AccountsDashBoard } from './pages/AccountsDashboard';
import CandidateApplicationAccounts from './DashBoards/AccountsDashboard/Applications';
import ResultsScreen from './pages/Results';
import { AdminAppeals } from './DashBoards/adminDashboard/AllAppeals';
import { AccountsAppeals } from './DashBoards/AccountsDashboard/ManageAppeals';
import { DeansAppeals } from './DashBoards/DeanStudentDashboard/ManageAppeals';
import { SchoolDeansAppeals } from './DashBoards/SchoolDeansDashboard/Appeal';
import { CandidateManager } from './DashBoards/DeanStudentDashboard/Candidates';
import { AllVotesAudit } from './DashBoards/adminDashboard/AllVotes';
import { AdminCoalitionManager } from './DashBoards/adminDashboard/AllCoalition';

function App() {
  const Router = createBrowserRouter([
    {
      path: '/',
      element: <RootLayout/>, // 👈 Apply TokenExpiryWatcher here
      children: [
        { path: '/', element: <Home /> },
        { path: '/about', element: <AboutPage /> },
        { path: '/login', element: <Login /> },
        { path: '/contact', element: <ContactForm /> },
        { path: "/email-verification", element: <EmailVerification />, errorElement: <Error /> },
        { path: "/forgot-password",element: <ForgotPassword />,errorElement: <Error /> },
        { path: "/reset-password/:token",element: <ResetPassword />,errorElement: <Error />},
        { path: "/developer" , element: <DeveloperPage />,errorElement: <Error />},
        { path: "/results" , element: <ResultsScreen />,errorElement: <Error />},
  
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
        { path: "create-accounts" , element: <AccountRegistry />},
        { path: "Manage-Appeals" , element: <AdminAppeals />},
        { path: "Manage-Votes" ,  element: <AllVotesAudit />},
        { path: "Manage-Coalition" ,  element: <AdminCoalitionManager />},
        
        
      ],
    },
    {
      path: 'dean-student-dashboard',
      element: (
        <ProtectedRoutes>
          <DeanStudentDashBoard />
        </ProtectedRoutes>
      ),
      errorElement: <Error />,
      children: [
        { path: 'Analytics', element: <Analytics /> },
        { path: 'AllElections', element:<Elections/>},
        { path: 'Manage-positions', element:<Positions/>},
        { path: 'Manage-Applications', element: <CandidateApplicationDeansDashBoard/>},
        { path: 'Manage-Users', element: <AllStudents /> },
        { path: 'AllNotifications', element: <NotificationManager/>} ,
        { path: 'adminprofile', element: <AdminUserProfile /> },
        { path: 'Manage-Candidates', element: <CandidateManager /> },
        { path: 'Manage-Appeals', element: <DeansAppeals /> },
        
        
      ],
    },
     {
      path: 'dean-school-dashboard',
      element: (
        <ProtectedRoutes>
          <DeanSchoolDashBoard />
        </ProtectedRoutes>
      ),
      errorElement: <Error />,
      children: [
        { path: 'Analytics', element: <Analytics /> },
        { path: 'AllElections', element:<Elections/>},
        { path: 'Manage-positions', element:<Positions/>},
        { path: 'Manage-Applications', element: <CandidateApplicationSchoolDeans/>},
        { path: 'Manage-Users', element: <AllSchoolStudents /> },
        { path: 'Manage-Appeals', element: <SchoolDeansAppeals/>} ,
        { path: 'adminprofile', element: <AdminUserProfile /> },
         { path: 'Manage-Candidates', element: <CandidateManager /> },
        
        
      ],
    }, 
     {
      path: 'accounts-dashboard',
      element: (
        <ProtectedRoutes>
          <AccountsDashBoard />
        </ProtectedRoutes>
      ),
      errorElement: <Error />,
      children: [
        { path: 'Analytics', element: <Analytics /> },
        { path: 'AllElections', element:<Elections/>},
        { path: 'Manage-positions', element:<Positions/>},
        { path: 'Manage-Applications', element: <CandidateApplicationAccounts/>},
        { path: 'Manage-Appeals', element: <AccountsAppeals/>},
        { path: 'Manage-Users', element: <AllStudents /> },
        { path: 'AllNotifications', element: <NotificationManager/>} ,
        { path: 'adminprofile', element: <AdminUserProfile /> },
         { path: 'Manage-Candidates', element: <CandidateManager /> },
        
        
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
