import Swal from "sweetalert2";

/** Estilos consistentes para SweetAlert2 — alineados con la identidad minimalista/premium */
export const swalCustomClass = {
  popup: "rounded-2xl border border-neutral-200 shadow-[0_20px_70px_rgba(15,23,42,0.12)] bg-white",
  title: "text-lg font-semibold text-neutral-900 tracking-tight",
  htmlContainer: "text-sm leading-6 text-neutral-600 font-medium",
  confirmButton:
    "px-5 py-2.5 bg-[#1a1a1a] text-white rounded-md text-sm font-semibold hover:bg-black transition-all shadow-sm mr-3",
  cancelButton:
    "px-5 py-2.5 bg-neutral-100 text-neutral-700 rounded-md text-sm font-semibold hover:bg-neutral-200 transition-all",
  denyButton:
    "px-5 py-2.5 border border-neutral-200 text-neutral-700 rounded-md text-sm font-semibold hover:bg-neutral-50 transition-all",
};

export const swalBackdrop = "rgba(0, 0, 0, 0.48)";

const themedSwal = Swal.mixin({
  buttonsStyling: false,
  customClass: swalCustomClass,
  backdrop: swalBackdrop,
});

export default themedSwal;
