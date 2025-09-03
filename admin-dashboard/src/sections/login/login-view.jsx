import { useState } from 'react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { useRouter } from 'src/routes/hooks';
import { bgGradient } from 'src/theme/css';
import Logo from 'src/components/logo';
import Input from 'src/components/forms/input/Input';

// ----------------------------------------------------------------------

export default function LoginView() {
  const theme = useTheme();
  const router = useRouter();
  const color = {
    grey: theme.palette.themeColor.grey,
    blue: theme.palette.themeColor.blue,
    lightGrey: theme.palette.themeColor.lightGrey,
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleChange = (e, setValue) => {
    setValue(e.target.value);
  };

  const handleClick = async () => {
    // Simple form validation
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/vender/login", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        // Store the token or data in localStorage
        localStorage.setItem('loginData', JSON.stringify(data));
        // Navigate to dashboard
        window.location.href = ('/dashboard');
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  const renderForm = (
    <>
      <Stack spacing={3}>
        <Input
          placeholder="Email address"
          onChange={(e) => handleChange(e, setEmail)}
          label="Email"
          type="text"
          value={email}
        />
        <Input
          placeholder="Create Password"
          onChange={(e) => handleChange(e, setPassword)}
          label="Password"
          type="password"
          value={password}
        />
      </Stack>

      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      <Stack>
        <Button
          sx={{ bgcolor: color.blue, my: 3, color: '#fff', borderRadius: '5px' }}
          onClick={handleClick}
        >
          Login
        </Button>
      </Stack>
    </>
  );

  return (
    <Box
      sx={{
        ...bgGradient({
          color: alpha(theme.palette.background.default, 0.9),
          imgUrl: '/assets/background/overlay_4.jpg',
        }),
        height: 1,
      }}
    >
      <Logo
        sx={{
          position: 'fixed',
          top: { xs: 16, md: 24 },
          left: { xs: 16, md: 24 },
        }}
      />

      <Stack alignItems="center" justifyContent="center" sx={{ height: 1 }}>
        <Card
          sx={{
            p: 5,
            width: 1,
            maxWidth: 420,
          }}
        >
          <Typography variant="h4" sx={{ textAlign: 'center' }}>
            Login
          </Typography>

          {renderForm}

          <Typography variant="body2" sx={{ textAlign: 'center', color: color.grey }}>
            By creating an account, you agree to our
          </Typography>
          <Typography sx={{ textAlign: 'center', color: color.blue }}>
            <Link variant="body2" underline="hover">
              Terms of Service
            </Link>
          </Typography>
          <Divider sx={{ mt: 2 }} />
        </Card>
      </Stack>
    </Box>
  );
}
