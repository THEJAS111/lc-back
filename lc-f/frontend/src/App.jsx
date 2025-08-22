import { useEffect, useState } from "react";
import { Routes, Route,Navigate } from "react-router";
import Homepage from "./pages/homepage.jsx";
import Login from "./pages/login.jsx";
import Signup from "./pages/signup";
import {checkAuth} from "./authsilce.js";
import { useDispatch,useSelector } from "react-redux";
import ProblemPage from "./pages/problempage.jsx"
import Admin from "./pages/admin.jsx";
import AdminPanel from "./components/admincreate.jsx";
import AdminDelete from "./components/admindelete.jsx";
import Startingpage from "./pages/startingpage.jsx";
import Profile from "./pages/profilepage.jsx";



function App() {
  const dispatch = useDispatch();
  const { isAuthenticated,user,loading } = useSelector((state) => state.auth);
  

 useEffect(() => {
      dispatch(checkAuth());
    }, [dispatch]);
  return (
    <>
      <Routes>
        <Route
          path="/startingpage"
          element={<Startingpage /> }
        />
        <Route
          path="/profile"
          element={<Profile /> }
        />

        <Route
          path="/"
          element={isAuthenticated ? <Homepage /> : <Navigate to="/signup" />}
        />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/" /> : <Signup />}
        />
        {/* <Route
          path="/Admin" element={<Admin/>}
        />
        <Route
          path="/Admin/create" element={<AdminPanel/>}
        />
        <Route
          path="/Admin/delete" element={<AdminDelete/>}
        /> */}

        <Route
          path="/admin"
          element={
            isAuthenticated && user?.role === "admin" ? (
              <Admin />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/admin/create"
          element={
            isAuthenticated && user?.role === "admin" ? (
              <AdminPanel />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/admin/delete"
          element={
            isAuthenticated && user?.role === "admin" ? (
              <AdminDelete />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route path="/problem/:problemId" element={<ProblemPage />}></Route>
      </Routes>
    </>
  );
}

export default App;
