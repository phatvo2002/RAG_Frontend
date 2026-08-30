import React from 'react';
import { ToastContainer as ReactToastifyContainer, toast, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useApp } from '@/context/AppContext';

export const ToastContainer: React.FC = () => {
  const { isDark } = useApp();

  return (
    <ReactToastifyContainer
      position="bottom-right"
      autoClose={3500}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={isDark ? 'dark' : 'light'}
      className="text-xs font-sans"
    />
  );
};

/**
 * Tiện ích hiển thị notification nhanh ở mọi nơi
 */
export const notify = {
  success: (message: string, options?: ToastOptions) => toast.success(message, options),
  error: (message: string, options?: ToastOptions) => toast.error(message, options),
  warning: (message: string, options?: ToastOptions) => toast.warning(message, options),
  info: (message: string, options?: ToastOptions) => toast.info(message, options),
  default: (message: string, options?: ToastOptions) => toast(message, options),
};

export { toast };
export default ToastContainer;
