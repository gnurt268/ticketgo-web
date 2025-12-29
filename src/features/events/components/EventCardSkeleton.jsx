import { Card, CardContent, Skeleton, Box } from '@mui/material';

const EventCardSkeleton = ({ variant = 'default' }) => {
  if (variant === 'horizontal') {
    return (
      <Card sx={{ display: 'flex', height: 140 }}>
        <Skeleton variant="rectangular" width={180} height="100%" />
        <CardContent sx={{ flex: 1, py: 2 }}>
          <Skeleton variant="text" width="80%" height={24} />
          <Skeleton variant="text" width="60%" height={20} sx={{ mt: 1 }} />
          <Skeleton variant="text" width="50%" height={20} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <Skeleton 
        variant="rectangular" 
        sx={{ paddingTop: '60%' }} 
        animation="wave"
      />
      <CardContent sx={{ p: 2.5 }}>
        <Skeleton variant="text" width="90%" height={28} />
        <Skeleton variant="text" width="70%" height={28} sx={{ mb: 1.5 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Skeleton variant="circular" width={18} height={18} />
          <Skeleton variant="text" width="60%" height={20} />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Skeleton variant="circular" width={18} height={18} />
          <Skeleton variant="text" width="50%" height={20} />
        </Box>
        
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
          <Skeleton variant="text" width="40%" height={24} sx={{ ml: 'auto' }} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default EventCardSkeleton;