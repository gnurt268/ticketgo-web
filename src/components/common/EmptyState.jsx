import { Box, Typography, Button } from '@mui/material';
import { InboxOutlined } from '@mui/icons-material';

const EmptyState = ({
  icon: Icon = InboxOutlined,
  title = 'Không có dữ liệu',
  description = '',
  actionLabel = '',
  onAction = null,
}) => {
  return (
    <Box className="flex flex-col items-center justify-center py-16 px-4">
      <Icon className="text-gray-300 mb-4" sx={{ fontSize: 80 }} />
      <Typography variant="h6" className="text-gray-600 mb-2">
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" className="text-center mb-4">
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
