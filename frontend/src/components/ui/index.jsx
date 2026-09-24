import { useEffect, useRef, useState } from "react";
import { LoaderCircle, X } from "lucide-react";

export function Button({ variant = "primary", size = "md", loading, disabled, leftIcon, fullWidth, children, className = "", ...props }) {
  return <button className={`btn btn-${variant} btn-${size} ${fullWidth ? "w-full" : ""} ${className}`} disabled={disabled || loading} {...props}>{loading ? <LoaderCircle className="spin" size={17}/> : leftIcon}{children}</button>;
}
export function IconButton({ label, children, className = "", ...props }) { return <button className={`icon-btn ${className}`} aria-label={label} title={label} {...props}>{children}</button>; }
export function Input({ label, error, ...props }) { return <label className="field"><span>{label}</span><input className="input" {...props}/>{error && <small className="field-error">{error}</small>}</label>; }
export function Textarea({ label, ...props }) { return <label className="field"><span>{label}</span><textarea className="input textarea" {...props}/></label>; }
export function Avatar({ src, name = "", size = "md", className = "" }) { return <img className={`avatar avatar-${size} ${className}`} src={src || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "V")}&background=28243c&color=ddd`} alt={name || "User avatar"} loading="lazy" onError={(e) => { e.currentTarget.src = "https://ui-avatars.com/api/?name=V&background=28243c&color=ddd"; }}/>; }
export function Badge({ children, tone = "default" }) { return <span className={`badge badge-${tone}`}>{children}</span>; }
export function Skeleton({ className = "" }) { return <div className={`skeleton ${className}`} aria-hidden="true"/>; }
export function Spinner() { return <LoaderCircle className="spin" size={24}/>; }
export function EmptyState({ icon: Icon, title, description, action }) { return <div className="empty-state">{Icon && <span className="empty-icon"><Icon size={26}/></span>}<h3>{title}</h3><p>{description}</p>{action}</div>; }
export function Tabs({ tabs, value, onChange }) { return <div className="tabs" role="tablist">{tabs.map((tab) => <button key={tab} role="tab" aria-selected={value === tab} className={value === tab ? "tab active" : "tab"} onClick={() => onChange(tab)}>{tab}</button>)}</div>; }
export function Dropdown({ trigger, children, align = "right" }) {
  const [open, setOpen] = useState(false); const ref = useRef(null);
  useEffect(() => { const close = (e) => { if (e.key === "Escape" || (e.type === "pointerdown" && !ref.current?.contains(e.target))) setOpen(false); }; document.addEventListener("keydown", close); document.addEventListener("pointerdown", close); return () => { document.removeEventListener("keydown", close); document.removeEventListener("pointerdown", close); }; }, []);
  return <div className="dropdown-wrap" ref={ref}><span onClick={() => setOpen((v) => !v)}>{trigger}</span>{open && <div className={`dropdown-menu ${align}`} onClick={() => setOpen(false)}>{children}</div>}</div>;
}
export function Modal({ open, onClose, title, children }) {
  useEffect(() => { if (!open) return; const old = document.body.style.overflow; document.body.style.overflow = "hidden"; const key = (e) => e.key === "Escape" && onClose(); document.addEventListener("keydown", key); return () => { document.body.style.overflow = old; document.removeEventListener("keydown", key); }; }, [open, onClose]);
  if (!open) return null;
  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><section className="modal" role="dialog" aria-modal="true" aria-label={title}><header><h2>{title}</h2><IconButton label="Close dialog" onClick={onClose}><X size={18}/></IconButton></header>{children}</section></div>;
}
export function ConfirmDialog({ open, onClose, onConfirm, title = "Are you sure?", description = "This action cannot be undone.", loading = false }) { return <Modal open={open} onClose={onClose} title={title}><p className="muted">{description}</p><div className="modal-actions"><Button variant="outline" onClick={onClose}>Cancel</Button><Button variant="danger" loading={loading} onClick={onConfirm}>Delete</Button></div></Modal>; }
