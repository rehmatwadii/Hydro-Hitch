import React, { useState, useEffect } from 'react';
import { Container, Stack, Typography, Button, TextField } from '@mui/material';
import { message } from 'antd';
import axios from 'axios';
import TextRichEditor from 'src/components/rich-text-editor/RichTextEditor';

export default function QualityReportView() {
  const [reportValue, setReportValue] = useState('');
  const [tds, setTds] = useState('');
  const [phLevel, setPhLevel] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchQualityReport = async () => {
    const loginData = JSON.parse(localStorage.getItem('loginData'));
    const vendorId = loginData?.data?._id;
    if (!vendorId) {
      message.error('Vendor ID not found!');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8000/api/vender/vendor/${vendorId}`);
      const v = res.data?.allVendors?.[0] || {};
      setReportValue(v.qualityReport || '');
      setTds(v.tds || '');
      setPhLevel(v.phLevel || '');
    } catch {
      message.error('Error fetching quality data');
    } finally {
      setLoading(false);
    }
  };

  const updateQualityReport = async () => {
    const loginData = JSON.parse(localStorage.getItem('loginData'));
    const vendorId = loginData?.data?._id;
    if (!vendorId) {
      message.error('Vendor ID not found!');
      return;
    }
    if (!reportValue.trim()) {
      message.error('Quality report cannot be empty');
      return;
    }
    setLoading(true);
    try {
      await axios.put(`http://localhost:8000/api/vender/vendors/${vendorId}/quality-report`, {
        qualityReport: reportValue,
      });
      message.success('Quality report updated successfully');
    } catch {
      message.error('Failed to update quality report');
    } finally {
      setLoading(false);
    }
  };

  const updateWaterQualityData = async () => {
    const loginData = JSON.parse(localStorage.getItem('loginData'));
    const vendorId = loginData?.data?._id;
    if (!vendorId) {
      message.error('Vendor ID not found!');
      return;
    }
    if (!tds || !phLevel) {
      message.error('Both TDS and pH Level are required');
      return;
    }
    setLoading(true);
    try {
      await axios.put(`http://localhost:8000/api/vender/vendors/${vendorId}/water-quality`, {
        tds,
        phLevel,
      });
      message.success('Water quality data updated successfully');
    } catch {
      message.error('Failed to update water quality data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQualityReport();
  }, []);

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Water Quality Report</Typography>
      </Stack>

      <Stack direction="row" spacing={3}>
        <TextField
          label="TDS (ppm)"
          fullWidth
          value={tds}
          onChange={(e) => setTds(e.target.value)}
        />
        <TextField
          label="pH Level"
          fullWidth
          value={phLevel}
          onChange={(e) => setPhLevel(e.target.value)}
        />
        <Button
          variant="contained"
          sx={{ whiteSpace: 'nowrap' }}
          onClick={updateWaterQualityData}
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Water Quality Data'}
        </Button>
      </Stack>

      <TextRichEditor
        value={reportValue}
        onChange={setReportValue}
        placeholder="Write your water quality report here"
      />

      <Stack direction="row" justifyContent="flex-end" mt={3}>
        <Button
          variant="contained"
          color="primary"
          onClick={updateQualityReport}
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Report'}
        </Button>
      </Stack>

      <Stack>
        <Typography variant="h4" sx={{ pt: 4 }}>
          View As
        </Typography>
        <p dangerouslySetInnerHTML={{ __html: reportValue }} />
      </Stack>
    </Container>
  );
}
