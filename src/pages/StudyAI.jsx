// import { useEffect, useState } from "react";
// import { supabase } from "../supabaseClient";
// import "../assets/styles/pages/studyAI.css";
// import spinner from "../assets/spinner.gif";
// import AppModal from "../components/AppModal";

// const MAX_FILE_SIZE = 20 * 1024 * 1024;

// function StudyAI() {
//   const [selectedFiles, setSelectedFiles] = useState([]);
//   const [documents, setDocuments] = useState([]);

//   const [loading, setLoading] = useState(false);
//   const [loadingDocuments, setLoadingDocuments] = useState(true);

//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [uploadFileName, setUploadFileName] = useState("");

//   const [deletingDocumentId, setDeletingDocumentId] = useState(null);

//   const [deleteModal, setDeleteModal] = useState({
//     open: false,
//     document: null,
//   });

//   const [successMessage, setSuccessMessage] = useState("");

//   const [errorMessage, setErrorMessage] = useState("");

//   const allowedTypes = [
//     "application/pdf",
//     "application/msword",
//     "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//     "text/plain",
//   ];

//   /*
//    * ============================================================
//    * RECUPERA DOCUMENTI
//    * ============================================================
//    */

//   async function fetchDocuments(showLoading = true) {
//     if (showLoading) {
//       setLoadingDocuments(true);
//     }

//     try {
//       const {
//         data: { session },
//         error: sessionError,
//       } = await supabase.auth.getSession();

//       if (sessionError) {
//         throw sessionError;
//       }

//       const user = session?.user;

//       if (!user) {
//         throw new Error(
//           "Devi essere autenticato per visualizzare i documenti.",
//         );
//       }

//       const { data, error } = await supabase
//         .from("study_documents")
//         .select("*")
//         .eq("user_id", user.id)
//         .order("created_at", {
//           ascending: false,
//         });

//       if (error) {
//         throw new Error(`Errore nel recupero dei documenti: ${error.message}`);
//       }

//       setDocuments(data || []);

//       return data || [];
//     } catch (error) {
//       console.error("ERRORE FETCH DOCUMENTI:", error);

//       setErrorMessage(error.message || "Impossibile recuperare i documenti.");

//       return [];
//     } finally {
//       if (showLoading) {
//         setLoadingDocuments(false);
//       }
//     }
//   }

//   /*
//    * ============================================================
//    * CARICAMENTO INIZIALE
//    * ============================================================
//    */

//   useEffect(() => {
//     let cancelled = false;

//     async function loadDocuments() {
//       setLoadingDocuments(true);

//       try {
//         const {
//           data: { session },
//           error: sessionError,
//         } = await supabase.auth.getSession();

//         if (sessionError) {
//           throw sessionError;
//         }

//         const user = session?.user;

//         if (!user) {
//           throw new Error(
//             "Devi essere autenticato per visualizzare i documenti.",
//           );
//         }

//         const { data, error } = await supabase
//           .from("study_documents")
//           .select("*")
//           .eq("user_id", user.id)
//           .order("created_at", {
//             ascending: false,
//           });

//         if (error) {
//           throw error;
//         }

//         if (!cancelled) {
//           setDocuments(data || []);
//           setErrorMessage("");
//         }
//       } catch (error) {
//         console.error("ERRORE CARICAMENTO DOCUMENTI:", error);

//         if (!cancelled) {
//           setDocuments([]);

//           setErrorMessage(
//             error.message || "Impossibile recuperare i documenti.",
//           );
//         }
//       } finally {
//         if (!cancelled) {
//           setLoadingDocuments(false);
//         }
//       }
//     }

//     loadDocuments();

//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   /*
//    * ============================================================
//    * SELEZIONE FILE
//    * ============================================================
//    */

//   function handleFileChange(event) {
//     setSuccessMessage("");
//     setErrorMessage("");

//     const files = Array.from(event.target.files || []);

//     if (files.length === 0) {
//       return;
//     }

//     /*
//      * Controllo tipo
//      */

//     const invalidTypeFiles = files.filter(
//       (file) => !allowedTypes.includes(file.type),
//     );

//     if (invalidTypeFiles.length > 0) {
//       setErrorMessage(
//         "Uno o più file non sono supportati. Puoi caricare solo PDF, Word o TXT.",
//       );

