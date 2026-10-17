import { api } from "../convex/_generated/api";
import { useQuery, useMutation } from "convex/react";

export default function Admin() {
  const types = useQuery(api.data.fetchTypes);
  const addIdea = useMutation(api.data.addIdea);
  return (
    <div>
      <form style={{display: "flex", flexFlow: "column nowrap", alignItems: "center"}}
            onSubmit={async (e)=>{
              e.preventDefault();
              if (!types) { alert("types not loaded"); return; }
              const data = JSON.parse(e.currentTarget.dajson.value);
              for (const d of data) {
                const dd = {parent: null, title: d.title, desc: d.desc, amend: d.writeup, type: types[d.type]};
                await addIdea(dd);
              }
            }}
      >
        <textarea name="dajson" style={{width: 700, height: 700}}/>
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}
