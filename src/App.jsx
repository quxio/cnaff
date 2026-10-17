import { Authenticated, Unauthenticated, useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { FaRegThumbsUp } from "react-icons/fa";

function TypePicker() {
  const types = useQuery(api.data.fetchTypes);
  return (
    <div className="ttpicker">
      {types && Object.keys(types).map((a)=><div key={a}>{a}</div>)}
    </div>
  )
}

function TopicPicker() {
  const topics = useQuery(api.data.fetchTopics);
  return (
    <div className="ttpicker">
      {topics && Object.keys(topics).map((a)=><div key={a}>{a}</div>)}
    </div>
  )
}

function AuthUpvoteButton({_id, upvotesArray, upvotesTotal}) {
  const authUserId = useQuery(api.users.getAuthId);
  const upvotable = !upvotesArray.includes(authUserId);
  const upvote = useMutation(api.data.upvoteIdea);
  const downvote = useMutation(api.data.downvoteIdea);

  return <div style={{width: "auto"}} onClick={(e)=>{e.stopPropagation();if(upvotable){upvote({id:_id});}else{downvote({id:_id});}}}>{upvotable ? `upvotes: ${upvotesTotal}` : `upvoted!!!! (${upvotesTotal})`}</div>
}

function IdeaCard({d, index, indexfunc, currentIndex}) {
  const nav = useNavigate();

  return (
    <div className={currentIndex === index ? "idea idea-picked" : "idea"} onClick={()=>indexfunc(index)}>
      <div className="ideatitle" onClick={(e)=>{e.stopPropagation(); nav(`/idea?id=${d._id}`);}}>{d.title}</div>
      <div>{d.authorname}</div>
      <div>{new Date(d._creationTime).toLocaleDateString()}</div>

      <Authenticated>
        <AuthUpvoteButton _id={d._id} upvotesTotal={d.upvotesTotal} upvotesArray={d.upvotesArray}/>
      </Authenticated>
      <Unauthenticated>
        {/*<div onClick={(e)=>{e.stopPropagation();nav("/login");}}>upvotes: {d.upvotesTotal}</div>*/}
        <FaRegThumbsUp onClick={(e)=>{e.stopPropagation();nav("/login");}}/>
      </Unauthenticated>

      <div>{d.nodesPrev === 0n ? (d.nodesTotal > 1 ? `nodes: ${d.nodesTotal}` : "") : `nodes: ${d.nodesTotal}, depth ${d.nodesPrev + 1n} remix`}</div>
      <div>notsaved</div>
    </div>
  )
}

function FeedRight() {
  return (
    <div className="feedrightnull">
      <div>Welcome! Let's get started.</div>
      <ul>
        <li>Select an idea to expand its details</li>
        <li>Search for keywords or set filters</li>
        <li>Visit its page to make comments and view history</li>
        <li>View related and derived ideas over here</li>
      </ul>
    </div>
  );
}


function IdeaModal({ideas, index, indexfunc}) {

  useEffect(()=> {
    function handleEscape(e) {
      switch (e.key) {
        case "Escape":
          indexfunc(null);
          break;
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  })

  const d = index===null ? null : ideas[index];
  return (
    <div className={index===null ? "ideamodal ideamodalclosed" : "ideamodal ideamodalopen"} onClick={()=>indexfunc(null)}>
      {index!==null&&<div onClick={(e)=>e.stopPropagation()} className="ideamodal-inner">
        <h1>{d.title}</h1>
        <p>by {d.authorname}</p>
        <h1>{d.desc}</h1>
      </div>}
    </div>
  )
}


export default function App() {

  const ideas = useQuery(api.data.listIdeas);
  let [index, setIndex] = useState(null);

  return (
    <div className="rootiest">
      <IdeaModal ideas={ideas} index={index} indexfunc={setIndex}/>
      <div className="feed">
        <div className="feedleft">
          <div>type</div>
          <TypePicker/>
          <hr/>
          <div>topic</div>
          <TopicPicker/>
        </div>
        <div className="feedmiddle">
          {ideas?.map((d, i)=>
            <IdeaCard key={d._id} d={d} index={i} currentIndex={index} indexfunc={setIndex} />
          )}
        </div>

        <div className="feedright">
          <FeedRight />
        </div>

      </div>
    </div>
  );
}
