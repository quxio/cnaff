import { useNavigate } from "react-router";
import { BsArrowReturnRight } from "react-icons/bs";
import image from "./assets/userimage01.webp";


export default function ForkMessage({id, title, authorname}) {
  const nav = useNavigate();
  return (
    <div className="forkmessage">
      <BsArrowReturnRight/>
      <div>Inspired by
        <span className="ii-parent-title" onClick={()=>nav(`/idea?id=${id}`)}> {title} </span>
        by <span className="standardprofile"><img src={image} alt="profile"/><div>{authorname}</div></span></div>
    </div>
  )
}