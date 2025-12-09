/**
 * KpiCard component for displaying a single KPI metric
 * Supports Sky Harbor airport color scheme: orange, royal blue, white
 */
function KpiCard({ title, value, variant = 'white' }) {
  // Sky Harbor airport colors
  const colors = {
    orange: {
      background: '#FF6600', // Sky Harbor orange
      text: '#FFFFFF',
      title: '#FFFFFF',
      border: '#FF8533',
    },
    blue: {
      background: '#003366', // Royal blue
      text: '#FFFFFF',
      title: '#FFFFFF',
      border: '#004C99',
    },
    white: {
      background: '#FFFFFF',
      text: '#003366', // Royal blue text
      title: '#666666',
      border: '#FF6600', // Orange border
    },
  };

  const colorScheme = colors[variant] || colors.white;

  return (
    <div
      style={{
        backgroundColor: colorScheme.background,
        borderRadius: '10px',
        padding: '16px',
        height: '100%',
        minHeight: '90px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        border: `2px solid ${colorScheme.border}`,
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      }}
    >
      <div
        style={{
          fontSize: '12px',
          color: colorScheme.title,
          marginBottom: '4px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: '28px',
          color: colorScheme.text,
          fontWeight: 'bold',
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default KpiCard;

