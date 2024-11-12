/* eslint-disable no-unused-vars */
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
        // Verificação de compatibilidade mais abrangente
        const getUserMedia =
          navigator.getUserMedia ||
          navigator.webkitGetUserMedia ||
          navigator.mozGetUserMedia ||
          navigator.msGetUserMedia ||
          navigator.mediaDevices?.getUserMedia;

        if (!getUserMedia && !navigator.mediaDevices?.getUserMedia) {
          throw new Error("Seu navegador não suporta acesso à câmera");
        }

        // Verifica HTTPS
        if (!window.isSecureContext) {
          throw new Error("É necessário usar HTTPS para acessar a câmera");
        }

        // Tenta acessar a câmera com fallbacks
        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "environment",
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          });
        } catch (err) {
          // Tenta uma configuração mais básica se a primeira falhar
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
        }

        setHasPermission(true);
        setIsSupported(true);
        stream.getTracks().forEach((track) => track.stop());
      } catch (err) {
        console.error("Erro na verificação:", err);
        setIsSupported(false);

        const browser = detectBrowser();
        let message = `Erro de compatibilidade: ${err.message}\n\n`;
        message += getBrowserSpecificMessage(browser);

        alert(message);
      }
    };

    checkSupport();
  }, []);

  const detectBrowser = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.match(/chrome|chromium|crios/i)) return "chrome";
    if (userAgent.match(/firefox|fxios/i)) return "firefox";
    if (userAgent.match(/safari/i)) return "safari";
    if (userAgent.match(/opr\//i)) return "opera";
    if (userAgent.match(/edg/i)) return "edge";
    return "other";
  };

  const getBrowserSpecificMessage = (browser) => {
    const messages = {
      chrome: "Recomendamos usar o Chrome atualizado.",
      firefox:
        "No Firefox, certifique-se de que as permissões de câmera estão habilitadas em about:permissions",
      safari:
        "No Safari, verifique se 'Câmera' está habilitada nas Preferências do Sistema > Segurança e Privacidade",
      opera:
        "No Opera, verifique as configurações de câmera em opera://settings/content/camera",
      edge: "No Edge, verifique as configurações de câmera em edge://settings/content/camera",
      other: "Recomendamos usar o Google Chrome para melhor compatibilidade",
    };
    return messages[browser] || messages.other;
  };

  const capture = () => {
    if (webcamRef.current) {
      try {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          setCapturedImage(imageSrc);
          enviarImagem(imageSrc);
        } else {
          throw new Error("Falha ao capturar imagem");
        }
      } catch (err) {
        console.error("Erro na captura:", err);
        alert("Não foi possível capturar a imagem. Tente novamente.");
      }
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

  // Estilos
  const containerStyle = {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
    minHeight: "100vh",
    boxSizing: "border-box",
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
    background: "#000",
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
    margin: "10px 10px",
    padding: "12px 24px",
    borderRadius: "25px",
    border: "none",
    background: "#2ecc71",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 6px rgba(46, 204, 113, 0.2)",
  };

  const titleStyle = {
    color: "#2ecc71",
    marginBottom: "30px",
    fontSize: "28px",
    fontWeight: "600",
  };

  const errorContainerStyle = {
    ...containerStyle,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
  };

  const errorMessageStyle = {
    color: "#e74c3c",
    fontSize: "18px",
    lineHeight: "1.6",
    maxWidth: "600px",
    margin: "20px auto",
  };

  if (!isSupported) {
    return (
      <div style={errorContainerStyle}>
        <h2 style={titleStyle}>Erro de Compatibilidade</h2>
        <div style={errorMessageStyle}>
          <p>Seu navegador não suporta acesso à câmera.</p>
          <p>Por favor, tente:</p>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li>• Usar o Google Chrome mais recente</li>
            <li>• Verificar se está usando HTTPS</li>
            <li>• Permitir acesso à câmera nas configurações do navegador</li>
          </ul>
        </div>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div style={errorContainerStyle}>
        <h2 style={titleStyle}>Acesso Negado</h2>
        <p style={errorMessageStyle}>
          Acesso à câmera negado. Verifique as permissões do navegador.
        </p>
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
            aspectRatio: { ideal: 1.7777777778 },
          }}
          style={mediaStyle}
          onUserMediaError={(err) => {
            console.error("Erro na câmera:", err);
            setIsSupported(false);
            alert(
              `Erro ao acessar a câmera: ${
                err.message
              }\n${getBrowserSpecificMessage(detectBrowser())}`
            );
          }}
        />
      </div>

      <div style={{ marginTop: "30px" }}>
        <button
          style={buttonStyle}
          onClick={capture}
          onMouseOver={(e) => (e.target.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
        >
          📸 Tirar Foto
        </button>
        <button
          style={buttonStyle}
          onClick={trocarCamera}
          onMouseOver={(e) => (e.target.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
        >
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
