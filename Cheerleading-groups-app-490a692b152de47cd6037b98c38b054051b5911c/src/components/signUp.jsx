import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { Button } from "@nextui-org/react";
import { doCreateUserWithEmailAndPassword } from "../firebase/auth";
import "../css/signUp.css";

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate(); // Initialize navigate

  function setEmailFunction(e) {
    setEmail(e.target.value);
  }

  function setPasswordFunction(e) {
    setPassword(e.target.value);
  }

  function validatePassword(password) {
    const isValidLength = password.length >= 6;
    const hasNumber = /\d/.test(password);
    return isValidLength && hasNumber;
  }

  async function signUpHandler() {
    if (!validatePassword(password)) {
      setErrorMessage(
        "Password must be at least 6 characters long and include at least one number."
      );
      return;
    }

    setErrorMessage(""); // Clear previous error message

    try {
      await doCreateUserWithEmailAndPassword(email, password);
      // Redirect to login page after successful signup
      navigate("/login");
    } catch (error) {
      // Handle signup errors
      if (error.code === "auth/email-already-in-use") {
        setErrorMessage("This email address is already in use.");
      } else {
        setErrorMessage("An error occurred during signup. Please try again.");
      }
    }
  }

  return (
    <div className="signup-background">
    <div className="sign-up-container">
      <div className="form-half">
        <div className="sign-up-form">
          <h2 className="text-center sign-up-header">Create an account</h2>
          <input
            className="email-input2"
            placeholder="Email"
            onChange={setEmailFunction}
            value={email}
            required
          />
          <input
            className="password-input2"
            placeholder="Password"
            type="password"
            onChange={setPasswordFunction}
            value={password}
            required
          />
          <Button onClick={signUpHandler} className="sign-up-button">
            Sign up
          </Button>
          <p className="signUp-label">
            Have an account?{" "}
            <span onClick={() => navigate("/login")}>Log in</span>
          </p>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
      </div>
      <div className="background-half"></div>
    </div>
    </div>
  );
}

export default SignUp;
