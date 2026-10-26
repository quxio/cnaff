import { useNavigate } from "react-router";
import { BsArrowReturnRight } from "react-icons/bs";
import StdUser from "./StdUser.jsx";

export default function ForkMessage({id, title, authorname, authorId}) {
  const nav = useNavigate();
  return (
    <div className="forkmessage">
      <BsArrowReturnRight/>
      <div>Inspired by
        <span className="ii-parent-title" onClick={()=>nav(`/idea?id=${id}`)}> {title} </span>
        by <StdUser authorname={authorname} authorId={authorId}/></div>
    </div>
  )
}