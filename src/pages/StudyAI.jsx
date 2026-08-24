import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "../assets/styles/pages/studyAI.css";
import spinner from "../assets/spinner.gif";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

function StudyAI() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [deletingDocumentId, setDeletingDocumentId] = useState(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];

  /*
   * ============================================================
   * RECUPERA DOCUMENTI
   * ============================================================
   */

  async function fetchDocuments(showLoading = true) {
    if (showLoading) {
      setLoadingDocuments(true);
    }

    try {
      /*
       * Recuperiamo la sessione dell'utente
       */
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
          "Devi essere autenticato per visualizzare i documenti."
        );
      }

      console.log("UTENTE AUTENTICATO:", user.id);

      /*
       * Recuperiamo i documenti dell'utente
       */
      const { data, error } = await supabase
        .from("study_documents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "ERRORE RECUPERO DOCUMENTI:",
          error
        );

        throw new Error(
          `Errore nel recupero dei documenti: ${error.message}`
        );
      }

      console.log(
        "DOCUMENTI RECUPERATI:",
        data
      );

      setDocuments(data || []);

      return data || [];
    } catch (error) {
      console.error(
        "ERRORE FETCH DOCUMENTI:",
        error
      );

      setErrorMessage(
        error.message ||
          "Impossibile recuperare i documenti."
      );

      return [];
    } finally {
      if (showLoading) {
        setLoadingDocuments(false);
      }
    }
  }

  /*
   * ============================================================
   * CARICAMENTO INIZIALE
   * ============================================================
   *
   * IMPORTANTE:
   * Non chiamiamo direttamente fetchDocuments().
   *
   * Facciamo partire un'operazione asincrona separata.
   */

  useEffect(() => {
    let cancelled = false;

    async function loadDocuments() {
      setLoadingDocuments(true);

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
            "Devi essere autenticato per visualizzare i documenti."
          );
        }

        console.log(
          "UTENTE AUTENTICATO:",
          user.id
        );

        const { data, error } = await supabase
          .from("study_documents")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: false,
          });

        if (error) {
          console.error(
            "ERRORE RECUPERO DOCUMENTI:",
            error
          );

          throw error;
        }

        console.log(
          "DOCUMENTI RECUPERATI:",
          data
        );

        /*
         * Evitiamo setState se il componente
         * è stato smontato.
         */
        if (!cancelled) {
          setDocuments(data || []);
          setErrorMessage("");
        }
      } catch (error) {
        console.error(
          "ERRORE FETCH DOCUMENTI:",
          error
        );

        if (!cancelled) {
          setDocuments([]);

          setErrorMessage(
            error.message ||
              "Impossibile recuperare i documenti."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingDocuments(false);
        }
      }
    }

    loadDocuments();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * ============================================================
   * SELEZIONE FILE
   * ============================================================
   */

  function handleFileChange(event) {
    setSuccessMessage("");
    setErrorMessage("");

    const files = Array.from(
      event.target.files || []
    );

    if (files.length === 0) {
      return;
    }

    /*
     * Controllo tipo
     */

    const invalidTypeFiles = files.filter(
      (file) =>
        !allowedTypes.includes(file.type)
    );

    if (invalidTypeFiles.length > 0) {
      setErrorMessage(
        "Uno o più file non sono supportati. Puoi caricare solo PDF, Word o TXT."
      );

      setSelectedFiles([]);

      return;
    }

    /*
     * Controllo dimensione
     */

    const oversizedFiles = files.filter(
      (file) =>
        file.size > MAX_FILE_SIZE
    );

    if (oversizedFiles.length > 0) {
      setErrorMessage(
        "Uno o più file superano il limite massimo di 20 MB."
      );

      setSelectedFiles([]);

      return;
    }

    setSelectedFiles(files);
  }

  /*
   * ============================================================
   * UPLOAD
   * ============================================================
   */

  async function handleUpload() {
    if (selectedFiles.length === 0) {
      setErrorMessage(
        "Seleziona almeno un documento da caricare."
      );

      return;
    }

    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      /*
       * Recuperiamo la sessione
       */

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
          "Devi essere autenticato per caricare un documento."
        );
      }

      let uploadedCount = 0;

      /*
       * Carichiamo i file uno alla volta
       */

      for (const file of selectedFiles) {
        /*
         * Estensione
         */

        const extension = file.name
          .split(".")
          .pop()
          .toLowerCase();

        /*
         * Nome univoco
         */

        const uniqueFileName =
          `${crypto.randomUUID()}.${extension}`;

        /*
         * Cartella dell'utente
         */

        const filePath =
          `${user.id}/${uniqueFileName}`;

        console.log(
          "UPLOAD:",
          filePath
        );

        /*
         * ------------------------------------------------------
         * STORAGE
         * ------------------------------------------------------
         */

        const {
          error: uploadError,
        } = await supabase.storage
          .from("study-documents")
          .upload(
            filePath,
            file
          );

        if (uploadError) {
          console.error(
            "ERRORE STORAGE:",
            uploadError
          );

          throw new Error(
            `Errore Storage: ${uploadError.message}`
          );
        }

        /*
         * ------------------------------------------------------
         * DATABASE
         * ------------------------------------------------------
         */

        const {
          error: databaseError,
        } = await supabase
          .from("study_documents")
          .insert({
            user_id: user.id,
            file_name: file.name,
            file_path: filePath,
            file_type: file.type,
            file_size: file.size,
          });

        /*
         * Se il database fallisce,
         * eliminiamo il file da Storage.
         */

        if (databaseError) {
          console.error(
            "ERRORE DATABASE:",
            databaseError
          );

          await supabase.storage
            .from("study-documents")
            .remove([filePath]);

          throw new Error(
            `Errore Database: ${databaseError.message}`
          );
        }

        uploadedCount++;
      }

      /*
       * Successo
       */

      setSuccessMessage(
        `${uploadedCount} ${
          uploadedCount === 1
            ? "documento caricato"
            : "documenti caricati"
        } con successo.`
      );

      /*
       * Puliamo i file selezionati
       */

      setSelectedFiles([]);

      /*
       * Aggiorniamo la lista.
       *
       * Qui non serve mostrare lo spinner principale
       * perché il caricamento è già terminato.
       */

      await fetchDocuments(false);
    } catch (error) {
      console.error(
        "ERRORE DURANTE UPLOAD:",
        error
      );

      setErrorMessage(
        error.message ||
          "Si è verificato un errore durante il caricamento dei documenti."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * ============================================================
   * ELIMINA DOCUMENTO
   * ============================================================
   */

  async function handleDeleteDocument(document) {
    const confirmed = window.confirm(
      `Sei sicuro di voler eliminare "${document.file_name}"?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingDocumentId(document.id);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      /*
       * Recuperiamo l'utente corrente
       */

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
          "Devi essere autenticato."
        );
      }

      /*
       * Controlliamo che il documento appartenga
       * effettivamente all'utente corrente.
       */

      if (document.user_id !== user.id) {
        throw new Error(
          "Non puoi eliminare questo documento."
        );
      }

      /*
       * ------------------------------------------------------
       * 1. ELIMINA FILE DA STORAGE
       * ------------------------------------------------------
       */

      const {
        error: storageError,
      } = await supabase.storage
        .from("study-documents")
        .remove([
          document.file_path,
        ]);

      if (storageError) {
        console.error(
          "ERRORE STORAGE DELETE:",
          storageError
        );

        throw new Error(
          `Errore durante l'eliminazione del file: ${storageError.message}`
        );
      }

      /*
       * ------------------------------------------------------
       * 2. ELIMINA RECORD DATABASE
       * ------------------------------------------------------
       */

      const {
        error: databaseError,
      } = await supabase
        .from("study_documents")
        .delete()
        .eq("id", document.id)
        .eq("user_id", user.id);

      if (databaseError) {
        console.error(
          "ERRORE DATABASE DELETE:",
          databaseError
        );

        throw new Error(
          `Errore durante l'eliminazione del documento: ${databaseError.message}`
        );
      }

      /*
       * ------------------------------------------------------
       * 3. AGGIORNIAMO LA LISTA
       * ------------------------------------------------------
       */

      setDocuments(
        (currentDocuments) =>
          currentDocuments.filter(
            (item) =>
              item.id !== document.id
          )
      );

      setSuccessMessage(
        `"${document.file_name}" è stato eliminato con successo.`
      );
    } catch (error) {
      console.error(
        "ERRORE DURANTE ELIMINAZIONE:",
        error
      );

      setErrorMessage(
        error.message ||
          "Si è verificato un errore durante l'eliminazione del documento."
      );
    } finally {
      setDeletingDocumentId(null);
    }
  }

  /*
   * ============================================================
   * FORMATTA DIMENSIONE
   * ============================================================
   */

  function formatFileSize(bytes) {
    if (!bytes) {
      return "0 MB";
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(
      bytes /
      1024 /
      1024
    ).toFixed(2)} MB`;
  }

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div className="study-ai-page">

      {/* HEADER */}

      <div className="study-ai-header">
        <h1>
          Study AI
        </h1>

        <p>
          Carica il materiale del tuo esame
          e preparati allo studio con l'AI.
        </p>
      </div>

      {/* UPLOAD */}

      <div className="upload-card">

        <div className="upload-icon">
          📄
        </div>

        <h2>
          Carica i tuoi documenti
        </h2>

        <p className="upload-description">
          Puoi caricare PDF, documenti Word
          o file di testo.
        </p>

        <label className="file-input-label">
          <span>
            Seleziona documenti
          </span>

          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
          />
        </label>

        {/* FILE SELEZIONATI */}

        {selectedFiles.length > 0 && (
          <div className="selected-files text-black">

            <h3>
              Documenti selezionati
            </h3>

            {selectedFiles.map(
              (file, index) => (
                <div
                  className="selected-file"
                  key={`${file.name}-${index}`}
                >

                  <span>
                    📄
                  </span>

                  <div className="file-info">

                    <strong>
                      {file.name}
                    </strong>

                    <small>
                      {formatFileSize(
                        file.size
                      )}
                    </small>

                  </div>

                </div>
              )
            )}

          </div>
        )}

        {/* UPLOAD BUTTON */}

        <button
          className="upload-button"
          onClick={handleUpload}
          disabled={
            loading ||
            selectedFiles.length === 0
          }
        >

          {loading ? (
            <>
              <span className="spinner">
                <img
                  src={spinner}
                  alt="spinner"
                />
              </span>

              Caricamento...
            </>
          ) : (
            "Carica documenti"
          )}

        </button>

      </div>

      {/* DOCUMENTI */}

      <div className="documents-card">

        <div className="documents-header">

          <h2>
            I tuoi documenti
          </h2>

          <span>
            {documents.length}{" "}
            {documents.length === 1
              ? "documento"
              : "documenti"}
          </span>

        </div>

        {/* LOADING */}

        {loadingDocuments ? (

          <div className="documents-loading">

            <img
              src={spinner}
              alt="Caricamento"
            />

            <span>
              Caricamento documenti...
            </span>

          </div>

        ) : documents.length === 0 ? (

          /* NESSUN DOCUMENTO */

          <div className="empty-documents">

            <span className="empty-documents-icon">
              📂
            </span>

            <p>
              Non hai ancora caricato
              nessun documento.
            </p>

          </div>

        ) : (

          /* LISTA */

          <div className="documents-list">

            {documents.map(
              (document) => (

                <div
                  className="document-item"
                  key={document.id}
                >

                  <div className="document-icon">
                    📄
                  </div>

                  <div className="document-info">

                    <strong>
                      {document.file_name}
                    </strong>

                    <small>

                      {formatFileSize(
                        document.file_size
                      )}

                      {document.created_at && (
                        <>
                          {" · "}

                          {new Date(
                            document.created_at
                          ).toLocaleDateString(
                            "it-IT"
                          )}
                        </>
                      )}

                    </small>

                  </div>

                  <button
                    type="button"
                    className="delete-document-button"
                    onClick={() =>
                      handleDeleteDocument(
                        document
                      )
                    }
                    disabled={
                      deletingDocumentId ===
                      document.id
                    }
                    title="Elimina documento"
                  >

                    {deletingDocumentId ===
                    document.id ? (

                      <img
                        src={spinner}
                        alt="Eliminazione"
                      />

                    ) : (
                      "🗑️"
                    )}

                  </button>

                </div>

              )
            )}

          </div>

        )}

      </div>

      {/* SUCCESS */}

      {successMessage && (
        <div className="upload-banner success-banner">

          <span>
            ✓
          </span>

          <span>
            {successMessage}
          </span>

        </div>
      )}

      {/* ERROR */}

      {errorMessage && (
        <div className="upload-banner error-banner">

          <span>
            !
          </span>

          <span>
            {errorMessage}
          </span>

        </div>
      )}

    </div>
  );
}

export default StudyAI;