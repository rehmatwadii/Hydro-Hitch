import React, { useEffect, useState } from "react";
import { Stack, Container, Grid, Typography } from "@mui/material";
import SvgColor from "src/components/svg-color";
import AppWidgetSummary from "../app-widget-summary";

export default function AppView() {
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    // Fetch data from the API
    const fetchDashboardData = async () => {
      try {
        const loginData = localStorage.getItem('loginData') && JSON.parse(localStorage.getItem('loginData'));
        const venderId = loginData?.data?._id;
        const response = await fetch(`http://localhost:8000/api/vender/dashboard/${venderId}`); // Replace with your API endpoint
        const data = await response.json();
        setDashboardData(data.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  if (!dashboardData) {
    return (
      <Container maxWidth="xl">
        <Typography variant="h6" align="center" mt={5}>
          Loading Dashboard...
        </Typography>
      </Container>
    );
  }

  const { vendorCount, userCount, orderCount, totalSales } = dashboardData;

  return (
    <Container maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5} mt={4}>
        <Typography variant="h4">Dashboard</Typography>
      </Stack>

      <Grid container spacing={10} gap={2} justifyContent={'center'} mt={10}>
        <Grid xs={12} md={5}>
          <AppWidgetSummary
            title="Total Revenue"
            total={`${totalSales.toLocaleString()}`}
            color="success"
            percent="22.04%"
            up
            icon={<SvgColor alt="icon" src="/assets/icons/ic_dollar.svg" />}
          />
        </Grid>

        <Grid xs={12} md={5}>
          <AppWidgetSummary
            title="Orders"
            total={orderCount}
            color="info"
            percent="42.04%"
            up
            icon={<SvgColor alt="icon" src="/assets/icons/ic_cart.svg" />}
          />
        </Grid>

        <Grid xs={12} md={5}>
          <AppWidgetSummary
            title="Total Vendors"
            total={vendorCount}
            color="warning"
            percent="12.04%"
            icon={<SvgColor alt="icon" src="/assets/icons/navbar/ic_personal.svg" />}
          />
        </Grid>

        <Grid xs={12} md={5}>
          <AppWidgetSummary
            title="Total Users"
            total={userCount}
            color="error"
            percent="32.04%"
            icon={<SvgColor alt="icon" src="/assets/icons/navbar/ic_customer.svg" />}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
