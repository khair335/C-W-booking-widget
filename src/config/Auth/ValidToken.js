export const isTokenValid = () => {
  const token = localStorage.getItem('token');
  const expiry = localStorage.getItem('token_expiry');

  if (!token || !expiry) return false;

  const now = new Date();
  const expiryDate = new Date(expiry);

  if (now >= expiryDate) {
    localStorage.removeItem('token');
    localStorage.removeItem('token_expiry');
    return false;
  }

  return true;
};
