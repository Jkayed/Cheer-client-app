import { useState, useEffect } from "react";
import "../App.css";
import "../css/authentication.css";
import { doSignInWithEmailAndPassword, doSignOut } from "../firebase/auth";
import { useAuth } from "../contexts/authContext";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate for redirection

function Authentication() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // State to hold error messages
  const { userLoggedIn } = useAuth();
  const navigate = useNavigate();

  function signUpHandler() {
    navigate("/register");
  }

  function setEmailFunction(e) {
    setEmail(e.target.value);
  }

  function setPasswordFunction(e) {
    setPassword(e.target.value);
  }

  useEffect(() => {
    if (userLoggedIn) {
      navigate("/find-group"); // Redirect to /home if user is logged in
    }
  }, [userLoggedIn, navigate]);

  const logIn = async () => {
    setErrorMessage(""); // Reset the error message

    if (!email || !password) {
      setErrorMessage("Please fill in both email and password.");
      return;
    }

    try {
      if (!userLoggedIn) {
        await doSignInWithEmailAndPassword(email, password);
      }
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        setErrorMessage("No account found with this email.");
      } else if (error.code === "auth/wrong-password") {
        setErrorMessage("Invalid password. Please try again.");
      } else if (error.code === "auth/invalid-email") {
        setErrorMessage("Invalid email format. Please enter a valid email.");
      } else {
        setErrorMessage("Worng email or password. Please try again.");
      }
    }
  };

  return (
    <>
    <div className="authentication-background">
    {userLoggedIn ? (
      <div>
        <p className="sign-out-button" onClick={doSignOut}>
          Sign out
        </p>
      </div>
    ) : (
      <div className="auth-container">
        <div className="form-half">
          <div className="logIn-form">
            <h3 className="logIn-header">Login</h3>
            <p className="logIn-label">Login to discover cheerleading groups!</p>
            <p className="email-input-label">Email Address</p>
            <input
              className="email-input"
              type="text"
              placeholder="Enter email"
              onChange={setEmailFunction}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  logIn();
                }
              }}
            />
            <p className="password-input-label">Password</p>
            <input
              className="password-input"
              type="password"
              placeholder="Enter password"
              onChange={setPasswordFunction}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  logIn();
                }
              }}
            />
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <Link to="/reset" >
            <p className="forgot-password-label">    Forgot password</p>

  </Link>
            <button className="logIn-button" onClick={logIn}>
              Login
            </button>
            <p className="signUp-label">
              Don't have an account? <span onClick={signUpHandler}>Sign up</span>
            </p>
          </div>
        </div>
        <div className="background-half"></div>
      </div>
    )}
    </div>
  </>
  );
}

export default Authentication