import Oops from "./Oops.jsx";
import { Link, useLocation, useNavigate } from "react-router";

export default function Notfound() {
  const loc = useLocation();
  const nav = useNavigate();
  return (
    <Oops>
      <div>
        Sorry, we could not find the page{loc ? ` "${loc.pathname}"` : ""}!
        <br />
        Check your spelling or go to the <span className="linknormal" onClick={()=>nav("/")}>home page</span>.
      </div>
    </Oops>
  );
}
