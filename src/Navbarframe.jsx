import { useNavigate, useLocation } from "react-router";
import { useState, useContext } from "react";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Navbarcontext } from "@/Navbarcontext.jsx";
import { useAuthActions } from "@convex-dev/auth/react";

import logo from "./assets/logo01.png";
import image from "./assets/userimage01.webp";

function Profile() {
  const nav = useNavigate();

  const user = useQuery(api.users.getAuth);
  const auth = useAuthActions();
  let [expand, setExpand] = useState(false);

  return (
    <div className={expand?"profile-outer eprofile-outer":"profile-outer"} onMouseDown={()=>setExpand(true)} onMouseLeave={()=>setExpand(false)}>
      <div className={expand?"profile-inner eprofile-inner":"profile-inner"}>
        <div className={expand?"profile-header eprofile-header":"profile-header"}>
          <img src={image} alt="profile" style={{imageRendering: "crisp-edges"}}/>
          <div>{user?.name}</div>
        </div>
        <div className="profile-options">
          <div><div>Account</div></div>
          <div><div>Settings</div></div>
          <div onClick={async()=>{await auth.signOut(); nav("/");}}><div>Log Out</div></div>
        </div>
      </div>
    </div>
  )
}

function Navbar() {

  const nc = useContext(Navbarcontext);

  const nav = useNavigate();
  const loc = useLocation();

  const [searching, setSearching] = useState(false);

  return (
    <div className="navbar">
      <img
        className="logo"
        alt="Idea4Project"
        src={logo}
        onClick={() => {
          nav("/");
          nav(0);
        }}
      />

      <div style={{ width: 0, flexGrow: searching ? "0" : "1" }}></div>
      {loc?.pathname === "/" &&
        <div className={searching ? "search-outer esearch-outer" : "search-outer"} onFocus={()=>setSearching(true)} onBlur={()=>setSearching(false)}>
          <input placeholder="Search..." />
        </div>
      }
      <Authenticated>
        <div className="postwrapper">
          {
            loc?.pathname === "/post" ?
              <div className="post-button" onClick={()=>nc.setPost(true)}><div>post</div></div>
              :
              <div className="post-button" onClick={()=>nav("/post")}><div>+</div></div>
          }
          <Profile/>
        </div>
      </Authenticated>
      <Unauthenticated>
        <div className="postwrapper">
          {loc?.pathname !== "/login" && <div className="post-button" onClick={()=>nav("/login")}><div>+</div></div>}
          { loc && loc.pathname !== "/login" &&
            <div className="login-button" onClick={()=>nav("/login")}>
              <div>Log In</div>
            </div>
          }
        </div>
      </Unauthenticated>

    </div>
  );
}

export default function Navbarframe({children}) {

  const [post, setPost] = useState(false);

  const nc = {
    post,
    setPost,
  };

  return (
    <>
      <Navbarcontext value={nc}>
        <Navbar/>
        <div></div>
        {children}
      </Navbarcontext>
    </>
  );
}
