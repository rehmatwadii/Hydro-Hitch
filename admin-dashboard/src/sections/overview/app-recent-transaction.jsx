import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import TableContainer from '@mui/material/TableContainer';

// ----------------------------------------------------------------------
function createData(name, date, amount, status) {
  return { name, date, amount, status };
}

const rows = [
  createData('Frozen yoghurt', 159, 6.0, 'Paid'),
  createData('Ice cream sandwich', 237, 9.0, 'Pending'),
  createData('Eclair', 262, 16.0, 'Paid'),
  createData('Cupcake', 305, 3.7, 'Pending'),
  createData('Gingerbread', 356, 16.0, 'Pending'),
];

// ----------------------------------------------------------------------

export default function AppRecentTransaction({ title, subheader, chart, sold, revenue, ...other }) {
  const theme = useTheme();

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 5 }} />

      <Box sx={{ mx: 3 }}>
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead >
              <TableRow >
                <TableCell sx={{borderColor:"themeColor.lightGrey", bgcolor:'transparent',}} align="left">Name</TableCell>
                <TableCell sx={{borderColor:"themeColor.lightGrey", bgcolor:'transparent',textAlign:'center'}} align="right">Date</TableCell>
                <TableCell sx={{borderColor:"themeColor.lightGrey", bgcolor:'transparent',textAlign:'center'}} align="right">Ammount</TableCell>
                <TableCell sx={{borderColor:"themeColor.lightGrey", bgcolor:'transparent',textAlign:'center'}} align="right">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.name} sx={{ '&:last-child td, &:last-child th': { border: 0 }, }}>
                  <TableCell  align="left">{row.name}</TableCell>
                  <TableCell sx={{textAlign:'center'}} align="right">{row.date}</TableCell>
                  <TableCell sx={{textAlign:'center'}} align="right">{row.amount}</TableCell>
                  <TableCell align="right" sx={{textAlign:'start'}}>
                    <Typography
                      variant="p"
                      sx={{
                        color:row.status==='Paid'?'themeColor.green' :'themeColor.blue',
                        bgcolor: row.status==='Paid'?'themeColor.lightGreen' :'themeColor.lightBlue',
                        py: .7,
                        px: 2,
                        textAlign: 'center',
                        borderRadius:0.5,
                      }}
                    >
                      {row.status}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Card>
  );
}

AppRecentTransaction.propTypes = {
  chart: PropTypes.object,
  subheader: PropTypes.string,
  title: PropTypes.string,
  sold: PropTypes.string,
  revenue: PropTypes.string,
};
