import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useSearchParams } from "react-router";
import Oops from "./Oops.jsx";

export default function Idea() {

  const [params] = useSearchParams(); const id = params.get("id");
  const [page, setPage] = useState(0);
  const d = useQuery(api.data.getIdea, id ? {id} : "skip");
  const comments = useQuery(api.data.getIdeaComments, id ? {id} : "skip");

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
                  comments
                  {
                    comments.map((c)=>
                      <div>
                        <div>{c.authorname}</div>
                        <div>{c.text}</div>
                        <div>{c.upvotesTotal} upvotes</div>
                        <div>{c.isProject ? "PROJECT" : "c"}</div>
                      </div>
                    )
                  }
                  comment
                  <form>
                    <input type="text" placeholder="Your comment..." />
                    <input type="checkbox" defaultChecked="off" />
                  </form>
                </div>
              :page===1?
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
