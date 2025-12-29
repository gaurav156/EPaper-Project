function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 8,
          width: 360,
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
        }}
      >
        <h3>{title}</h3>
        <p>{message}</p>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onCancel}>Cancel</button>
          <button
            style={{ background: "#d32f2f", color: "#fff" }}
            onClick={onConfirm}
          >
            Force Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;