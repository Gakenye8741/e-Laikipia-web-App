// import { useState, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import toast from 'react-hot-toast';

// import { TextInput } from '../components/TextInput';
// import { userApi } from '../features/APIS/UserApi';

// export const EmailVerification = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const prefilledEmail = location.state?.email || '';
//   const [email, setEmail] = useState(prefilledEmail);
//   const [confirmationCode, setConfirmationCode] = useState('');

//   const [emailVerification, { isLoading }] = userApi.useVerifyEmailMutation();

//   useEffect(() => {
//     if (!prefilledEmail) {
//       toast.error("No email provided. Please register first.");
//       navigate("/register");
//     }
//   }, [prefilledEmail, navigate]);

//   const handleVerification = async (e: any) => {
//     e.preventDefault();
//     const loadingToast = toast.loading("Verifying...");
//     try {
//       const response = await emailVerification({ email, confirmationCode }).unwrap();
//       toast.success(response.message || "Email verified successfully", { id: loadingToast });
//       setTimeout(() => navigate('/login'), 1500);
//     } catch (err: any) {
//       toast.error(err?.data?.error || 'Verification failed', { id: loadingToast });
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 transition-colors duration-300">
//       <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 max-w-md w-full border border-gray-200 dark:border-gray-700">
//         <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-400 text-center mb-6">
//           Email Verification
//         </h2>

//         <form onSubmit={handleVerification} className="space-y-4">
//           <TextInput
//             label="Email"
//             type="email"
//             placeholder="Enter your email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             icon={undefined}
//             name={''}
//           />

//           <TextInput
//             label="Confirmation Code"
//             type="text"
//             placeholder="Enter your OTP"
//             value={confirmationCode}
//             onChange={(e) => setConfirmationCode(e.target.value)}
//             icon={undefined}
//             name={''}
//           />

//           <button
//             type="submit"
//             className={`w-full py-3 px-4 rounded-md font-semibold text-white transition-all duration-200 ${
//               isLoading
//                 ? 'bg-gray-400 cursor-not-allowed'
//                 : 'bg-blue-700 hover:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600 hover:shadow-lg transform hover:-translate-y-0.5'
//             }`}
//             disabled={isLoading}
//           >
//             {isLoading ? (
//               <div className="flex items-center justify-center space-x-2">
//                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                 <span>Verifying...</span>
//               </div>
//             ) : (
//               "Verify Email"
//             )}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default EmailVerification;