//       setSelectedFiles([]);

//       return;
//     }

//     /*
//      * Controllo dimensione
//      */

//     const oversizedFiles = files.filter((file) => file.size > MAX_FILE_SIZE);

//     if (oversizedFiles.length > 0) {
//       setErrorMessage("Uno o più file superano il limite massimo di 20 MB.");

//       setSelectedFiles([]);

//       return;
//     }

//     setSelectedFiles(files);
//   }

//   /*
//    * ============================================================
//    * UPLOAD CON PROGRESSO
//    * ============================================================
//    */

//   async function uploadFileWithProgress(file, filePath) {
//     const {
//       data: { session },
//       error: sessionError,
//     } = await supabase.auth.getSession();

//     if (sessionError) {
//       throw sessionError;
//     }

//     if (!session?.access_token) {
//       throw new Error("Sessione non valida. Effettua nuovamente il login.");
//     }

//     const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
//     const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

//     if (!supabaseUrl) {
//       throw new Error("VITE_SUPABASE_URL non è configurato.");
//     }

//     if (!supabaseAnonKey) {
//       throw new Error("VITE_SUPABASE_ANON_KEY non è configurato.");
//     }

//     const uploadUrl = `${supabaseUrl}/storage/v1/object/study-documents/${filePath}`;

//     return new Promise((resolve, reject) => {
//       const xhr = new XMLHttpRequest();

//       xhr.open("POST", uploadUrl, true);

//       xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);

//       xhr.setRequestHeader("apikey", supabaseAnonKey);

//       xhr.setRequestHeader(
//         "Content-Type",
//         file.type || "application/octet-stream",
//       );

//       /*
//        * IMPORTANTE:
//        * NON usare x-upsert=true.
//        * Il nome del file è già univoco.
//        */

//       xhr.setRequestHeader("x-upsert", "false");

//       /*
//        * ============================================================
//        * PROGRESSO UPLOAD
//        * ============================================================
//        */

//       xhr.upload.onprogress = (event) => {
//         console.log(
//           "PROGRESS EVENT:",
//           event.loaded,
//           event.total,
//           event.lengthComputable,
//         );

//         if (event.lengthComputable && event.total > 0) {
//           const percent = Math.round((event.loaded / event.total) * 100);

//           console.log(`UPLOAD ${file.name}: ${percent}%`);

//           setUploadProgress(percent);
//         }
//       };

//       /*
//        * ============================================================
//        * UPLOAD COMPLETATO
//        * ============================================================
//        */

//       xhr.onload = () => {
//         console.log("XHR STATUS:", xhr.status);

//         if (xhr.status >= 200 && xhr.status < 300) {
//           setUploadProgress(100);

//           resolve();
//           return;
//         }

//         let message = "Errore durante il caricamento del file.";

//         try {
//           const response = JSON.parse(xhr.responseText);

//           if (response?.message) {
//             message = response.message;
//           }

//           if (response?.error) {
//             message = response.error;
//           }
//         } catch {
//           if (xhr.responseText) {
//             message = xhr.responseText;
//           }
//         }

//         reject(new Error(message));
//       };

//       /*
//        * ============================================================
//        * ERRORE
//        * ============================================================
//        */

//       xhr.onerror = () => {
//         reject(
//           new Error("Errore di rete durante il caricamento del documento."),
//         );
//       };

//       /*
//        * ============================================================
//        * ABORT
//        * ============================================================
//        */

//       xhr.onabort = () => {
//         reject(new Error("Caricamento annullato."));
//       };

//       /*
//        * ============================================================
//        * TIMEOUT
//        * ============================================================
//        */

//       xhr.ontimeout = () => {
//         reject(
//           new Error("Il caricamento del documento ha impiegato troppo tempo."),
//         );
//       };

//       /*
//        * Timeout 5 minuti
//        */

//       xhr.timeout = 5 * 60 * 1000;

//       /*
//        * ============================================================
//        * AVVIO UPLOAD
//        * ============================================================
//        */

//       console.log("AVVIO UPLOAD:", file.name, file.size);

//       xhr.send(file);
//     });
//   }

//   /*
//    * ============================================================
//    * UPLOAD DOCUMENTI
//    * ============================================================
//    */

