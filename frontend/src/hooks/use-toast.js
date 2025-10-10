// Simple toast implementation using browser alerts
export function toast({ title, description, variant = "default" }) {
  const message = description ? `${title}: ${description}` : title;
  
  switch (variant) {
    case "destructive":
    case "error":
      alert(`Error: ${message}`);
      break;
    case "success":
      alert(`Success: ${message}`);
      break;
    case "warning":
      alert(`Warning: ${message}`);
      break;
    default:
      alert(message);
  }
}

export function useToast() {
  return {
    toast,
    toasts: []
  };
}
