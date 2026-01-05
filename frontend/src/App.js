import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import JobsList from "./pages/JobsList";
import ApplyJob from "./pages/ApplyJob";
import PostJob from "./pages/PostJob";
import ApplicationDetails from "./pages/ApplicationDetails";
import AllApplications from "./pages/AllApplications";
import JobApplications from "./pages/JobApplications";
// import Chat from "./pages/Chat";

import RequireAuth from "./components/RequireAuth";
import RequireRole from "./components/RequireRole";

function JobsRoute() {
  // JobsList now handles both hiring managers and applicants; always render it.
  return <JobsList />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/jobs"
        element={
          <RequireAuth>
            <JobsRoute />
          </RequireAuth>
        }
      />

      <Route
        path="/jobs/:jobId"
        element={
          <RequireAuth>
            <ApplyJob />
          </RequireAuth>
        }
      />

      <Route
        path="/jobs/post"
        element={
          <RequireRole role="hiring_manager">
            <PostJob />
          </RequireRole>
        }
      />

      <Route
        path="/jobs/:jobId/applications"
        element={
          <RequireRole role="hiring_manager">
            <JobApplications />
          </RequireRole>
        }
      />

      <Route
        path="/applications"
        element={
          <RequireAuth>
            <AllApplications />
          </RequireAuth>
        }
      />
      <Route path="/jobs/:jobId/application" 
      element={
          <RequireAuth>
            <ApplicationDetails />
          </RequireAuth>
        }
      />


      {/* <Route
        path="/chat"
        element={
          <RequireAuth>
            <Chat />
          </RequireAuth>
        }
      /> */}

      <Route path="/" element={<Navigate to="/jobs" replace />} />
      <Route path="*" element={<Navigate to="/jobs" replace />} />
    </Routes>
  );
}
