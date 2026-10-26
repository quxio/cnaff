import { Navbarcontext } from "@/Navbarcontext.jsx";
import { useContext, useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { useNavigate, useSearchParams } from "react-router";
import { api } from "../convex/_generated/api";

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
import ForkMessage from "./ForkMessage.jsx";
import { GoGitBranch, GoThumbsup } from "react-icons/go";
import frame from "./assets/frame01.webp";


function ImageDrop({ images, setImages }) {
  const generateUploadUrl = useMutation(api.data.generateUploadUrl);
  let [dragging, setDragging] = useState(false);
  let [uploading, setUploading] = useState(0);

  async function upload(files) {
    files = [...files].filter((f) => f.type.startsWith("image/"));
    setUploading((n) => n + files.length);
    for (const file of files) {
      try {
        const url = await generateUploadUrl();
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await res.json();
        setImages((ims) => [
          ...ims,
          { storageId, preview: URL.createObjectURL(file) },
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }

  return (
    <label
      className={dragging ? "imagedrop imagedrop-dragging" : "imagedrop"}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        upload(e.dataTransfer.files);
      }}
    >
      <input
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          upload(e.currentTarget.files);
          e.currentTarget.value = "";
        }}
      />
      <span>
        {uploading > 0
          ? `Uploading ${uploading}...`
          : "Drop mock-ups here, or click to choose"}
      </span>
      {images.map((im) => (
        <img key={im.storageId} alt="thumbnail" src={im.preview} />
      ))}
    </label>
  );
}

export default function Post() {
  const nc = useContext(Navbarcontext);

  let [title, setTitle] = useState("");
  let [desc, setDesc] = useState("");
  let [amend, setAmend] = useState("");
  let [images, setImages] = useState([]);
  let [type, setType] = useState("");

  const types = useQuery(api.data.fetchTypes);
  const addIdea = useMutation(api.data.addIdea);
  const user = useQuery(api.users.getAuth);
  const nav = useNavigate();

  const [params] = useSearchParams();
  const parent = params.get("id") ?? null;
  const p = useQuery(api.data.getIdea, parent ? {id: parent} : "skip")
  async function submit() {

    const missing = [
      !title.trim() && "title",
      !desc.trim() && "description",
      !type && "type",
      !amend.trim() && "details",
    ].filter(Boolean);
    if (missing.length) {
      alert(`missing: ${missing.join(", ")}`);
      return;
    }
    try {
      await addIdea({
        parent,
        title,
        desc,
        init: amend,
        type,
        images: images.map((im) => im.storageId),
      });
      nav("/");
    } catch (err) {
      console.error(err);
      alert("failed to post, try again");
    }
  }

  useEffect(() => {
    if (nc.post === true) {
      // console.log(
      //   title,
      //   desc,
      //   amend,
      //   images.map((im) => im.storageId),
      // );
      nc.setPost(false);

      // added this for submission.
      // I don't really like useEffect() is a good way to handle submit but it works so :)
      submit()
    }
  }, [nc.post]);

  return (
    <div className="post">
      {p && <ForkMessage id={p._id} authorname={p.authorname} title={p.title} /> }
      <div className="post-inner">
        <ImageDrop images={images} setImages={setImages} />
        <div className="posttype">
          <select value={type} onChange={(e) => setType(e.currentTarget.value)}>
            <option value="">Choose a type...</option>
            {types &&
              Object.keys(types).map((a) => (
                <option key={a} value={types[a]}>
                  {a}
                </option>
              ))}
          </select>
        </div>
        <div className="title">
          <textarea
            className="title"
            autoCorrect="on"
            maxLength="60"
            value={title}
            placeholder="A short and descriptive title..."
            onChange={(e) => setTitle(e.currentTarget.value)}
          />
          <div className="characters">{title.length > 0 ? `${title.length}/60` : ""}</div>
        </div>
        <div className="desc">
          <textarea
            className="desc"
            autoCorrect="on"
            maxLength="180"
            value={desc}
            placeholder="A 1-2 sentence description..."
            onChange={(e) => setDesc(e.currentTarget.value)}
          />
          <div className="characters">{desc.length > 0 ? `${desc.length}/180` : ""}</div>
        </div>
        <div className="amend">
          <MDXEditor
            markdown={amend}
            onChange={setAmend}
            // contentEditableClassName="mdx-content"
            placeholder={<spans className="mdx-placeholder">Your space to specify and elaborate! (You can add more later.)</spans>}
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
        <div className="preview">
          <div className="idea ideapreview">
            <img className="ideaframe" alt="z" src={frame}  />
            <div className="ideaflex">
              <div>
                <div className="ideatitle">{title}</div>
                <div className="ideaattrib">{user?.name} - ##/##/####</div>
              </div>
              <div className="upvotes-container">
                <div className="clicky">
                  <GoThumbsup/>
                  <div>[...]</div>
                </div>
                <div>
                  <GoGitBranch />
                  <div>{p ? `${p.nodesTotal + 1}/${p.nodesPrev + 1}` : "0/0"}</div>
                </div>
              </div>
            </div>

            {/*{d.imageUrls?.length > 0 && (*/}
            {/*  <div className="idea-images">*/}
            {/*    {d.imageUrls.map((u) => <img key={u} alt="thumbnail" src={u} />)}*/}
            {/*  </div>*/}
            {/*)}*/}

            <div className="ideadesc">{desc}</div>

          </div>
        </div>
      </div>
    </div>
  );
}