//   async function handleUpload() {
//     if (selectedFiles.length === 0) {
//       setErrorMessage("Seleziona almeno un documento da caricare.");

//       return;
//     }

//     setLoading(true);
//     setUploadProgress(0);

//     setSuccessMessage("");
//     setErrorMessage("");

//     try {
//       /*
//        * Recuperiamo l'utente
//        */

//       const {
//         data: { session },
//         error: sessionError,
//       } = await supabase.auth.getSession();

//       if (sessionError) {
//         throw sessionError;
//       }

//       const user = session?.user;

//       if (!user) {
//         throw new Error("Devi essere autenticato per caricare un documento.");
//       }

//       let uploadedCount = 0;

//       /*
//        * Carichiamo i file uno alla volta
//        */

//       for (const file of selectedFiles) {
//         setUploadFileName(file.name);

//         setUploadProgress(0);

//         /*
//          * Estensione
//          */

//         const extension = file.name.split(".").pop().toLowerCase();

//         /*
//          * Nome univoco
//          */

//         const uniqueFileName = `${crypto.randomUUID()}.${extension}`;

//         /*
//          * Percorso Storage
//          */

//         const filePath = `${user.id}/${uniqueFileName}`;

//         console.log("UPLOAD FILE:", filePath);

//         /*
//          * ======================================================
//          * 1. STORAGE
//          * ======================================================
//          */

//         await uploadFileWithProgress(file, filePath);

//         console.log("UPLOAD COMPLETATO");

//         /*
//          * ======================================================
//          * 2. DATABASE
//          * ======================================================
//          */

//         const { data: documentData, error: databaseError } = await supabase
//           .from("study_documents")
//           .insert({
//             user_id: user.id,
//             file_name: file.name,
//             file_path: filePath,
//             file_type: file.type,
//             file_size: file.size,
//           })
//           .select()
//           .single();

//         /*
//          * Se il database fallisce,
//          * eliminiamo il file dallo Storage.
//          */

//         if (databaseError) {
//           console.error("ERRORE DATABASE:", databaseError);

//           await supabase.storage.from("study-documents").remove([filePath]);

//           throw new Error(`Errore Database: ${databaseError.message}`);
//         }

//         console.log("DOCUMENTO CREATO:", documentData);

//         /*
//          * ======================================================
//          * 3. PROCESSAMENTO PDF
//          * ======================================================
//          */

//         if (file.type === "application/pdf") {
//           console.log("Avvio processamento PDF...");

//           const { data: processingData, error: processingError } =
//             await supabase.functions.invoke("process-document", {
//               body: {
//                 document_id: documentData.id,

//                 file_path: filePath,
//               },
//             });

//           /*
//            * Errore chiamata Edge Function
//            */

//           if (processingError) {
//             console.error("ERRORE PROCESSAMENTO:", processingError);

//             throw new Error(
//               `Errore durante l'elaborazione del documento: ${processingError.message}`,
//             );
//           }

//           /*
//            * Errore restituito dalla funzione
//            */

//           if (!processingData?.success) {
//             throw new Error(
//               processingData?.error ||
//                 "Errore durante il conteggio delle pagine.",
//             );
//           }

//           console.log("PDF PROCESSATO:", processingData);
//         }

//         uploadedCount++;
//       }

//       /*
//        * ======================================================
//        * SUCCESSO
//        * ======================================================
//        */

//       setUploadProgress(100);

//       setSuccessMessage(
//         `${uploadedCount} ${
//           uploadedCount === 1 ? "documento caricato" : "documenti caricati"
//         } con successo.`,
//       );

//       setSelectedFiles([]);
//       setUploadFileName("");

//       /*
//        * Aggiorniamo la lista
//        */

//       await fetchDocuments(false);
//     } catch (error) {
//       console.error("ERRORE DURANTE UPLOAD:", error);

//       setErrorMessage(
//         error.message ||
//           "Si è verificato un errore durante il caricamento del documento.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   /*
//    * ============================================================
//    * APRE MODALE ELIMINAZIONE
//    * ============================================================
//    */

//   function handleDeleteDocument(document) {
//     setSuccessMessage("");
//     setErrorMessage("");

//     setDeleteModal({
//       open: true,
//       document,
//     });
//   }

