import "@/infrastructure/css/products-emprend/form/CampoImagen.css"

export function CampoImagen({ imagePreview, error, onChange }) {
  return (
    <div className="form-group">
      <label>Imagen:</label>
      <div
        className={`upload-box ${error ? "input-error" : ""}`}
        onClick={() => document.getElementById("fileInput").click()}
      >
        {imagePreview ? "Cambiar imagen" : "Seleccionar imagen"}
      </div>
      <input id="fileInput" type="file" accept="image/*"
        onChange={onChange} style={{ display: "none" }} />
      {imagePreview && (
        <img src={imagePreview} alt="preview" className="image-preview" />
      )}
      {error && <span className="error">{error}</span>}
    </div>
  )
}