import { useEffect } from 'react'; 
import ApiService from './api/ApiService.tsx'
// import { ResultPopUp } from './components/popups/ResultPopUp/ResultPopUp.tsx';
// import { PopUpManager } from './managers/PopUpManager.tsx';
// import { PopUpType } from './models';

import { ResultPopUp } from './components/popups/index.tsx';
import { PopUpManager } from './managers/index.tsx';
import { PopUpType } from './models/index.ts';

function App() {
  // useEffect(() => {
  //   ApiService.getInstance().saveRecord({ test: "hello" })
  //     .then(res => console.log("서버 응답:", res))
  //     .catch(err => console.error("연결 에러:", err));
  // }, []);

  // useEffect(() => {
  //   localStorage.setItem('키', '값')
  // }, [])

  useEffect(()=>{
    const popUpManager = PopUpManager.getInstance();
    
    setTimeout(() => {
      popUpManager.openPopUp(PopUpType.RESULT);
    }, 2000)
  }, []);

  return (
    <div className="App">
      <h1>My Game Project</h1>
      <ResultPopUp />
    </div>
  );
}

export default App;
