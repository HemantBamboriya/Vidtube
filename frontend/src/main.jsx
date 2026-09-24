import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import "./index.css";
import "./responsive.css";
import "./features.css";
import "./auth.css";

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } } });
ReactDOM.createRoot(document.getElementById("root")).render(<React.StrictMode><QueryClientProvider client={queryClient}><ThemeProvider><AuthProvider><App/></AuthProvider></ThemeProvider></QueryClientProvider></React.StrictMode>);
