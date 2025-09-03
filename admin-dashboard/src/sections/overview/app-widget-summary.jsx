import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function AppWidgetSummary({ title, total, percent, up, icon, color = 'primary', sx, ...other }) {
  return (
    <Card
      component={Stack}
      spacing={3}
      direction="row"
      sx={{
        px: 3,
        py: 3,
        borderRadius: 1,
        ...sx,
      }}
      justifyContent='space-between'
      {...other}
    >
      <Stack spacing={0.5}>
        <Typography variant="h4">{total}</Typography>

        <Typography sx={{ color: 'themeColor.grey', mt: 0, flexWrap: "nowrap" }} noWrap >{title}</Typography>
        <Box sx={{ display: 'flex' }}>
          {/* <Typography sx={{ color: up ? 'themeColor.green' : 'red', mt: 1, flexWrap: "nowrap" }} noWrap >{percent}
          </Typography> */}
          <Box component='span' sx={{ pl: 1, pt: 1.4 }}>
            {/* <Iconify sx={{color: up?'themeColor.green':'red',}} icon={up?'solar:alt-arrow-up-linear':'solar:alt-arrow-down-linear'}/> */}

          </Box>
        </Box>
      </Stack>
      {icon && (
        <Box
          sx={{
            width: 64,
            height: 64,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 32,
            bgcolor: 'themeColor.lightBlue',
            color: 'themeColor.blue',
          }}
        >
          {icon}
        </Box>
      )}
    </Card>
  );
}

AppWidgetSummary.propTypes = {
  color: PropTypes.string,
  icon: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  sx: PropTypes.object,
  title: PropTypes.string,
  percent: PropTypes.string,
  up: PropTypes.bool,
  total: PropTypes.number,
};
