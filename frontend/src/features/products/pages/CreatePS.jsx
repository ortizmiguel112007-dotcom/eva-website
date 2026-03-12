import { useNavigate } from "react-router-dom";

export default function CreatePS({ ps: Ps2, text = "Enana" }) {
  const navigate = useNavigate();

  const handleSubmit = (data) => {
    console.log(`${text}: ${data}`);
    navigate("/dashboard");
  };

  return <Ps2 onSubmit={handleSubmit} onClose={() => navigate("/dashboard")} />;
}
