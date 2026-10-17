import { Navbarcontext } from "@/Navbarcontext.jsx";
import { useContext, useState, useEffect } from "react";

export default function Post() {

  const nc = useContext(Navbarcontext);

  let [title, setTitle] = useState("");
  let [desc, setDesc] = useState("");
  let [amend, setAmend] = useState("");

  useEffect(
    ()=>{
      if (nc.post === true) {
        console.log(title, desc, amend);
        nc.setPost(false);
      }
    },
    [nc.post]
  )

  return (
    <div className="post">
      <div>
        <div className="imagedrop">Drop your mock-ups here...</div>
        <div className="title">
          <textarea className="title" autoCorrect="on" maxLength="60" value={title} placeholder="A short and descriptive title..." onChange={(e)=>setTitle(e.currentTarget.value)} />
          <div>{title.length > 0 ? `${title.length}/60` : ""}</div>
        </div>
        <div className="desc">
          <textarea className="desc" autoCorrect="on" maxLength="180" value={desc} placeholder="A 1-2 sentence description..." onChange={(e)=>setDesc(e.currentTarget.value)} />
          <div>{desc.length > 0 ? `${desc.length}/180` : ""}</div>
        </div>
        <div className="amend">
          <textarea className="amend" autoCorrect="on" value={amend} placeholder="# An inital set of specifications and details on your idea&#10;*you can add more details later*" onChange={(e)=>setAmend(e.currentTarget.value)} />
        </div>
      </div>
    </div>
  )
}
