// // src/auth.ts
// import { initializeApp } from "firebase/app";
// import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

// // Your web app's Firebase configuration
// // IMPORTANT: Make sure these credentials are correct
// const firebaseConfig = {
//   // apiKey: "AIzaSyBJH-vZGOEu2Kpi_Rw6RGZSTR_nsP_0VSU",
//   // authDomain: "nearbux-ae614.firebaseapp.com",
//   // projectId: "nearbux-ae614",
//   // storageBucket: "nearbux-ae614.appspot.com", // Fixed storage bucket URL
//   // messagingSenderId: "852185715667",
//   // appId: "1:852185715667:web:616be6d84d10fd5a861526"
//   apiKey: "AIzaSyBhEdZXFBmTONsUYBtPRje5yeB9FKQow6Y",
//   authDomain: "nearbux-c7a47.firebaseapp.com",
//   projectId: "nearbux-c7a47",
//   storageBucket: "nearbux-c7a47.firebasestorage.app",
//   messagingSenderId: "714572059577",
//   appId: "1:714572059577:web:90b3f7aaa4e0365335dc68",
//   measurementId: "G-1MXBWLZ59T"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);

// // Track the reCAPTCHA instance globally
// let recaptchaVerifier: RecaptchaVerifier | null = null;

// // Configure reCAPTCHA verifier
// export const setupRecaptcha = (elementId: string) => {
//   // Clear existing reCAPTCHA if it exists
//   if (recaptchaVerifier) {
//     recaptchaVerifier.clear();
//     recaptchaVerifier = null;
//   }
  
//   // Create new reCAPTCHA verifier with explicit language and container size
//   const containerElement = document.getElementById(elementId);
  
//   // Make sure the container is visible and has size
//   if (containerElement) {
//     containerElement.style.display = 'block';
//     containerElement.style.minHeight = '60px';
//   }
  
//   // Create new reCAPTCHA verifier
//   const verifier = new RecaptchaVerifier(auth, elementId, {
//     'size': 'normal', // Changed from 'invisible' to 'normal' to debug
//     'callback': () => {
//       console.log('reCAPTCHA verified');
//     },
//     'expired-callback': () => {
//       console.log('reCAPTCHA expired');
//       clearRecaptcha();
//     }
//   });
  
//   recaptchaVerifier = verifier;
  
//   // Render the reCAPTCHA to make sure it appears
//   verifier.render().then(() => {
//     console.log('reCAPTCHA rendered successfully');
//   }).catch((error) => {
//     console.error('reCAPTCHA render error:', error);
//   });
  
//   return verifier;
// };

// // Clear reCAPTCHA
// export const clearRecaptcha = () => {
//   if (recaptchaVerifier) {
//     try {
//       recaptchaVerifier.clear();
//       console.log('reCAPTCHA cleared successfully');
//     } catch (error) {
//       console.error('Error clearing reCAPTCHA:', error);
//     }
//     recaptchaVerifier = null;
    
//     // Reset the container style
//     const container = document.getElementById('recaptcha-container');
//     if (container) {
//       container.innerHTML = '';
//       container.style.display = 'block';
//       container.style.minHeight = '60px';
//     }
//   }
// };

// // Send OTP to user's phone
// export const sendOTP = async (phoneNumber: string, appVerifier: RecaptchaVerifier): Promise<ConfirmationResult> => {
//   try {
//     // Format phone number with country code if not already formatted
//     const formattedPhoneNumber = phoneNumber.startsWith('+') 
//       ? phoneNumber 
//       : `+91${phoneNumber}`; // Assuming India's country code
    
//     console.log("Sending OTP to:", formattedPhoneNumber);
    
//     // Send verification code
//     const confirmationResult = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);
//     console.log("OTP sent successfully!");
//     return confirmationResult;
//   } catch (error) {
//     console.error("Error sending OTP:", error);
//     // Clear reCAPTCHA on error
//     clearRecaptcha();
//     throw error;
//   }
// };

// // Verify OTP
// export const verifyOTP = async (confirmationResult: ConfirmationResult, verificationCode: string) => {
//   try {
//     const userCredential = await confirmationResult.confirm(verificationCode);
//     console.log("OTP verified successfully");
//     return userCredential.user;
//   } catch (error) {
//     console.error("Error verifying OTP:", error);
//     throw error;
//   }
// };

// export default auth;
// src/firebase/setup.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB_08wQf-gQ7OCtzab4xJu_eBDwTiwNOqs",
  authDomain: "nearbux2.firebaseapp.com",
  projectId: "nearbux2",
  storageBucket: "nearbux2.appspot.com",
  messagingSenderId: "27891946421",
  appId: "1:27891946421:web:ecd7bb69953eea15823ffc"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Disable captcha for testing
auth.settings.appVerificationDisabledForTesting = true;
