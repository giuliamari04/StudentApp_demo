import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useParams, useNavigate } from "react-router-dom";
import "../assets/styles/pages/studyAI.css";
import spinner from "../assets/spinner.gif";
import AppModal from "../components/AppModal";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

function SingleCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // ============================================================
  // COURSE
  // ============================================================

  const [course, setCourse] = useState(null);
  const [loadingCourse, setLoadingCourse] = useState(true);

  // ============================================================
  // DOCUMENTS
  // ============================================================

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [loadingDocuments, setLoadingDocuments] = useState(true);

  // ============================================================
  // UPLOAD
  // ============================================================

  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFileName, setUploadFileName] = useState("");

  // ============================================================
  // DELETE
  // ============================================================

  const [deletingDocumentId, setDeletingDocumentId] = useState(null);

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    document: null,
  });

  // ============================================================
  // MESSAGES
  // ============================================================

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // ============================================================
  // FILE TYPES
  // ============================================================

  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];

  // ============================================================
  // CARICAMENTO INIZIALE
  // ============================================================

  useEffect(() => {
    if (!courseId) {
      return;
    }

    loadCourse();
    fetchDocuments();
  }, [courseId]);

  // ============================================================
  // RECUPERA CORSO
  // ============================================================

  async function loadCourse() {
    setLoadingCourse(true);
    setErrorMessage("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      const user = session?.user;

      if (!user) {
        throw new Error("Devi essere autenticato.");
      }

      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .eq("user_id", user.id)
        .single();

      if (error) {
        throw error;
      }

      setCourse(data);
    } catch (error) {
      console.error("ERRORE CARICAMENTO CORSO:", error);

      setCourse(null);

      setErrorMessage(error.message || "Impossibile recuperare il corso.");
    } finally {
      setLoadingCourse(false);
    }
  }

  // ============================================================
  // RECUPERA DOCUMENTI DEL CORSO
  // ============================================================

  async function fetchDocuments(showLoading = true) {
    if (!courseId) {
      return [];
    }

    if (showLoading) {
      setLoadingDocuments(true);
    }

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      const user = session?.user;

      if (!user) {
        throw new Error(
          "Devi essere autenticato per visualizzare i documenti.",
        );
      }

      const { data, error } = await supabase
        .from("study_documents")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setDocuments(data || []);
      setErrorMessage("");

      return data || [];
    } catch (error) {
      console.error("ERRORE FETCH DOCUMENTI:", error);

      setDocuments([]);

      setErrorMessage(error.message || "Impossibile recuperare i documenti.");

      return [];
    } finally {
      if (showLoading) {
        setLoadingDocuments(false);
      }
    }
  }

  // ============================================================
  // SELEZIONE FILE
  // ============================================================

  function handleFileChange(event) {
    setSuccessMessage("");
    setErrorMessage("");

    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      return;
    }

    // ----------------------------------------------------------
    // Controllo tipo
    // ----------------------------------------------------------

    const invalidTypeFiles = files.filter(
      (file) => !allowedTypes.includes(file.type),
    );

    if (invalidTypeFiles.length > 0) {
      setErrorMessage(
        "Uno o più file non sono supportati. Puoi caricare solo PDF, Word o TXT.",
      );

      setSelectedFiles([]);

      event.target.value = "";

      return;
    }

    // ----------------------------------------------------------
    // Controllo dimensione
    // ----------------------------------------------------------

    const oversizedFiles = files.filter((file) => file.size > MAX_FILE_SIZE);

    if (oversizedFiles.length > 0) {
      setErrorMessage("Uno o più file superano il limite massimo di 20 MB.");

      setSelectedFiles([]);

      event.target.value = "";

      return;
    }

    setSelectedFiles(files);
  }

  // ============================================================
  // UPLOAD CON PROGRESSO
  // ============================================================

  async function uploadFileWithProgress(file, filePath) {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      throw sessionError;
    }

    if (!session?.access_token) {
      throw new Error("Sessione non valida. Effettua nuovamente il login.");
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl) {
      throw new Error("VITE_SUPABASE_URL non è configurato.");
    }

    if (!supabaseAnonKey) {
      throw new Error("VITE_SUPABASE_ANON_KEY non è configurato.");
    }

    const uploadUrl = `${supabaseUrl}/storage/v1/object/study-documents/${filePath}`;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open("POST", uploadUrl, true);

      xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);

      xhr.setRequestHeader("apikey", supabaseAnonKey);

      xhr.setRequestHeader(
        "Content-Type",
        file.type || "application/octet-stream",
      );

      // Evitiamo di sovrascrivere accidentalmente file esistenti
      xhr.setRequestHeader("x-upsert", "false");

      // --------------------------------------------------------
      // PROGRESSO
      // --------------------------------------------------------

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && event.total > 0) {
          const percent = Math.round((event.loaded / event.total) * 100);

          setUploadProgress(percent);
        }
      };

      // --------------------------------------------------------
      // COMPLETATO
      // --------------------------------------------------------

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploadProgress(100);
          resolve();
          return;
        }

        let message = "Errore durante il caricamento del file.";

        try {
          const response = JSON.parse(xhr.responseText);

          if (response?.message) {
            message = response.message;
          }

          if (response?.error) {
            message = response.error;
          }
        } catch {
          if (xhr.responseText) {
            message = xhr.responseText;
          }
        }

        reject(new Error(message));
      };

      // --------------------------------------------------------
      // ERRORI
      // --------------------------------------------------------

      xhr.onerror = () => {
        reject(
          new Error("Errore di rete durante il caricamento del documento."),
        );
      };

      xhr.onabort = () => {
        reject(new Error("Caricamento annullato."));
      };

      xhr.ontimeout = () => {
        reject(
          new Error("Il caricamento del documento ha impiegato troppo tempo."),
        );
      };

      xhr.timeout = 5 * 60 * 1000;

      xhr.send(file);
    });
  }

  // ============================================================
  // UPLOAD DOCUMENTI
  // ============================================================

  async function handleUpload() {
    if (!courseId) {
      setErrorMessage("Corso non specificato.");
      return;
    }

    if (selectedFiles.length === 0) {
      setErrorMessage("Seleziona almeno un documento da caricare.");
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // --------------------------------------------------------
      // Recuperiamo sessione
      // --------------------------------------------------------

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      const user = session?.user;

      if (!user) {
        throw new Error("Devi essere autenticato per caricare un documento.");
      }

      // --------------------------------------------------------
      // Verifica che il corso appartenga all'utente
      // --------------------------------------------------------

      const { data: currentCourse, error: courseError } = await supabase
        .from("courses")
        .select("id")
        .eq("id", courseId)
        .eq("user_id", user.id)
        .single();

      if (courseError || !currentCourse) {
        throw new Error("Non puoi caricare documenti in questo corso.");
      }

      let uploadedCount = 0;

      // --------------------------------------------------------
      // Carichiamo i file uno alla volta
      // --------------------------------------------------------

      for (const file of selectedFiles) {
        setUploadFileName(file.name);
        setUploadProgress(0);

        // ------------------------------------------------------
        // Estensione
        // ------------------------------------------------------

        const extension = file.name.includes(".")
          ? file.name.split(".").pop().toLowerCase()
          : "";

        // ------------------------------------------------------
        // Nome univoco
        // ------------------------------------------------------

        const uniqueFileName = extension
          ? `${crypto.randomUUID()}.${extension}`
          : crypto.randomUUID();

        // ------------------------------------------------------
        // STORAGE PATH
        //
        // user_id / course_id / file
        // ------------------------------------------------------

        const filePath = `${user.id}/${courseId}/${uniqueFileName}`;

        console.log("UPLOAD FILE:", filePath);

        // ------------------------------------------------------
        // 1. STORAGE
        // ------------------------------------------------------

        await uploadFileWithProgress(file, filePath);

        console.log("UPLOAD COMPLETATO:", file.name);

        // ------------------------------------------------------
        // 2. DATABASE
        //
        // IMPORTANTE:
        // course_id viene salvato qui
        // ------------------------------------------------------

        const { data: documentData, error: databaseError } = await supabase
          .from("study_documents")
          .insert({
            user_id: user.id,
            course_id: courseId,
            file_name: file.name,
            file_path: filePath,
            file_type: file.type,
            file_size: file.size,
            status: "uploaded",
          })
          .select()
          .single();

        // ------------------------------------------------------
        // Se DB fallisce -> eliminiamo il file Storage
        // ------------------------------------------------------

        if (databaseError) {
          console.error("ERRORE DATABASE:", databaseError);

          await supabase.storage.from("study-documents").remove([filePath]);

          throw new Error(`Errore Database: ${databaseError.message}`);
        }

        console.log("DOCUMENTO CREATO:", documentData);

        // ------------------------------------------------------
        // 3. PROCESSAMENTO PDF
        // ------------------------------------------------------

        if (file.type === "application/pdf") {
          console.log("Avvio processamento PDF...");

          const { data: processingData, error: processingError } =
            await supabase.functions.invoke("process-document", {
              body: {
                document_id: documentData.id,
                file_path: filePath,
              },
            });

          // ----------------------------------------------------
          // Errore Edge Function
          // ----------------------------------------------------

          if (processingError) {
            console.error("ERRORE PROCESSAMENTO:", processingError);

            throw new Error(
              `Errore durante l'elaborazione del documento: ${processingError.message}`,
            );
          }

          // ----------------------------------------------------
          // Errore restituito dalla funzione
          // ----------------------------------------------------

          if (!processingData?.success) {
            throw new Error(
              processingData?.error ||
                "Errore durante l'elaborazione del documento.",
            );
          }

          console.log("PDF PROCESSATO:", processingData);
        }

        uploadedCount++;
      }

      // --------------------------------------------------------
      // SUCCESSO
      // --------------------------------------------------------

      setUploadProgress(100);

      setSuccessMessage(
        `${uploadedCount} ${
          uploadedCount === 1 ? "documento caricato" : "documenti caricati"
        } con successo.`,
      );

      setSelectedFiles([]);
      setUploadFileName("");

      // --------------------------------------------------------
      // Reset input file
      // --------------------------------------------------------

      const fileInput = document.getElementById("study-document-input");

      if (fileInput) {
        fileInput.value = "";
      }

      // --------------------------------------------------------
      // Aggiorniamo lista
      // --------------------------------------------------------

      await fetchDocuments(false);
    } catch (error) {
      console.error("ERRORE DURANTE UPLOAD:", error);

      setErrorMessage(
        error.message ||
          "Si è verificato un errore durante il caricamento del documento.",
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // DOWNLOAD DOCUMENTO
  //

 async function handleDownloadDocument(studyDocument) {
  try {
    setSuccessMessage("");
    setErrorMessage("");

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      throw sessionError;
    }

    const user = session?.user;

    if (!user) {
      throw new Error("Devi essere autenticato.");
    }

    // Controllo sicurezza
    if (
      studyDocument.user_id !== user.id ||
      studyDocument.course_id !== courseId
    ) {
      throw new Error("Non puoi aprire questo documento.");
    }

    const { data, error } = await supabase.storage
      .from("study-documents")
      .createSignedUrl(studyDocument.file_path, 60);

    if (error) {
      throw new Error(
        `Errore durante l'apertura del documento: ${error.message}`
      );
    }

    if (!data?.signedUrl) {
      throw new Error("Impossibile creare il link al documento.");
    }

    // APRE IL PDF NEL VISUALIZZATORE PDF DEL BROWSER
    window.open(data.signedUrl, "_blank");
  } catch (error) {
    console.error("ERRORE APERTURA DOCUMENTO:", error);

    setErrorMessage(
      error.message || "Impossibile aprire il documento."
    );
  }
}
  // ============================================================
  // APRE MODALE ELIMINAZIONE
  // ============================================================

  function handleDeleteDocument(document) {
    setSuccessMessage("");
    setErrorMessage("");

    setDeleteModal({
      open: true,
      document,
    });
  }

  // ============================================================
  // ANNULLA ELIMINAZIONE
  // ============================================================

  function cancelDeleteDocument() {
    setDeleteModal({
      open: false,
      document: null,
    });
  }

  // ============================================================
  // CONFERMA ELIMINAZIONE
  // ============================================================

  async function confirmDeleteDocument() {
    const document = deleteModal.document;

    if (!document) {
      return;
    }

    setDeleteModal({
      open: false,
      document: null,
    });

    setDeletingDocumentId(document.id);

    setSuccessMessage("");
    setErrorMessage("");

    try {
      // --------------------------------------------------------
      // Recuperiamo sessione
      // --------------------------------------------------------

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      const user = session?.user;

      if (!user) {
        throw new Error("Devi essere autenticato.");
      }

      // --------------------------------------------------------
      // Controlli sicurezza
      // --------------------------------------------------------

      if (document.user_id !== user.id) {
        throw new Error("Non puoi eliminare questo documento.");
      }

      if (document.course_id !== courseId) {
        throw new Error("Questo documento non appartiene a questo corso.");
      }

      // --------------------------------------------------------
      // 1. STORAGE
      // --------------------------------------------------------

      const { error: storageError } = await supabase.storage
        .from("study-documents")
        .remove([document.file_path]);

      if (storageError) {
        throw new Error(
          `Errore durante l'eliminazione del file: ${storageError.message}`,
        );
      }

      // --------------------------------------------------------
      // 2. DATABASE
      // --------------------------------------------------------

      const { error: databaseError } = await supabase
        .from("study_documents")
        .delete()
        .eq("id", document.id)
        .eq("user_id", user.id)
        .eq("course_id", courseId);

      if (databaseError) {
        throw new Error(
          `Errore durante l'eliminazione del documento: ${databaseError.message}`,
        );
      }

      // --------------------------------------------------------
      // 3. AGGIORNA LISTA
      // --------------------------------------------------------

      setDocuments((currentDocuments) =>
        currentDocuments.filter((item) => item.id !== document.id),
      );

      setSuccessMessage(
        `"${document.file_name}" è stato eliminato con successo.`,
      );
    } catch (error) {
      console.error("ERRORE DURANTE ELIMINAZIONE:", error);

      setErrorMessage(
        error.message ||
          "Si è verificato un errore durante l'eliminazione del documento.",
      );
    } finally {
      setDeletingDocumentId(null);
    }
  }

  // ============================================================
  // FORMATTA DIMENSIONE
  // ============================================================

  function formatFileSize(bytes) {
    if (!bytes) {
      return "0 MB";
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  // ============================================================
  // RENDER - LOADING CORSO
  // ============================================================
  if (!courseId) {
    return (
      <div className="study-ai-page">
        <div className="upload-banner error-banner">
          <span>!</span>

          <span>Corso non specificato.</span>
        </div>

        <button
          type="button"
          className="upload-button"
          onClick={() => navigate("/courses")}
        >
          ← Torna ai corsi
        </button>
      </div>
    );
  }

  if (loadingCourse) {
    return (
      <div className="study-ai-page">
        <div className="documents-loading">
          <img src={spinner} alt="Caricamento" />

          <span>Caricamento corso...</span>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER - CORSO NON TROVATO
  // ============================================================

  if (!course) {
    return (
      <div className="study-ai-page">
        <div className="upload-banner error-banner">
          <span>!</span>

          <span>{errorMessage || "Corso non trovato."}</span>
        </div>

        <button
          type="button"
          className="upload-button"
          onClick={() => navigate("/courses")}
        >
          ← Torna ai corsi
        </button>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="study-ai-page">
      {/* ======================================================
          HEADER CORSO
          ====================================================== */}

      <div className="study-ai-header">
        <button
          type="button"
          className="back-course-button"
          onClick={() => navigate("/courses")}
        >
          ← Torna ai corsi
        </button>

        <h1>{course.name}</h1>

        <p>
          {course.professor
            ? `Prof. ${course.professor}`
            : "Nessun professore inserito"}
          {course.credits ? ` · ${course.credits} CFU` : ""}
        </p>
      </div>

      {/* ======================================================
          UPLOAD CARD
          ====================================================== */}

      <div className="upload-card">
        <div className="upload-icon">📖</div>

        <h2>Materiale di {course.name}</h2>

        <p className="upload-description">
          Carica PDF, documenti Word o file di testo relativi a questo corso.
        </p>

        <label className="file-input-label">
          <span>Seleziona documenti</span>

          <input
            id="study-document-input"
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
            disabled={loading}
          />
        </label>

        {/* ====================================================
            FILE SELEZIONATI
            ==================================================== */}

        {selectedFiles.length > 0 && (
          <div className="selected-files text-black">
            <h3>Documenti selezionati</h3>

            {selectedFiles.map((file, index) => (
              <div className="selected-file" key={`${file.name}-${index}`}>
                <span>📄</span>

                <div className="file-info">
                  <strong>{file.name}</strong>

                  <small>{formatFileSize(file.size)}</small>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ====================================================
            PROGRESSO
            ==================================================== */}

        {loading && (
          <div className="upload-progress">
            <div className="upload-progress-header">
              <span>Caricamento...</span>

              <strong>{uploadProgress}%</strong>
            </div>

            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${uploadProgress}%`,
                }}
              />
            </div>

            {uploadFileName && <small>{uploadFileName}</small>}
          </div>
        )}

        {/* ====================================================
            BOTTONE UPLOAD
            ==================================================== */}

        <button
          type="button"
          className="upload-button"
          onClick={handleUpload}
          disabled={loading || selectedFiles.length === 0}
        >
          {loading ? "Caricamento..." : "Carica documenti"}
        </button>
      </div>

      {/* ======================================================
          DOCUMENTI
          ====================================================== */}

      <div className="documents-card">
        <div className="documents-header">
          <h2>Documenti del corso</h2>

          <span>
            {documents.length}{" "}
            {documents.length === 1 ? "documento" : "documenti"}
          </span>
        </div>

        {/* ----------------------------------------------------
            LOADING
            ---------------------------------------------------- */}

        {loadingDocuments ? (
          <div className="documents-loading">
            <img src={spinner} alt="Caricamento" />

            <span>Caricamento documenti...</span>
          </div>
        ) : documents.length === 0 ? (
          /* --------------------------------------------------
             EMPTY
             -------------------------------------------------- */

          <div className="empty-documents">
            <span className="empty-documents-icon">📂</span>

            <p>Non hai ancora caricato documenti per questo corso.</p>
          </div>
        ) : (
          /* --------------------------------------------------
             LISTA DOCUMENTI
             -------------------------------------------------- */

          <div className="documents-list">
            {documents.map((document) => (
              <div className="document-item" key={document.id}>
                <div className="document-icon">📄</div>

                <div className="document-info">
                  <strong>{document.file_name}</strong>

                  <small>
                    {document.page_count !== null &&
                      document.page_count !== undefined && (
                        <>
                          {document.page_count}{" "}
                          {document.page_count === 1 ? "pagina" : "pagine"}
                          {" · "}
                        </>
                      )}

                    {formatFileSize(document.file_size)}

                    {document.created_at && (
                      <>
                        {" · "}

                        {new Date(document.created_at).toLocaleDateString(
                          "it-IT",
                        )}
                      </>
                    )}
                  </small>

                  {/* STATUS */}

                  {document.status && (
                    <small>
                      {document.status === "processed"
                        ? "✓ Elaborato"
                        : document.status === "processing"
                          ? "⏳ In elaborazione"
                          : document.status === "error"
                            ? "⚠ Errore elaborazione"
                            : "Caricato"}
                    </small>
                  )}
                </div>

                {/* DOWNLOAD */}
                <button
                  type="button"
                  className="download-document-button"
                  onClick={() => handleDownloadDocument(document)}
                  title="Scarica documento"
                >
                  📄
                </button>
                {/* DELETE */}

                <button
                  type="button"
                  className="delete-document-button"
                  onClick={() => handleDeleteDocument(document)}
                  disabled={deletingDocumentId === document.id}
                  title="Elimina documento"
                >
                  {deletingDocumentId === document.id ? (
                    <img src={spinner} alt="Eliminazione" />
                  ) : (
                    "🗑️"
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ======================================================
          SUCCESS
          ====================================================== */}

      {successMessage && (
        <div className="upload-banner success-banner">
          <span>✓</span>

          <span>{successMessage}</span>
        </div>
      )}

      {/* ======================================================
          ERROR
          ====================================================== */}

      {errorMessage && (
        <div className="upload-banner error-banner">
          <span>!</span>

          <span>{errorMessage}</span>
        </div>
      )}

      {/* ======================================================
          DELETE MODAL
          ====================================================== */}

      {deleteModal.open && deleteModal.document && (
        <AppModal
          type="danger"
          title="Eliminare il documento?"
          message={`Sei sicuro di voler eliminare "${deleteModal.document.file_name}"? Questa operazione non può essere annullata.`}
          confirmText="Elimina"
          cancelText="Annulla"
          showCancel={true}
          onConfirm={confirmDeleteDocument}
          onCancel={cancelDeleteDocument}
        />
      )}
    </div>
  );
}

export default SingleCourse;
