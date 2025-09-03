import PropTypes from 'prop-types';

import { Box } from '@mui/material';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import TableContainer from '@mui/material/TableContainer';

// ----------------------------------------------------------------------
function createData(name, date, amount, ) {
  return { name, date, amount,  };
}

const rows = [
  createData('Frozen yoghurt', 159, 6.0,),
  createData('Ice cream sandwich', 237, 9.0),
  createData('Eclair', 262, 16.0,),
  createData('Cupcake', 305, 3.7),
  createData('Gingerbread', 356, 16.0),
];

// ----------------------------------------------------------------------

export default function AppTopProduct({ title, subheader, chart, sold, revenue, ...other }) {
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
                <TableCell sx={{borderColor:"themeColor.lightGrey", bgcolor:'transparent',textAlign:'center'}} align="right">Price</TableCell>
                <TableCell sx={{borderColor:"themeColor.lightGrey", bgcolor:'transparent',textAlign:'center'}} align="right">Unit Sold</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.name} sx={{ '&:last-child td, &:last-child th': { border: 0 }, }}>
                  <TableCell  align="left">{row.name}</TableCell>
                  <TableCell sx={{textAlign:'center'}} align="right">{row.date}</TableCell>
                  <TableCell sx={{textAlign:'center'}} align="right">{row.amount}</TableCell>
                 
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Card>
  );
}

AppTopProduct.propTypes = {
  chart: PropTypes.object,
  subheader: PropTypes.string,
  title: PropTypes.string,
  sold: PropTypes.string,
  revenue: PropTypes.string,
};
