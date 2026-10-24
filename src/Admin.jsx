import { api } from "../convex/_generated/api";
import { useMutation } from "convex/react";

export default function Admin() {
  const ensureTypes = useMutation(api.data.ensureTypes);
  const addIdea = useMutation(api.data.addIdea);
  return (
    <div>
      <form style={{display: "flex", flexFlow: "column nowrap", alignItems: "center"}}
            onSubmit={async (e)=>{
              e.preventDefault();
              const data = JSON.parse(e.currentTarget.dajson.value);
              const missing = data.filter((d)=>!d.type);
              if (missing.length) { alert(`missing "type": ${missing.map((d)=>d.title).join(", ")}`); return; }
              const types = await ensureTypes({names: [...new Set(data.map((d)=>d.type))]});
              for (const d of data) {
                const dd = {parent: null, title: d.title, desc: d.desc, amend: d.writeup, type: types[d.type]};
                await addIdea(dd);
              }
              alert(`imported ${data.length} ideas`);
            }}
      >
        <textarea name="dajson" style={{width: 700, height: 700}}/>
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}
