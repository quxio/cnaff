import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useNavigate, useSearchParams } from "react-router";
import Oops from "./Oops.jsx";
import Mindmap from "./Mindmap.jsx";
import ForkMessage from "./ForkMessage.jsx";

// function parseLineage(object, parent) {
//
// }

export default function Idea() {

  const [params] = useSearchParams(); const idea = params.get("id");
  const [page, setPage] = useState(0);
  const d = useQuery(api.data.getIdea, idea ? { id: idea } : "skip");
  const p = useQuery(api.data.getIdea, d?.parent ? { id: d.parent } : "skip");
  const comments = useQuery(api.data.allComments, idea ?  { idea : idea } : "skip");

  const boughdata = useQuery(api.data.getBough, d ? {bough: d.bough} : "skip");
  const bough = boughdata?.json ? JSON.parse(boughdata.json) : null;
  // const lineage = bough ? parseLineage(bough, d._id) : null;

  // const addComment = useMutation(api.data.addComment);

  return (
    !idea ? <Oops>Tinkering with the query string, huh?</Oops> :
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
                  {p && <ForkMessage id={p._id} title={p.title} authorname={p.authorname} />}
                  <div className="ii-title">{d.title}</div>
                  <p>by {d.authorname}</p>
                  <hr/>
                  <h2>Comments</h2>
                  <div className="comments">
                    <div className="o">
                      <div></div>
                      <div className="c">comment AAAAAAAAAAA<br/>comment AAAAAAAAAAA<br/>comment AAAAAAAAAAA<br/>comment AAAAAAAAAAA<br/>comment AAAAAAAAAAA<br/>comment AAAAAAAAAAA<br/></div>
                      <div className="indent">
                        <div className="o">
                          <div></div>
                          <div className="c"><div></div>comment AAAAAAAAAAA</div>
                          <div className="indent">
                            <div><div className="c"><div></div>response BBBBBBBBBB</div></div>
                          </div>
                        </div>
                        <div><div className="c"><div></div>response BBBBBBBBBB</div></div>
                      </div>
                    </div>

                    <div className="o">
                      <div></div>
                      <div className="c">comment BBBBBBBBBB</div>
                      <div className="indent">
                        <div><div className="c"><div></div>response CCCCCCCCCC</div></div>
                        <div><div className="c"><div></div>response DDDDDDDDDDDD</div></div>
                      </div>
                    </div>
                  </div>
                  <hr/>
                  <div>[profile picture]</div>
                  {/*<form onSubmit={(e) => {*/}
                  {/*  e.preventDefault();*/}
                  {/*  const vals = Object.fromEntries(new FormData(e.currentTarget));*/}
                  {/*  if (!vals.text) { alert("write something before submitting, please"); }*/}
                  {/*  const isProject = Boolean(vals.isProject);*/}
                  {/*  addComment({id: d._id, text: vals.text, isProject: isProject});*/}
                  {/*}}>*/}
                  {/*  <input name="text" type="text" placeholder="Contribute your thoughts..." />*/}
                  {/*  <input name="isProject" type="text" placeholder="isProject" />*/}
                  {/*  <button type="submit">Enter</button>*/}
                  {/*</form>*/}
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
                  {boughdata?.json ? <Mindmap data={bough} /> : <div>This idea doesn't seem to have any forks yet!</div> }
                </div>
            }
          </div>
        }
      </div>
  );
}
