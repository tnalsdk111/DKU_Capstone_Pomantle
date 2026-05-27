import "./MainPage.css";

type Props = {
  onStart: () => void; // onStart 함수는 인자 없고, 반환값도 없는 함수라고 정의
};

function MainPage({ onStart }: Props) {
  return (
    <div className="main-container">
      <h1 className="title">POMANTLE</h1>
      <p className="subtitle">GUESS TODAY'S POSE</p>

      <button className="go-button" onClick={onStart}>
        GO
      </button>
    </div>
  );
}

export default MainPage;