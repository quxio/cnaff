import { useState } from "react";
import { useQuery, useMutation, Authenticated } from "convex/react";
import { api } from "../convex/_generated/api";
import { useSearchParams } from "react-router";
import Oops from "./Oops.jsx";
import Mindmap from "./Mindmap.jsx";
import ForkMessage from "./ForkMessage.jsx";
import Markdown from "react-markdown";
import { MdCancel } from "react-icons/md";

import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  linkPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  ListsToggle,
  CreateLink,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import "./mdxeditor.css";

function CommentForm({ideaId, authorId, target, targetFunc}) {
  let [md, setMd] = useState("");
  let [state, setState] = useState(0);
  const addComment = useMutation(api.data.addComment);
  const addAmend = useMutation(api.data.addAmend);
  const self = useQuery(api.users.getAuthId);
  return (
    <div className="commentform-outer">
      <div className="commenttoolbar">
        <div className="pagepicker">
          <div onMouseDown={()=>setState(0)} className={state===0?"page-button page-button-selected":"page-button"}><div>Comment</div></div>
          <div onMouseDown={()=>setState(1)} className={state===1?"page-button page-button-selected":"page-button"}><div>Project</div></div>
          {self && authorId && self === authorId && <div onMouseDown={()=>setState(2)} className={state===2?"page-button page-button-selected":"page-button"}><div>Amend</div></div>}
        </div>
      </div>
      {target && <div onClick={()=>targetFunc(null)} className="clicky targetflavor"><div>{state===2?"Merging 1":"Replying to 1"}</div><MdCancel className="x"/></div>}
      <div className="commentform">
        <div>
          <MDXEditor
            markdown={md}
            onChange={setMd}
            placeholder={<span className="mdx-placeholder">{state===0?"Share your thoughts...":state===1?"Post a finished project...":"Need to revise the writeup?"}</span>}
            plugins={[
              headingsPlugin(),
              listsPlugin(),
              quotePlugin(),
              thematicBreakPlugin(),
              linkPlugin(),
              markdownShortcutPlugin(),
              toolbarPlugin({
                toolbarContents: () => (
                  <>
                    <UndoRedo />
                    <BlockTypeSelect />
                    <BoldItalicUnderlineToggles />
                    <ListsToggle />
                    <CreateLink />
                  </>
                ),
              }),
            ]}
          />
        </div>
      </div>
      <button onClick={async ()=>{
        if (md.length < 5) { alert("Error: Write at least 5 characters in the field."); }
        switch (state) {
          case 0:
            await addComment({idea: ideaId, text: md, comment: target, isProject: false});
            break;
          case 1:
            await addComment({idea: ideaId, text: md, comment: target, isProject: true});
            break;
          case 2:
            await addAmend({idea: ideaId, text: md});
            break;
          default:
            alert("huh")
        }
        setMd("");
      }}>submit</button>
    </div>
  )
}


export default function Idea() {

  const [params] = useSearchParams(); const idea = params.get("id");
  const [page, setPage] = useState(0);
  const d = useQuery(api.data.getIdea, idea ? { id: idea } : "skip");
  const p = useQuery(api.data.getIdea, d?.parent ? { id: d.parent } : "skip");
  const comments = useQuery(api.data.allComments, idea ?  { idea } : "skip");
  const amends = useQuery(api.data.getAmends, idea ? {idea} : "skip");

  const boughdata = useQuery(api.data.getBough, d ? {bough: d.bough} : "skip");
  const bough = boughdata?.json ? JSON.parse(boughdata.json) : null;

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
                  <div className="amends">
                    {
                      amends && d &&  [{text: d.init, _creationTime: d._creationTime, _id: d._id}, ...amends].map((a)=>
                      <div key={a._id}>
                        <div>{new Date(a._creationTime).toLocaleDateString()} / {new Date(a._creationTime).toLocaleTimeString()}</div>
                        <Markdown>{a.text}</Markdown>
                      </div>)
                    }
                  </div>
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

                  <Authenticated>
                    <CommentForm ideaId={d._id} authorId={d.author} target={'a'}/>
                  </Authenticated>

                </div>
                : page === 1 ?
                  <div>
                  ahem projects ahem
                </div>
              :page===2?
                <div>
                  cough history cough
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
