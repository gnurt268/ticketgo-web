import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import store from '@/app/store';
import theme from '@/styles/theme';
import router from '@/routes';
import { getCurrentUser } from '@/features/auth';
import { STORAGE_KEYS } from '@/utils/constants';

// Đồng bộ user/role từ server (/api/auth/me) khi app khởi động,
// để routing không phụ thuộc vào snapshot role cũ trong localStorage.
function AuthBootstrap() {
  const dispatch = useDispatch();
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)) {
      dispatch(getCurrentUser());
    }
  }, [dispatch]);
  return null;
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthBootstrap />
        <RouterProvider router={router} />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
