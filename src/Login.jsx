import banner from "./assets/login01.webp";
import { useNavigate } from "react-router";
import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated, Unauthenticated } from "convex/react";
import Oops from "./Oops.jsx";

export default function Login() {

  let [create, setCreate] = useState(false);
  const nav = useNavigate();
  const auth = useAuthActions();

  async function handleSubmit(e) {
    e.preventDefault();
    const formdata = new FormData(e.currentTarget);
    formdata.set("flow", create ? "signUp" : "signIn");
    try {
      await auth.signIn("password", formdata);
      nav("/");
    } catch (e) {
      alert(e.message);  // Change to a proper error message in production
    }
  }

  return (
    <>
      <Unauthenticated>
        <div className="login">
          <div>
            <div title="This image was human-made, not AI-generated!" className="login-banner" style={{ backgroundImage: `url("${banner}")` }}>
              {create ? <div>Create an account<br />to get started</div> : <div>Sign in to<br />get started</div>}
            </div>
            <div className="login-right">
              <form onSubmit={handleSubmit}>
                <input name="email" placeholder="email" type="email" />
                <input name="password" placeholder="password" type="password" />
                {create && <input name="name" placeholder="name" type="text" />}
                <button type="submit">{create ? "Sign up" : "Sign in"}</button>
              </form>
              <div className="login-sso">
                <div>
                  <img
                    alt="Google"
                    src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original" />
                  <div>Continue with Google</div>
                </div>
                <div>
                  <img
                    alt="GitHub"
                    src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original" />
                  <div>Continue with GitHub</div>
                </div>
              </div>
              <div>
                <div className="login-right-bottom">
                  <div className="linkghost"
                       onClick={() => setCreate(!create)}>{create ? "Sign In Instead" : "Create Account"}</div>
                  <div className="linkghost">Forgot Password</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Unauthenticated>
      <Authenticated>
        <Oops>You're all logged in.<br/>Would you like to visit the <span className="linknormal" onClick={()=>nav("/")}>home page</span>?</Oops>
      </Authenticated>
    </>
  );
}
