import Swal from "sweetalert2";
import "./Alert.css";

const Alert = {
  // Success Alert — green button, centered
  success: (message) => {
    Swal.fire({
      icon: "success",
      title: "Success!",
      text: message,
      showConfirmButton: true,
      confirmButtonText: "OK",
      confirmButtonColor: "#16a34a",
      timer: 3000,
      timerProgressBar: true,
      customClass: {
        popup: "swal-custom-popup",
        title: "swal-custom-title",
        confirmButton: "swal-custom-confirm",
        timerProgressBar: "swal-progress-success",
      },
    });
  },

  // Error Alert — red button, centered
  error: (message) => {
    Swal.fire({
      icon: "error",
      title: "Error!",
      text: message,
      showConfirmButton: true,
      confirmButtonText: "OK",
      confirmButtonColor: "#dc2626",
      customClass: {
        popup: "swal-custom-popup",
        title: "swal-custom-title",
        confirmButton: "swal-custom-confirm",
      },
    });
  },

  // Warning Alert — amber button, centered
  warning: (message) => {
    Swal.fire({
      icon: "warning",
      title: "Warning!",
      text: message,
      showConfirmButton: true,
      confirmButtonText: "OK",
      confirmButtonColor: "#d97706",
      customClass: {
        popup: "swal-custom-popup",
        title: "swal-custom-title",
        confirmButton: "swal-custom-confirm",
      },
    });
  },

  // Info Alert — blue button, centered
  info: (message) => {
    Swal.fire({
      icon: "info",
      title: "Info",
      text: message,
      showConfirmButton: true,
      confirmButtonText: "OK",
      confirmButtonColor: "#2563eb",
      customClass: {
        popup: "swal-custom-popup",
        title: "swal-custom-title",
        confirmButton: "swal-custom-confirm",
      },
    });
  },

  // Confirmation Dialog — professional centered modal
  confirm: (message, confirmButtonText = "Yes", cancelButtonText = "Cancel") => {
    return Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: message,
      showCancelButton: true,
      confirmButtonText: confirmButtonText,
      cancelButtonText: cancelButtonText,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        popup: "swal-custom-popup",
        title: "swal-custom-title",
        confirmButton: "swal-custom-confirm",
        cancelButton: "swal-custom-cancel",
      },
    });
  },
};

export default Alert;