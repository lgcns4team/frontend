import { useState } from "react";


function App() {

  const [step, setStep] = useState(1);

  const goNext = () => {
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const goPrev = () => {
    setStep((prev) => Math.max(prev - 1, 1));

  };
  
  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "80px",
        fontSize: "sans-serif",
      }}
      >
        <h1> 단계 연습하기</h1>
        <p style={{ fontSize: "18px", marginTop: "8px"}}>
          현재 단계: <strong>{step}</strong> / 3
          </p>

      
      </div>  
  )
}
;

export default App;

