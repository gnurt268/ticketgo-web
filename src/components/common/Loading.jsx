import { Box, CircularProgress, Typography } from '@mui/material';

const Loading = ({ message = 'Đang tải...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <Box className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
        <Box className="text-center">
          <CircularProgress size={48} />
          {message && (
            <Typography variant="body2" color="text.secondary" className="mt-4">
              {message}
            </Typography>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box className="flex flex-col items-center justify-center py-8">
      <CircularProgress size={40} />
      {message && (
        <Typography variant="body2" color="text.secondary" className="mt-4">
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default Loading;
