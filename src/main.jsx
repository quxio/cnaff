"use client";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import "./index.css";

import { createBrowserRouter, RouterProvider, Outlet } from "react-router";

import Navbarframe from "@/Navbarframe.jsx";
import App from "./App.jsx";
import Post from "./Post.jsx";
import Login from "./Login.jsx";
import Idea from "./Idea.jsx";
import Admin from "./Admin.jsx";

import Oops from "./Oops.jsx";
import Notfound from "./Notfound.jsx";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

createRoot(document.getElementById("i-am-the-react-root")).render(
  <StrictMode>
    <ConvexAuthProvider client={convex}>
      <RouterProvider router={
        createBrowserRouter([{
          path: "/",
          element: <Navbarframe><Outlet/></Navbarframe>,
          children: [
            {path: "/", element: <App/>},
            {path: "/post", element: <Post/>},
            {path: "/login", element: <Login/>},
            {path: "/idea", element: <Idea/>},
            {path: "/admin", element: <Admin/>},

            {path: "/user", element: <Oops>/user hasn't been implemented yet...</Oops>},
            {path: "/account", element: <Oops>/account hasn't been implemented yet...</Oops>},
            {path: "*", element: <Notfound/>}
          ]
        }])
      } />
    </ConvexAuthProvider>
  </StrictMode>,
);