//   /*
//    * ============================================================
//    * ANNULLA ELIMINAZIONE
//    * ============================================================
//    */

//   function cancelDeleteDocument() {
//     setDeleteModal({
//       open: false,
//       document: null,
//     });
//   }

//   /*
//    * ============================================================
//    * CONFERMA ELIMINAZIONE
//    * ============================================================
//    */

//   async function confirmDeleteDocument() {
//     const document = deleteModal.document;

//     if (!document) {
//       return;
//     }

//     /*
//      * Chiudiamo subito la modale
//      */

//     setDeleteModal({
//       open: false,
//       document: null,
//     });

//     setDeletingDocumentId(document.id);

//     setSuccessMessage("");
//     setErrorMessage("");

//     try {
//       /*
//        * Recuperiamo sessione
//        */

//       const {
//         data: { session },
//         error: sessionError,
//       } = await supabase.auth.getSession();

//       if (sessionError) {
//         throw sessionError;
//       }

//       const user = session?.user;

//       if (!user) {
//         throw new Error("Devi essere autenticato.");
//       }

//       /*
//        * Controllo sicurezza aggiuntivo
//        */

//       if (document.user_id !== user.id) {
//         throw new Error("Non puoi eliminare questo documento.");
//       }

//       /*
//        * ======================================================
//        * 1. ELIMINA DA STORAGE
//        * ======================================================
//        */

//       const { error: storageError } = await supabase.storage
//         .from("study-documents")
//         .remove([document.file_path]);

//       if (storageError) {
//         throw new Error(
//           `Errore durante l'eliminazione del file: ${storageError.message}`,
//         );
//       }

//       /*
//        * ======================================================
//        * 2. ELIMINA DAL DATABASE
//        * ======================================================
//        */

//       const { error: databaseError } = await supabase
//         .from("study_documents")
//         .delete()
//         .eq("id", document.id)
//         .eq("user_id", user.id);

//       if (databaseError) {
//         throw new Error(
//           `Errore durante l'eliminazione del documento: ${databaseError.message}`,
//         );
//       }

//       /*
//        * ======================================================
//        * 3. AGGIORNA LISTA
//        * ======================================================
//        */

//       setDocuments((currentDocuments) =>
//         currentDocuments.filter((item) => item.id !== document.id),
//       );

//       setSuccessMessage(
//         `"${document.file_name}" è stato eliminato con successo.`,
//       );
//     } catch (error) {
//       console.error("ERRORE DURANTE ELIMINAZIONE:", error);

//       setErrorMessage(
//         error.message ||
//           "Si è verificato un errore durante l'eliminazione del documento.",
//       );
//     } finally {
//       setDeletingDocumentId(null);
//     }
//   }

//   /*
//    * ============================================================
//    * FORMATTA DIMENSIONE
//    * ============================================================
//    */

//   function formatFileSize(bytes) {
//     if (!bytes) {
//       return "0 MB";
//     }

//     if (bytes < 1024 * 1024) {
//       return `${(bytes / 1024).toFixed(1)} KB`;
//     }

//     return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
//   }

//   /*
//    * ============================================================
//    * RENDER
//    * ============================================================
//    */

//   return (
//     <div className="study-ai-page">
//       {/* ======================================================
//           HEADER
//           ====================================================== */}

//       <div className="study-ai-header">
//         <h1>Study AI</h1>

//         <p>
//           Carica il materiale del tuo esame e preparati allo studio con l'AI.
//         </p>
//       </div>

//       {/* ======================================================
//           UPLOAD CARD
//           ====================================================== */}

//       <div className="upload-card">
//         <div className="upload-icon">📄</div>

//         <h2>Carica i tuoi documenti</h2>

//         <p className="upload-description">
//           Puoi caricare PDF, documenti Word o file di testo.
//         </p>

//         <label className="file-input-label">
//           <span>Seleziona documenti</span>

//           <input
//             type="file"
//             multiple
//             accept=".pdf,.doc,.docx,.txt"
//             onChange={handleFileChange}
//           />
//         </label>

//         {/* ====================================================
//             FILE SELEZIONATI
//             ==================================================== */}

//         {selectedFiles.length > 0 && (
//           <div className="selected-files text-black">
//             <h3>Documenti selezionati</h3>

