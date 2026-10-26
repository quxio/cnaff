import {
  Authenticated,
  Unauthenticated,
  useMutation,
  useQuery,
} from "convex/react";
import { api } from "../convex/_generated/api";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { RibbitAvatar } from "ribbit-canvas/react";
import { GoGitBranch } from "react-icons/go";
import { GoThumbsup } from "react-icons/go";
import { HiThumbUp } from "react-icons/hi";
import frame from "./assets/frame01.webp";

function TypePicker({ selected, selectfunc }) {
  const types = useQuery(api.data.fetchTypes);
  return (
    <div className="ttpicker">
      {types &&
        Object.keys(types).map((a) => (
          <div
            key={a}
            className={
              selected === types[a] ? "ttpicker-item ttpicker-picked" : "ttpicker-item"
            }
            onClick={() => selectfunc(selected === types[a] ? null : types[a])}
          >
            {a}
          </div>
        ))}
    </div>
  );
}

function TopicPicker() {
  const topics = useQuery(api.data.fetchTopics);
  return (
    <div className="ttpicker topicpicker">
      {topics && Object.keys(topics).map((a) => <div key={a}>{a}</div>)}
    </div>
  );
}

function AuthUpvote({id, upvotesTotal, upvotesArray}) {
  const authUserId = useQuery(api.users.getAuthId);
  const upvote = useMutation(api.data.upvoteIdea);
  const downvote = useMutation(api.data.downvoteIdea);
  const upvoted = upvotesArray.includes(authUserId);

  return (
    <div className="clicky" onClick={(e)=>{
      e.stopPropagation();
      if (upvoted) { downvote({id: id}); }
      else { upvote({id: id}); }
    }}>
      {upvoted ? <HiThumbUp/> : <GoThumbsup />}
      <div>{upvotesTotal}</div>
    </div>
  )
}
function RegUpvote({upvotesTotal}) {
  const nav = useNavigate();

  return (
    <div className="clicky" onClick={(e)=>{
      e.stopPropagation();
      nav("/login")
    }}>
      <GoThumbsup/>
      <div>{upvotesTotal}</div>
    </div>
  )
}

function IdeaCard({ d, index, indexfunc, currentIndex }) {
  const nav = useNavigate();

  return (
    <div
      className={currentIndex === index ? "idea idea-picked" : "idea"}
      onClick={() => indexfunc(index)}
    >
      <img className="ideaframe" alt="z" src={frame}  />
      <div className="ideaflex">
        <div>
          <div className="ideatitle">{d.title}</div>
          <div className="ideaattrib">{d.authorname} - {new Date(d._creationTime).toLocaleDateString()}</div>
        </div>
        <div className="upvotes-container">
          <Authenticated><AuthUpvote id={d._id} upvotesTotal={d.upvotesTotal} upvotesArray={d.upvotesArray}/></Authenticated>
          <Unauthenticated><RegUpvote upvotesTotal={d.upvotesTotal}/></Unauthenticated>
          <Authenticated><div onClick={(e)=>{e.stopPropagation();nav(`/post?id=${d._id}`);}}><GoGitBranch /><div>{`${d.nodesTotal}/${d.nodesPrev}`}</div></div></Authenticated>
          <Unauthenticated><div onClick={(e)=>{e.stopPropagation();nav("/login");}}><GoGitBranch /><div>{`${d.nodesTotal}/${d.nodesPrev}`}</div></div></Unauthenticated>
        </div>
      </div>
      {d.imageUrls?.length > 0 && (
        <div className="idea-images">
          {d.imageUrls.map((u) => <img key={u} alt="thumbnail" src={u} />)}
        </div>
      )}

      <div className="ideadesc">{d.desc}</div>

    </div>
  );
}

function FeedRight() {
  return (
    <div className="feedrightnull">
      <div>Welcome! Let's get started.</div>
      <ul>
        <li>Click an idea to expand its details</li>
        <li>Visit its page to comment, attach projects, and view history</li>
        <li>Search for keywords and filters on the left</li>
        <li>Click the '+' button to start sharing a new idea,<br/>
          or click <GoGitBranch /> to remix an existing idea.</li>
      </ul>
      {/*<RibbitAvatar seed="aksdjhfghbjfad" pattern="wave" size={50} />*/}
    </div>
  );
}

function IdeaModal({ ideas, index, indexfunc }) {
  const nav = useNavigate();
  useEffect(() => {
    function handleEscape(e) {
      switch (e.key) {
        case "Escape":
          indexfunc(null);
          break;
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  });

  const d = index === null ? null : ideas[index];
  return (
    <div
      className={
        index === null ? "ideamodal ideamodalclosed" : "ideamodal ideamodalopen"
      }
      onClick={() => indexfunc(null)}
    >
      {index !== null && (
        <div onClick={(e) => e.stopPropagation()} className="ideamodal-inner">
          <h1>{d.title}</h1>
          <p>by {d.authorname}</p>
          <h1>{d.desc}</h1>
          {d.imageUrls?.length > 0 && (
            <div className="ideamodal-images">
              {d.imageUrls.map((u) => <img key={u} alt="thumbnail"  src={u} />)}
            </div>
          )}
          <div
            className="ideamodal-link"
            onClick={() => nav(`/idea?id=${d._id}`)}
          >
            go to idea page &rarr;
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const allIdeas = useQuery(api.data.listIdeas);
  let [index, setIndex] = useState(null);
  let [type, setType] = useState(null);
  const ideas = type ? allIdeas?.filter((d) => d.type === type) : allIdeas;

  return (
    <div className="rootiest">
      <IdeaModal ideas={ideas} index={index} indexfunc={setIndex} />
      <div className="feed">
        <div className="feedleft">
          <div>type</div>
          <TypePicker
            selected={type}
            selectfunc={(t) => {
              setIndex(null);
              setType(t);
            }}
          />
          <hr />
          <div>topic</div>
          <TopicPicker />
        </div>
        <div className="feedmiddle">
          {ideas?.map((d, i) => (
            <IdeaCard
              key={d._id}
              d={d}
              index={i}
              currentIndex={index}
              indexfunc={setIndex}
            />
          ))}
        </div>

        <div className="feedright">
          <FeedRight />
        </div>
      </div>
    </div>
  );
}
