import { useState } from "react";
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const poolData = {
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || "",
  ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || ""
};
const userPool = new CognitoUserPool(poolData);

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"signUp" | "confirm" | "signIn">("signIn");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function signUp() {
    setLoading(true);
    setMessage("");
    userPool.signUp(email, password, [], [], (err, _result) => {
      setLoading(false);
      if (err) {
        setMessage(err.message || JSON.stringify(err));
        return;
      }
      setMessage("Signup successful! Please check your email for a confirmation code.");
      setStage("confirm");
    });
  }

  function confirm() {
    setLoading(true);
    setMessage("");
    const user = new CognitoUser({ Username: email, Pool: userPool });
    user.confirmRegistration(code, true, (err, _result) => {
      setLoading(false);
      if (err) {
        setMessage(err.message || JSON.stringify(err));
        return;
      }
      setMessage("Account confirmed! Please sign in.");
      setStage("signIn");
    });
  }

  function signIn() {
    setLoading(true);
    setMessage("");
    const authDetails = new AuthenticationDetails({ Username: email, Password: password });
    const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (data) => {
        setLoading(false);
        const idToken = (data as any).getIdToken().getJwtToken();
        localStorage.setItem("soyl_id_token", idToken);
        localStorage.setItem("soyl_email", email);
        setMessage("Signed in successfully!");
        setTimeout(() => navigate("/dashboard"), 1000);
      },
      onFailure: (err) => {
        setLoading(false);
        setMessage(err.message || JSON.stringify(err));
      }
    });
  }

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center bg-black px-4">
      <motion.div
        className="card max-w-md w-full"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-soyl-gold to-soyl-bronze rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-soyl-black font-bold text-2xl">S</span>
          </div>
          <h3 className="font-serif text-3xl font-semibold text-soyl-gold mb-2">
            {stage === "confirm" ? "Confirm Your Account" : stage === "signIn" ? "Welcome Back" : "Create Account"}
          </h3>
          <p className="text-soyl-silver">
            {stage === "confirm" ? "Enter the code sent to your email" : "Sign in to continue to SOYL"}
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-soyl-white font-medium mb-2">Email</label>
            <input 
              type="email"
              value={email} 
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="input-field w-full"
              disabled={loading}
            />
          </div>

          {stage !== "confirm" && (
            <div>
              <label className="block text-soyl-white font-medium mb-2">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field w-full"
                disabled={loading}
              />
            </div>
          )}

          {stage === "confirm" && (
            <div>
              <label className="block text-soyl-white font-medium mb-2">Confirmation Code</label>
              <input 
                type="text"
                value={code} 
                onChange={e => setCode(e.target.value)}
                placeholder="123456"
                className="input-field w-full"
                disabled={loading}
              />
            </div>
          )}
          
          {stage === "confirm" ? (
            <button 
              onClick={confirm} 
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? "Confirming..." : "Confirm Account"}
            </button>
          ) : stage === "signIn" ? (
            <button 
              onClick={signIn} 
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          ) : (
            <button 
              onClick={signUp} 
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          )}

          {stage === "signIn" && (
            <div className="text-center pt-4 border-t border-soyl-silver/20">
              <button 
                className="text-soyl-gold hover:text-soyl-white transition-colors text-sm"
                onClick={() => setStage("signUp")}
              >
                Don't have an account? Sign up
              </button>
            </div>
          )}

          {stage === "signUp" && (
            <div className="text-center pt-4 border-t border-soyl-silver/20">
              <button 
                className="text-soyl-gold hover:text-soyl-white transition-colors text-sm"
                onClick={() => setStage("signIn")}
              >
                Already have an account? Sign in
              </button>
            </div>
          )}
          
          {message && (
            <div className={`text-sm text-center p-3 rounded-lg ${
              message.includes("success") || message.includes("Signed in")
                ? "bg-green-900/30 text-green-400 border border-green-700/50"
                : "bg-red-900/30 text-red-400 border border-red-700/50"
            }`}>
              {message}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

