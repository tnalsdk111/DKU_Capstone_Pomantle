import "./MainPage.css";

type Props = {
  onStart: () => void;
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