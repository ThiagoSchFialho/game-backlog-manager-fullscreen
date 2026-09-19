import { useShutdown } from "../../hooks/useShutdown";

export function ShutdownButton() {
  const { shutdown, loading, error } = useShutdown();

  const handleClick = () => {
    if (window.confirm("Fechar o app e o navegador?")) shutdown();
  };

  return (
    <>
      <button onClick={handleClick} disabled={loading}>
        {loading ? "Desligando..." : "Sair"}
      </button>
      {error && <p>{error}</p>}
    </>
  );
}