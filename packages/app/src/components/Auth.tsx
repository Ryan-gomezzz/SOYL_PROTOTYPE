import { useState } from "react";
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: (import.meta as any).env?.VITE_COGNITO_USER_POOL_ID || "", // set in env
  ClientId: (import.meta as any).env?.VITE_COGNITO_CLIENT_ID || ""
};
const userPool = new CognitoUserPool(poolData);

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"signUp" | "confirm" | "signedIn">("signUp");
  const [message, setMessage] = useState("");

  function signUp() {
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
    const authDetails = new AuthenticationDetails({ Username: email, Password: password });
    const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (data) => {
        setMessage("Signed in");
        setStage("signedIn");
        // store tokens for API calls
        const idToken = (data as any).getIdToken().getJwtToken();
        localStorage.setItem("soyl_id_token", idToken);
      },
      onFailure: (err) => {
        setMessage(err.message || JSON.stringify(err));
      }
    });
  }

  return (
    <div className="p-4 bg-white/5 rounded">
      <h3 className="text-lg font-medium mb-2">Sign up / Sign in</h3>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full p-2 mb-2 rounded bg-white/5" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full p-2 mb-2 rounded bg-white/5" />
      {stage === "confirm" && (
        <>
          <input value={code} onChange={e=>setCode(e.target.value)} placeholder="Confirmation code" className="w-full p-2 mb-2 rounded bg-white/5" />
          <button onClick={confirm} className="px-4 py-2 border rounded mr-2">Confirm</button>
        </>
      )}
      {stage !== "confirm" && (
        <>
          <div className="flex gap-2">
            <button onClick={signUp} className="px-4 py-2 border rounded">Sign Up</button>
            <button onClick={signIn} className="px-4 py-2 border rounded">Sign In</button>
          </div>
        </>
      )}
      <div className="mt-2 text-sm text-gray-300">{message}</div>
    </div>
  );
}
