import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { Button, Stack, Typography } from '@mui/material';
import Chip from '@mui/material/Chip';
import CircleIcon from '@mui/icons-material/Circle';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import axios from 'axios';
import GLTable from '../../components/tables/GLTable';
import RefreshIcon from '@mui/icons-material/Refresh';
import Loading from '../../components/loading/Loading';
import IndicesCarousel from '../../components/indices/IndicesCarousel';
import MarketHolidays from '../../components/holidays/MarketHolidays';

export default function Dashboard() {

  const [marketStatus, setMarketStatus] = useState([]);
  const [type, setType] = useState('gainers');
  const [refreshGL, setRefreshGL] = useState(false);
  const [marketHolidays, setMarketHolidays] = useState({});
  const [refreshMS, setRefreshMS] = useState(false);
 
  const getMarketStatus = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/analysis/market-status`);
      if (response.status === 200) {
        // console.log(response.data.marketStatus.marketState);
        setMarketStatus(response.data?.marketStatus?.marketState);
      }
    } catch (err) {
      console.log(err);
      // alert("Something went wrong");
    }
  }

  const refreshMarketStatus = async () => {
    try {
      setRefreshMS(true);
      const response = await axios.put(`${process.env.REACT_APP_BASE_URL}/analysis/market-status/save`);
      if (response.status === 200) {
        getMarketStatus();
        setRefreshMS(false);
      }
    } catch (err) {
      console.log(err);
      setRefreshMS(false);
      alert("Something went wrong");
    }
  }

  const getMarketHolidays = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/market-holidays/get`);
      
      if (response.status === 200) {
        setMarketHolidays(response.data?.tradingHolidays);
      }
    } catch (err) {
      console.log(err);
      // alert("Something went wrong");
    }
  }

  const handleRefreshMarketStatus = async () => {
    refreshMarketStatus();
  }

  const handleRefreshGainerLosers = async () => {
    setRefreshGL(true);
  }

  useEffect(() => {
    getMarketStatus();
    getMarketHolidays();

  }, []);

  return (
    <Box sx={{ flexGrow: 1, padding: 2, background: '#ece9ff'  }}>
      <Stack>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            width: '100%'
          }} >
          <Typography sx={{
            fontSize: '1.5rem',
            mb: 2
          }} >Market Status</Typography>
          {
            refreshMS ?
            <Loading /> : 
            <RefreshIcon sx={{
              cursor: 'pointer',
              marginBottom: '1rem!important'
            }} onClick={handleRefreshMarketStatus} />
          }
        </Stack>
        <Stack
          direction="row"
          alignItems="center"
          spacing={2} >
          {
            marketStatus && marketStatus?.length > 0 ?
            marketStatus.filter((market) => market?.market).map((market) => {
              const isOpen = (market?.marketStatus ?? '').toLowerCase() === 'open';
              return <Chip
                sx={{
                  p: 1
                }}
                key={market.market}
                icon={isOpen ? <CircleIcon /> : <HorizontalRuleIcon />}
                color={isOpen ? "success" : "info"}
                label={market.market.toUpperCase()}
                variant="outlined" />
            }) : <Typography>No data found.</Typography>
          }
        </Stack>
      </Stack>
      <Box sx={{ mt: 3 }}>
        <IndicesCarousel />
      </Box>
      <Stack>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            width: '100%',
            mt: 3
          }} >
          <Typography sx={{
            fontSize: '1.5rem',
            mb: 2
          }} >Top Gainers and losers</Typography>
          {
            refreshGL ?
            <Loading /> :
            <RefreshIcon sx={{
              cursor: 'pointer',
              marginBottom: '1rem!important'
            }} onClick={handleRefreshGainerLosers} />
          }
        </Stack>
        <Stack
          direction="row"
          spacing={2} >
          <Button
            variant="contained"
            onClick={() => setType('gainers')}
            sx={{
              background: "#4caf50",
              color: '#fff',
              '&:hover': {
                background: "transparent",
                color: '#4caf50',
                border: '1px solid #4caf50',
                boxShadow: 'none'
              }
            }} >Gainers</Button>
          <Button
            variant="contained"
            onClick={() => setType('losers')}
            sx={{
              background: "#d43725",
              color: '#fff',
              '&:hover': {
                background: "transparent",
                color: '#d43725',
                border: '1px solid #d43725',
                boxShadow: 'none'
              }
            }} >Losers</Button>
        </Stack>
        <Stack sx={{ mt: 2 }} >
          <GLTable
            type={type}
            refreshGL={refreshGL}
            setRefreshGL={setRefreshGL} />
        </Stack>
      </Stack>
      <Stack>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            width: '100%',
            mt: 5
          }} >
          <Typography sx={{
            fontSize: '1.5rem',
            mb: 2
          }} >Market Holidays</Typography>
        </Stack>
        <MarketHolidays holidays={marketHolidays?.CM} />
      </Stack>
    </Box>
  );
}
