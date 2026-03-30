import React, { useState, useRef, useEffect } from "react";
import MainPage from "./pages/mainPage/MainPage";
import GamePage from "./pages/GamePage/GamePage";
import LoadManager from "./pages/LoadManager/LoadManager";



type Page = "MAIN" | "LOADING" | "GAME";

function App() {
  const [page, setPage] = useState<Page>("MAIN");
  const [holistic, setHolistic] = useState<any>(null);

  return (
    <>
      {page === "MAIN" && <MainPage onStart={() => setPage("LOADING")} />}
      {page === "LOADING" && (
        <LoadManager onSuccess={() => setPage("GAME")}/>
      )}
      {page === "GAME" && <GamePage />}
    </>
  );
}

export default App;