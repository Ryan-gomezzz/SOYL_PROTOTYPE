import { useState } from "react";
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { login, register, type User } from "../lib/auth";

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

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"signUp" | "confirm" | "signIn">("signIn");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function signUp() {
    setLoading(true);
    setMessage("");
    
    try {
      const user = await register(email, password);
      if (user) {
        setMessage("Registration successful! You can now sign in.");
        setStage("signIn");
      }
    } catch (err: any) {
      setMessage(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  function confirm() {
    if (!userPool) {
      setMessage("Authentication is not configured. Please configure AWS Cognito credentials.");
      return;
    }
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

  async function signIn() {
    setLoading(true);
    setMessage("");
    
    try {
      const user = await login(email, password);
      if (user) {
        localStorage.setItem("soyl_email", email);
        setMessage("Signed in successfully!");
        setTimeout(() => {
          if (user.role === 'admin') {
            navigate("/admin");
          } else {
            navigate("/dashboard");
          }
        }, 1000);
      } else {
        setMessage("Invalid email or password. Try: admin@soyl.com / admin123 for admin access");
      }
    } catch (err: any) {
      setMessage(err.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
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