//             {selectedFiles.map((file, index) => (
//               <div className="selected-file" key={`${file.name}-${index}`}>
//                 <span>📄</span>

//                 <div className="file-info">
//                   <strong>{file.name}</strong>

//                   <small>{formatFileSize(file.size)}</small>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* ====================================================
//             BARRA DI CARICAMENTO
//             ==================================================== */}

//         {loading && (
//           <div className="upload-progress">
//             <div className="upload-progress-header">
//               <span>Caricamento...</span>

//               <strong>{uploadProgress}%</strong>
//             </div>

//             <div className="progress-bar">
//               <div
//                 className="progress-bar-fill"
//                 style={{
//                   width: `${uploadProgress}%`,
//                 }}
//               />
//             </div>

//             {uploadFileName && <small>{uploadFileName}</small>}
//           </div>
//         )}

//         {/* ====================================================
//             BOTTONE UPLOAD
//             ==================================================== */}

//         <button
//           className="upload-button"
//           onClick={handleUpload}
//           disabled={loading || selectedFiles.length === 0}
//         >
//           {loading ? "Caricamento..." : "Carica documenti"}
//         </button>
//       </div>

//       {/* ======================================================
//           DOCUMENTI
//           ====================================================== */}

//       <div className="documents-card">
//         <div className="documents-header">
//           <h2>I tuoi documenti</h2>

//           <span>
//             {documents.length}{" "}
//             {documents.length === 1 ? "documento" : "documenti"}
//           </span>
//         </div>

//         {loadingDocuments ? (
//           <div className="documents-loading">
//             <img src={spinner} alt="Caricamento" />

//             <span>Caricamento documenti...</span>
//           </div>
//         ) : documents.length === 0 ? (
//           <div className="empty-documents">
//             <span className="empty-documents-icon">📂</span>

//             <p>Non hai ancora caricato nessun documento.</p>
//           </div>
//         ) : (
//           <div className="documents-list">
//             {documents.map((document) => (
//               <div className="document-item" key={document.id}>
//                 <div className="document-icon">📄</div>

//                 <div className="document-info">
//                   <strong>{document.file_name}</strong>

//                   <small>
//                     {document.page_count !== null &&
//                       document.page_count !== undefined && (
//                         <>
//                           {document.page_count}{" "}
//                           {document.page_count === 1 ? "pagina" : "pagine"}
//                           {" · "}
//                         </>
//                       )}

//                     {formatFileSize(document.file_size)}

//                     {document.created_at && (
//                       <>
//                         {" · "}

//                         {new Date(document.created_at).toLocaleDateString(
//                           "it-IT",
//                         )}
//                       </>
//                     )}
//                   </small>
//                 </div>

//                 <button
//                   type="button"
//                   className="delete-document-button"
//                   onClick={() => handleDeleteDocument(document)}
//                   disabled={deletingDocumentId === document.id}
//                   title="Elimina documento"
//                 >
//                   {deletingDocumentId === document.id ? (
//                     <img src={spinner} alt="Eliminazione" />
//                   ) : (
//                     "🗑️"
//                   )}
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* ======================================================
//           SUCCESS
//           ====================================================== */}

//       {successMessage && (
//         <div className="upload-banner success-banner">
//           <span>✓</span>

//           <span>{successMessage}</span>
//         </div>
//       )}

//       {/* ======================================================
//           ERROR
//           ====================================================== */}

//       {errorMessage && (
//         <div className="upload-banner error-banner">
//           <span>!</span>

//           <span>{errorMessage}</span>
//         </div>
//       )}

//       {/* ======================================================
//           MODALE ELIMINAZIONE
//           ====================================================== */}

//       {deleteModal.open && deleteModal.document && (
//         <AppModal
//           type="danger"
//           title="Eliminare il documento?"
//           message={`Sei sicuro di voler eliminare "${deleteModal.document.file_name}"? Questa operazione non può essere annullata.`}
//           confirmText="Elimina"
//           cancelText="Annulla"
//           showCancel={true}
//           onConfirm={confirmDeleteDocument}
//           onCancel={cancelDeleteDocument}
//         />
//       )}
//     </div>
//   );
// }

// export default StudyAI;
