import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { useQuery } from '@tanstack/react-query';


const App = () => {
  const { data: authUser, isLoading } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      try {
        const res = await fetch("http://localhost:3000/profile", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();

        if (data.error) {
          console.log(data.error);
          return null;
        }
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {

        throw new Error(error);
      }
    },
    retry: false
  });

  return (
    <Routes>
      <Route path="/" element={authUser ? <Home /> : <Navigate to="/login" />} />
      <Route path="/login" element={authUser ? <Navigate to="/" /> : <Login />} />
      <Route path="/signup" element={authUser ? <Navigate to="/" /> : <Signup />} />
    </Routes>
  );
};

export default App;
