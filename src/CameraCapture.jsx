import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";

const CameraCapture = () => {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState("");
  const [facingMode, setFacingMode] = useState("environment");
  const [hasPermission, setHasPermission] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Verificação mais completa de suporte
    const checkSupport = async () => {
      try {
        // Verifica se está rodando em um contexto seguro (HTTPS ou localhost)
        if (!window.isSecureContext) {
          throw new Error("Necessário contexto seguro (HTTPS)");
        }

        // Verifica suporte a mediaDevices
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("API mediaDevices não suportada");
        }

        // Tenta acessar a câmera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        setHasPermission(true);
        setIsSupported(true);

        // Limpa o stream após o teste
        stream.getTracks().forEach((track) => track.stop());
      } catch (err) {
        console.error("Erro na verificação:", err);
        setIsSupported(false);
        alert(`Erro de compatibilidade: ${err.message}`);
      }
    };

    checkSupport();
  }, []);

  const capture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      enviarImagem(imageSrc);
    }
  };

  const trocarCamera = () => {
    setFacingMode(facingMode === "user" ? "environment" : "user");
  };

  const enviarImagem = async (base64Image) => {
    try {
      const response = await fetch("https://seu-backend.com/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64Image }),
      });

      if (response.ok) {
        console.log("Imagem enviada com sucesso!");
      } else {
        console.error("Falha ao enviar a imagem.");
      }
    } catch (error) {
      console.error("Erro ao enviar a imagem: ", error);
    }
  };

  if (!isSupported) {
    return (
      <div>
        <h2>Erro de Compatibilidade</h2>
        <p>Seu navegador não suporta acesso à câmera.</p>
        <p>Por favor, tente:</p>
        <ul>
          <li>Usar o Google Chrome mais recente</li>
          <li>Verificar se está usando HTTPS</li>
          <li>Permitir acesso à câmera nas configurações do navegador</li>
        </ul>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div>Acesso à câmera negado. Verifique as permissões do navegador.</div>
    );
  }

  return (
    <div>
      <h1>Captura de Foto</h1>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={{
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        }}
        style={{ width: "100%", maxWidth: "500px" }}
        onUserMediaError={(err) => {
          console.error("Erro na câmera:", err);
          setIsSupported(false);
        }}
      />
      <div style={{ marginTop: "10px" }}>
        <button onClick={capture}>Tirar Foto</button>
        <button onClick={trocarCamera}>Trocar Câmera</button>
      </div>
      {capturedImage && (
        <div>
          <h2>Foto Capturada:</h2>
          <img
            src={capturedImage}
            alt="Foto Capturada"
            style={{ width: "100%", maxWidth: "500px" }}
          />
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
