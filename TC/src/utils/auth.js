export function isLoggedIn() {
    // Podés cambiar a chequear un JWT si lo guardás como "token"
    return !!localStorage.getItem("usuario");
  }
  