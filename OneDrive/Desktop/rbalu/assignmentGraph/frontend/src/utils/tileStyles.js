// Common styles for KPI tiles
export const tilePaperStyle = {
  p: 3,
  height: '100%',
  background: 'rgba(22, 27, 34, 0.6)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: 2,
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: 'rgba(0, 212, 255, 0.3)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(0, 212, 255, 0.15)',
  },
};

export const tileTitleStyle = {
  mb: 2.5,
  fontWeight: 600,
  fontSize: '0.95rem',
  color: 'text.primary',
  letterSpacing: '-0.01em',
};

export const tileValueStyle = {
  fontWeight: 700,
  fontSize: '2rem',
  background: 'linear-gradient(135deg, #00d4ff 0%, #00e676 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  mb: 0.5,
};

export const loadingPaperStyle = {
  p: 3,
  height: '100%',
  background: 'rgba(22, 27, 34, 0.6)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: 2,
};

