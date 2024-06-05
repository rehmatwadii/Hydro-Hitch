import React from 'react';

export default function HeroSection() {
  return (
    <div style={{
      position: 'relative',
      background: 'linear-gradient(to right, #1e3c72, #2a5298)',
      color: 'white',
      textAlign: 'center',
      padding: '4rem 1rem'
    }}>
      <div style={{
        position: 'absolute',
        inset: '0 0 auto 0',
        bottom: 0,
        width: '100%',
        overflow: 'hidden'
      }}>
        <svg
          viewBox="0 0 224 12"
          fill="currentColor"
          style={{ width: '100%', marginBottom: '-1rem' }}
          preserveAspectRatio="none"
        >
          <path d="M0,0 C48.8902582,6.27314026 86.2235915,9.40971039 112,9.40971039 C137.776408,9.40971039 175.109742,6.27314026 224,0 L224,12.0441132 L0,12.0441132 L0,0 Z" />
        </svg>
      </div>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '4rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <h1 style={{
          marginBottom: '1.5rem',
          fontSize: '2.5rem',
          fontWeight: 'bold',
          lineHeight: '1.2'
        }}>
          Welcome to Hydro-Hitch
        </h1>
        <p style={{
          marginBottom: '1.5rem',
          fontSize: '1rem',
          lineHeight: '1.5'
        }}>
          Hassle free H2O delivery
        </p>
        <p style={{
          marginBottom: '1.5rem',
          fontSize: '1rem',
          lineHeight: '1.5'
        }}>
          Explore our high-quality hydration solutions tailored just for you.
        </p>
        <form style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          maxWidth: '500px',
          marginBottom: '1rem',
          position: 'relative' // Needed for absolute positioning of the droplets
        }}>
          <input
            placeholder="Email"
            required
            type="text"
            style={{
              flexGrow: 1,
              height: '3rem',
              padding: '0.5rem',
              border: '2px solid transparent',
              borderRadius: '0.375rem 0 0 0.375rem',
              transition: 'border 0.2s ease',
              zIndex: 1,
              color: 'black' // Set text color to black for better visibility
            }}
            onFocus={(e) => e.target.style.borderColor = '#3c91e6'}
            onBlur={(e) => e.target.style.borderColor = 'transparent'}
          />
          <button
            type="submit"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '3rem',
              padding: '0 1.5rem',
              fontWeight: '600',
              textAlign: 'center',
              color: 'white',
              backgroundColor: '#3c91e6',
              borderRadius: '0 0.375rem 0.375rem 0',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
              zIndex: 0
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#3478c7'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#3c91e6'}
            onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(52, 120, 199, 0.5)'}
            onBlur={(e) => e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'}
          >
            Subscribe
          </button>
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '1rem',
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {Array.from({ length: 10 }).map((_, index) => (
              <svg key={index} width="20" height="30" viewBox="0 0 64 64" style={{
                animation: `drip 1.5s infinite ${index * 0.3}s`,
                overflow: 'visible'
              }}>
                <path fill="#3c91e6" stroke="black" strokeWidth="2" d="M32 0C15.4 0 2 14.6 2 30c0 15.2 13.4 32 30 32s30-16.8 30-32C62 14.6 48.6 0 32 0z" />
              </svg>
            ))}
          </div>
        </form>
      </div>
      <style>
        {`
          @keyframes drip {
            0% {
              transform: translateY(0);
              opacity: 1;
            }
            50% {
              transform: translateY(25px);
              opacity: 1;
            }
            100% {
              transform: translateY(50px);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
}
