import React, { useState } from "react";
import MainPage from "./pages/mainPage/MainPage";
import GamePage from "./pages/gamePage/GamePage";
import LoadManager from "./pages/LoadManager/LoadManager";
import type { DailyPoseData } from "./models/ApiTypes";

type Page = "MAIN" | "LOADING" | "GAME";

function App() {
  const [page, setPage] = useState<Page>("MAIN");
  const [gameDailyPose, setGameDailyPose] = useState<DailyPoseData | null>(
    null
  );

  return (
    <>
      {page === "MAIN" && <MainPage onStart={() => setPage("LOADING")} />}
      {page === "LOADING" && (
        <LoadManager
          onEnterGame={(daily) => {
            setGameDailyPose(daily);
            setPage("GAME");
          }}
          onBackHome={() => setPage("MAIN")}
        />
      )}
      {page === "GAME" && gameDailyPose && (
        <GamePage
          dailyPose={gameDailyPose}
          onExitToMain={() => {
            setGameDailyPose(null);
            setPage("MAIN");
          }}
        />
      )}
    </>
  );
}

export default App;
