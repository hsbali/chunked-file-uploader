import { useState } from "react";
import UploadContext from "./contexts/UploadContext";

import UploadForm from "./components/UploadForm";
import UploadStatus from "./components/UploadStatus";

import "./styles/global.scss"

function App() {
  const [files, setFiles] = useState([]);
  const [showUploadStatus, setShowUploadStatus] = useState(false);

  return (
    <>
      <UploadContext.Provider value={{ files, setFiles, setShowUploadStatus }}>
        {showUploadStatus ? (
          <>
            <UploadStatus />
          </>
        ) : (
          <>
            <UploadForm />
          </>
        )}
      </UploadContext.Provider>
    </>
  )
}

export default App;
