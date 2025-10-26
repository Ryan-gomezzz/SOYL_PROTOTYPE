import { useState } from "react";
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js";

// Get AWS Cognito credentials from environment variables
const getUserPool = () => {
  const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
  
  if (!userPoolId || !clientId) {
    return null; // Return null if credentials are not configured
  }
  
  const poolData = {
    UserPoolId: userPoolId,
    ClientId: clientId
  };
  return new CognitoUserPool(poolData);
};

const userPool = getUserPool();

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"signUp" | "confirm" | "signedIn">("signUp");
  const [message, setMessage] = useState("");

  function signUp() {
    if (!userPool) {
      setMessage("Authentication is not configured. Please configure AWS Cognito credentials.");
      return;
    }
    userPool.signUp(email, password, [], [], (err, _result) => {
      if (err) {
        setMessage(err.message || JSON.stringify(err));
        return;
      }
      setMessage("Signup success. Please check email for confirmation code.");
      setStage("confirm");
    });
  }

  function confirm() {
    if (!userPool) {
      setMessage("Authentication is not configured. Please configure AWS Cognito credentials.");
      return;
    }
    const user = new CognitoUser({ Username: email, Pool: userPool });
    user.confirmRegistration(code, true, (err, _result) => {
      if (err) {
        setMessage(err.message || JSON.stringify(err));
        return;
      }
      setMessage("Confirmed. Please sign in.");
      setStage("signUp");
    });
  }

  function signIn() {
    if (!userPool) {
      setMessage("Authentication is not configured. Please configure AWS Cognito credentials.");
      return;
    }
    const authDetails = new AuthenticationDetails({ Username: email, Password: password });
    const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (data) => {
        setMessage("Signed in");
        setStage("signedIn");
        const idToken = (data as any).getIdToken().getJwtToken();
        localStorage.setItem("soyl_id_token", idToken);
      },
      onFailure: (err) => {
        setMessage(err.message || JSON.stringify(err));
      }
    });
  }

  return (
    <div className="card max-w-md mx-auto">
      <h3 className="font-serif text-2xl font-semibold text-soyl-white mb-6 text-center">
        Sign up / Sign in
      </h3>
      
      <div className="space-y-4">
        <input 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          placeholder="Email" 
          className="input-field" 
        />
        <input 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          placeholder="Password" 
          className="input-field" 
        />
        
        {stage === "confirm" && (
          <>
            <input 
              value={code} 
              onChange={e => setCode(e.target.value)} 
              placeholder="Confirmation code" 
              className="input-field" 
            />
            <button onClick={confirm} className="btn-primary w-full">
              Confirm
            </button>
          </>
        )}
        
        {stage !== "confirm" && (
          <div className="flex gap-3">
            <button onClick={signUp} className="btn-primary flex-1">
              Sign Up
            </button>
            <button onClick={signIn} className="btn-secondary flex-1">
              Sign In
            </button>
          </div>
        )}
        
        <div className="text-sm text-soyl-silver text-center">
          {message}
        </div>
      </div>
    </div>
  );
}