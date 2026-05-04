export const Theme = {
  colors: {
    primary: '#FF6B35', // Vibrant Orange
    primaryLight: '#FF8E62',
    primaryDark: '#E55A26',
    background: '#FFF9F5', // Cream background
    card: '#FFFFFF', // White cards
    text: '#2D3142', // Dark Charcoal for main text
    textLight: '#9095A7', // Muted text
    border: '#F0F0F0',
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FFC107',
    info: '#2196F3',
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    s: 8,
    m: 12,
    l: 16,
    xl: 24,
    round: 9999,
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  typography: {
    h1: { fontSize: 32, fontWeight: 'bold', color: '#2D3142' },
    h2: { fontSize: 24, fontWeight: 'bold', color: '#2D3142' },
    h3: { fontSize: 20, fontWeight: '600', color: '#2D3142' },
    body: { fontSize: 16, color: '#2D3142' },
    caption: { fontSize: 14, color: '#9095A7' },
    button: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  }
};
