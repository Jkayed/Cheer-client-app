import { Input } from "@nextui-org/react";
import { doPasswordReset } from "../firebase/auth";
import { useState } from "react";
function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState(""); // To show success or error message
  
    const handlePasswordReset = async () => {
      if (!email) {
        setMessage("Please enter your email address.");
        return;
      }
  
      try {
        await doPasswordReset(email);
        setMessage("Password reset email sent successfully. Check your inbox.");
        setEmail(""); // Clear the email field
      } catch (error) {
        setMessage(error.message || "Failed to send password reset email.");
      }
    };
  
    return (
  
      <div className="signup-background">
      <div className="sign-up-container">
        <div className="form-half">
          <div className="sign-up-form">
          <h2 className="text-xl font-bold mb-4">Reset Password</h2>
        <div>
          <input
            type="email"
            className="input-field border p-2 w-full mb-4"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            className="reset-button bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600"
            onClick={handlePasswordReset}
          >
            Reset Password
          </button>
           
          {message && <p className="text-sm mt-4">{message}</p>} {/* Display messages */} 
          </div>
        </div>
      
      </div>
      </div>
      </div>
      
    );
  };
  


export default ForgotPassword;