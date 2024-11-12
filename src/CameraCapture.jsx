import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";

const CameraCapture = () => {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState("");
  const [facingMode, setFacingMode] = useState("environment");
  const [hasPermission, setHasPermission] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    const checkSupport = async () => {
      try {
        if (!window.isSecureContext) {
          throw new Error("Necessário contexto seguro (HTTPS)");
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("API mediaDevices não suportada");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        setHasPermission(true);
        setIsSupported(true);
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

  const containerStyle = {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
  };

  const circleContainerStyle = {
    width: "300px",
    height: "400px",
    borderRadius: "50%",
    overflow: "hidden",
    margin: "0 auto",
    position: "relative",
    border: "4px solid #2ecc71",
    boxShadow: "0 0 20px rgba(46, 204, 113, 0.3)",
    // background: "#000",
  };

  const mediaStyle = {
    width: "auto",
    height: "100%",
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    minWidth: "100%",
    minHeight: "100%",
    objectFit: "cover",
  };

  const buttonStyle = {
    margin: "0 10px",
    padding: "12px 24px",
    borderRadius: "25px",
    border: "none",
    background: "#2ecc71",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  };

  const titleStyle = {
    color: "#2c3e50",
    marginBottom: "30px",
  };

  if (!isSupported) {
    return (
      <div style={containerStyle}>
        <h2 style={titleStyle}>Erro de Compatibilidade</h2>
        <p>Seu navegador não suporta acesso à câmera.</p>
        <p>Por favor, tente:</p>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li>• Usar o Google Chrome mais recente</li>
          <li>• Verificar se está usando HTTPS</li>
          <li>• Permitir acesso à câmera nas configurações do navegador</li>
        </ul>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div style={containerStyle}>
        Acesso à câmera negado. Verifique as permissões do navegador.
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Captura de Foto</h1>

      <div style={circleContainerStyle}>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          }}
          style={mediaStyle}
          onUserMediaError={(err) => {
            console.error("Erro na câmera:", err);
            setIsSupported(false);
          }}
        />
      </div>

      <div style={{ marginTop: "30px" }}>
        <button style={buttonStyle} onClick={capture}>
          📸 Tirar Foto
        </button>
        <button style={buttonStyle} onClick={trocarCamera}>
          🔄 Trocar Câmera
        </button>
      </div>

      {capturedImage && (
        <div style={{ marginTop: "40px" }}>
          <h2 style={titleStyle}>Foto Capturada</h2>
          <div style={circleContainerStyle}>
            <img src={capturedImage} alt="Foto Capturada" style={mediaStyle} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
