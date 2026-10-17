import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useSearchParams } from "react-router";
import Oops from "./Oops.jsx";

export default function Idea() {

  const [params] = useSearchParams(); const id = params.get("id");
  const [page, setPage] = useState(0);
  const d = useQuery(api.data.getIdea, id ? {id} : "skip");
  const comments = useQuery(api.data.getIdeaComments, id ? {id} : "skip");
  const addComment = useMutation(api.data.addComment);

  return (
    !id ? <Oops>Tinkering with the query string, huh?</Oops> :
      <div className="idea-outer">
        <div className="toolbar">
          <div className="pagepicker">
            <div onMouseDown={()=>setPage(0)} className={page===0?"page-button page-button-selected":"page-button"}><div>Overview</div></div>
            <div onMouseDown={()=>setPage(1)} className={page===1?"page-button page-button-selected":"page-button"}><div>Projects</div></div>
            <div onMouseDown={()=>setPage(2)} className={page===2?"page-button page-button-selected":"page-button"}><div>History</div></div>
            <div onMouseDown={()=>setPage(3)} className={page===3?"page-button page-button-selected":"page-button"}><div>Tree</div></div>
          </div>
        </div>
        { d && comments &&
          <div className="idea-view">
            {
              page===0?
                <div>
                  <h1>{d.title}</h1>
                  <p>by {d.authorname}</p>
                  <hr/>
                  <h2>Comments</h2>
                  {
                    comments.map((c)=>
                      <div style={{padding: 10}}>
                        <div>{c.authorname}</div>
                        <div>{c.text}</div>
                        <div>{c.upvotesTotal} upvotes</div>
                        <div>{c.isProject ? "PROJECT" : "c"}</div>
                      </div>
                    )
                  }
                  <hr/>
                  <div>[profile picture]</div>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const vals = Object.fromEntries(new FormData(e.currentTarget));
                    if (!vals.text) { alert("write something before submitting, please"); }
                    const isProject = Boolean(vals.isProject);
                    addComment({id: d._id, text: vals.text, isProject: isProject});
                  }}>
                    <input name="text" type="text" placeholder="Contribute your thoughts..." />
                    <input name="isProject" type="text" placeholder="isProject" />
                    <button type="submit">Enter</button>
                  </form>
                </div>
                : page === 1 ?
                  <div>
                  projects
                </div>
              :page===2?
                <div>
                  history
                </div>
              :
                <div>
                  Tree
                </div>
            }
          </div>
        }
      </div>
  );
}
