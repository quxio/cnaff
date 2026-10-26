import image from "./assets/userimage01.webp";
import { useNavigate } from "react-router";

export default function StdUser({authorname, authorId}) {
  const nav = useNavigate();
  return <span onClick={(e)=>{e.preventDefault();nav(`/user?id=${authorId}`)}} className="standardprofile clicky"><img src={image} alt="profile"/><span>{authorname}</span></span>
}