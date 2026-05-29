// import { Box, Button, Grid, Stack, TextField, Typography } from '@mui/material';
// import React, { useEffect } from 'react';
// import { styled } from '@mui/material/styles';
// import Paper from '@mui/material/Paper';
// import { useState } from 'react';
// import AddIcon from '@mui/icons-material/Add';
// import axios from 'axios';
// // import DataService from '../../services/DataService';
// import DeleteIcon from '@mui/icons-material/Delete';
// import InsertChartIcon from '@mui/icons-material/InsertChart';
// import BuySellModal from '../modals/BuySellModal';
// import { useNavigate } from 'react-router-dom';
// import Loading from '../loading/Loading';

// let BASE_URL = "http://localhost:5001/api";

// const Item = styled(Paper)(({ theme }) => ({
//     backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
//     ...theme.typography.body2,
//     padding: '1rem 0.2rem',
//     textAlign: 'left',
//     color: theme.palette.text.secondary,
//     boxShadow: 'none',
//     borderBottom: '1px solid #B0A8B9',
//     borderRadius: '0px   '
// }));

// function Watchlist() {

//     const [inputStock, setInputStock] = useState('');
//     const [stocks, setStocks] = useState([]);
//     const [userWatchlist, setUserWatchlist] = useState([]);
//     const [hoverIndex, setHoverIndex] = useState(false);
//     const [userId, setUserId] = useState('');
//     const [open, setOpen] = useState(false);
//     const [stock, setStock] = useState({});
//     const [orderType, setOrderType] = useState('');
//     const [loadingId, setLoadingId] = useState('');

//     const navigate = useNavigate();

//     const handleSearchStock = async () => {
// console.log(inputStock)
//         try {
//             const response = await axios.get(`http://localhost:5001/api/scrip/search?scriptName=${inputStock}`);
//             console.log(response)
//             if (response.status === 200) {
//                 setStocks(response.data.data);
//             }
//         } catch (err) {
//             console.log(err);
//             alert("Internal server error");
//         }
//     }

//     const handleAddStockToWatchlist = async (stock) => {
//         console.log("stock")
         
//         const data = {
//             userId: userId,
//             scriptId: stock._id
//         }
//         try {
//             setLoadingId(stock._id);
//             const response = await axios.post(`${BASE_URL}/watchlist/add`, data);
//             if (response.status === 200) {
//                 getUserWatchlist();
//                 setInputStock('');
//                 setLoadingId('');
//                 setStocks([]);
//                 alert('Added to watchlist');
//             }
//         } catch (err) {
//             console.log(err);
//             setLoadingId('');
//             alert(err.response.data.message);
//         }
//     }

//     const handleRemoveStockToWatchlist = async (watchlistStockId) => {
//         try {
//             const response = await axios.delete(`${process.env.REACT_APP_BASE_URL}/watchlist/remove?watchlistScripId=${watchlistStockId}`);
//             if (response.status === 200) {
//                 getUserWatchlist();
//                 alert('Removed')
//             }
//         } catch (err) {
//             console.log(err);
//             alert('Something went wrong');
//         }
//     }

//     const getUserWatchlist = async () => {
        
//         try {
//             const response = await axios.get(`${BASE_URL}/watchlist/get?userId=${userId}`);
//             if (response.status === 200) {
//                 setUserWatchlist(response.data.data);
//             }
//         } catch (err) {
//             console.log(err);
//             alert("Internal server error");
//         }
//     }

//     const handleBuySellStock = (stock, type) => {
//         console.log(type);
//         setOpen(true);
//         setOrderType(type)
//         setStock(stock);
//     };

//     const handleShowChart = (stock) => {
//         navigate(`/chart?symbol=${stock.scriptId.originalName}`);
//     }

//     useEffect(() => {
//         setUserId(JSON.parse(localStorage.getItem('cmUser'))?.userid);
//         if (userId) getUserWatchlist();
//     }, [userId]);

//     useEffect(() => {

//         if (userId) {

//             const ws = new WebSocket('ws://localhost:5001');

//             const DataService = {
//                 "ws": (userId) => {
//                     ws.onopen = () => {
//                         console.log("Connected to websocket!!", userId);
//                         ws.send(JSON.stringify({
//                             userId: userId
//                         }));
//                     }
//                     ws.onclose = () => {
//                         console.log("Connection closed!!");
//                     }
//                     return ws;
//                 }
//             }

//             DataService.ws(userId).onmessage = (ev) => {
//                 let watchlistData = JSON.parse(ev.data);
//                 // console.log(watchlistData.scrips);
//                 if (watchlistData.scrips.length > 0) setUserWatchlist(watchlistData.scrips);
//             }
//         }

//     }, [userId]);

//     return (
//         <Box sx={{ width: '100%', height: '600px' }}>
//             <BuySellModal
//                 open={open}
//                 setOpen={setOpen}
//                 orderType={orderType}
//                 stock={stock} />
//             <Box>
//                 <Stack direction="row" spacing={1} >
//                     <TextField
//                         sx={{
//                             width: '80%'
//                         }}
//                         value={inputStock}
//                         onChange={(e) => setInputStock(e.target.value.toUpperCase())}
//                         color="secondary"
//                         id="outlined-basic"
//                         label="Search stock"
//                         variant="outlined" />
//                     <Button onClick={handleSearchStock} sx={{
//                         color: '#fff',
//                         background: '#D43725',
//                         fontSize: '0.9rem!important',
//                         padding: '0.5rem 2rem',
//                         '&:hover': {
//                             background: '#D43725',
//                             opacity: 0.8
//                         }
//                     }} >Search</Button>
//                 </Stack>
//             </Box>
//             <Box sx={{
//                 overflowY: 'auto',
//                 height: '530px',
//                 margin: '1rem 0rem'
//             }} >
//                 {
//                     inputStock && stocks.length > 0 ?
//                         <Stack>
//                             {
//                                 stocks ?
//                                     stocks.map((stock) => {
//                                         return (
//                                             <Item key={stock._id} >
//                                                 <Stack direction="row" alignItems="center" justifyContent="space-between" >
//                                                     <Typography sx={{ color: '#000' }} >{stock.symbol}</Typography>
//                                                     {
//                                                         loadingId === stock._id ?
//                                                         <Loading /> :
//                                                         <AddIcon
//                                                         onClick={() => handleAddStockToWatchlist(stock)}
//                                                         sx={{
//                                                             '&:hover': {
//                                                                 cursor: 'pointer'
//                                                             }
//                                                         }} /> 
//                                                     }
//                                                 </Stack>
//                                             </Item>
//                                         )
//                                     }) : <Typography>No Stocks found.</Typography>
//                             }
//                         </Stack>
//                         : <Stack>
//                             {
//                                 userWatchlist.length > 0 ?
//                                     userWatchlist.map((stock) => {
//                                         return (
//                                             <Item
//                                                 key={stock._id} >
//                                                 <Grid container spacing={2}
//                                                     onMouseOver={() => setHoverIndex(stock._id)}
//                                                     onMouseLeave={() => setHoverIndex(-1)} >
//                                                     <Grid item xs={8}>
//                                                         <Typography>{stock.scriptId.symbol}</Typography>
//                                                     </Grid>
//                                                     <Grid item xs={4}>
//                                                         {
//                                                             hoverIndex === stock._id ?
//                                                                 <Stack
//                                                                     direction="row"
//                                                                     alignItems="center"
//                                                                     spacing={2}
//                                                                 >
//                                                                     <Stack
//                                                                         justifyContent="center"
//                                                                         alignItems="center"
//                                                                         sx={{
//                                                                             background: "#1976d2",
//                                                                             width: '22px',
//                                                                             height: '22px',
//                                                                             color: '#fff',
//                                                                             borderRadius: '2px',
//                                                                             cursor: 'pointer',
//                                                                             boxShadow: '0px 0px 3px 2px #bddfc3'
//                                                                         }} >
//                                                                         <Typography
//                                                                             onClick={() => handleBuySellStock(stock, 'Buy')}
//                                                                             sx={{
//                                                                                 fontSize: '0.9rem'
//                                                                             }} >B</Typography>
//                                                                     </Stack>
//                                                                     <Stack justifyContent="center"
//                                                                         alignItems="center"
//                                                                         sx={{
//                                                                             background: "#d43725",
//                                                                             width: '22px',
//                                                                             height: '22px',
//                                                                             color: '#fff',
//                                                                             borderRadius: '2px',
//                                                                             cursor: 'pointer',
//                                                                             boxShadow: '0px 0px 3px 2px #bddfc3'
//                                                                         }} >
//                                                                         <Typography
//                                                                             onClick={() => handleBuySellStock(stock, 'Sell')}
//                                                                             sx={{
//                                                                                 fontSize: '0.9rem'
//                                                                             }} >S</Typography>
//                                                                     </Stack>
//                                                                     <Stack sx={{
//                                                                         background: "#fff",
//                                                                         cursor: 'pointer',
//                                                                         boxShadow: '0px 0px 3px 2px #bddfc3'
//                                                                     }} >
//                                                                         <DeleteIcon onClick={() => handleRemoveStockToWatchlist(stock._id)} />
//                                                                     </Stack>
//                                                                     <Stack sx={{
//                                                                         background: "#fff",
//                                                                         cursor: 'pointer',
//                                                                         boxShadow: '0px 0px 3px 2px #bddfc3'
//                                                                     }} >
//                                                                         <InsertChartIcon onClick={() => handleShowChart(stock)} />
//                                                                     </Stack>
//                                                                 </Stack> :
//                                                                 <Stack
//                                                                     direction="row"
//                                                                     alignItems="center"
//                                                                     justifyContent="space-between"
//                                                                     spacing={2}
//                                                                 >
//                                                                     <Typography sx={{
//                                                                         color: parseFloat(stock.scriptId.percentageChange) > 0 ? '#0ee07b' : '#f64d41'
//                                                                     }} >{stock.scriptId.percentageChange ? stock.scriptId.percentageChange : 0}%</Typography>
//                                                                     <Typography>{stock.scriptId.lastPrice ? stock.scriptId.lastPrice : 0}</Typography>
//                                                                 </Stack>
//                                                         }
//                                                     </Grid>
//                                                 </Grid>
//                                             </Item>
//                                         )
//                                     }) :
//                                     <Typography>No stocks in watchlist.</Typography>
//                             }
//                         </Stack>
//                 }
//             </Box>
//         </Box>
//     )
// }

// export default Watchlist;


import { Box, Button, Grid, Stack, TextField, Typography } from '@mui/material';
import React, { useEffect, useRef } from 'react';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import BuySellModal from '../modals/BuySellModal';
import { useNavigate } from 'react-router-dom';
import Loading from '../loading/Loading';

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5001/api";

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: '1rem 0.2rem',
    textAlign: 'left',
    color: theme.palette.text.secondary,
    boxShadow: 'none',
    borderBottom: '1px solid #B0A8B9',
    borderRadius: '0px'
}));

function Watchlist() {

    const [inputStock, setInputStock] = useState('');
    const [stocks, setStocks] = useState([]);
    const [userWatchlist, setUserWatchlist] = useState([]);
    const [hoverIndex, setHoverIndex] = useState(false);
    const [userId, setUserId] = useState('');
    const [open, setOpen] = useState(false);
    const [stock, setStock] = useState({});
    const [orderType, setOrderType] = useState('');
    const [loadingId, setLoadingId] = useState('');
    const [isSearchMode, setIsSearchMode] = useState(false); // FIX 1: separate search mode from inputStock

    const wsRef = useRef(null); // FIX 2: keep WS reference to avoid duplicate connections
    const navigate = useNavigate();

    // FIX 3: accept id as param so it works on first mount before state updates
    const getUserWatchlist = async (id) => {
        const resolvedId = id || userId;
        if (!resolvedId) return;
        try {
            const response = await axios.get(`${BASE_URL}/watchlist/get?userId=${resolvedId}`);
            if (response.status === 200) {
                setUserWatchlist(response.data.data);
            }
        } catch (err) {
            console.log(err);
            alert("Internal server error");
        }
    }

    const handleSearchStock = async () => {
        if (!inputStock.trim()) return;
        try {
            const response = await axios.get(`${BASE_URL}/scrip/search?scriptName=${inputStock}`);
            if (response.status === 200) {
                setStocks(response.data.data);
                setIsSearchMode(true); // FIX 4: set search mode AFTER data arrives
            }
        } catch (err) {
            console.log(err);
            alert("Internal server error");
        }
    }

    const handleAddStockToWatchlist = async (stock) => {
        const data = { userId, scriptId: stock._id };
        try {
            setLoadingId(stock._id);
            const response = await axios.post(`${BASE_URL}/watchlist/add`, data);
            if (response.status === 200) {
                getUserWatchlist();
                setInputStock('');
                setStocks([]);
                setIsSearchMode(false); // FIX 5: exit search mode after adding
                setLoadingId('');
                alert('Added to watchlist');
            }
        } catch (err) {
            console.log(err);
            setLoadingId('');
            alert(err.response.data.message);
        }
    }

    const handleRemoveStockToWatchlist = async (watchlistStockId) => {
        try {
            // FIX 6: use unified BASE_URL (was using process.env directly before)
            const response = await axios.delete(`${BASE_URL}/watchlist/remove?watchlistScripId=${watchlistStockId}`);
            if (response.status === 200) {
                getUserWatchlist();
                alert('Removed');
            }
        } catch (err) {
            console.log(err);
            alert('Something went wrong');
        }
    }

    const handleBuySellStock = (stock, type) => {
        setOpen(true);
        setOrderType(type);
        setStock(stock);
    };

    const handleShowChart = (stock) => {
        navigate(`/chart?symbol=${stock.scriptId.originalName}`);
    }

    // FIX 7: run once on mount — read userId directly from localStorage, don't wait for state
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('cmUser'));
        const id = user?.userid;
        if (!id) return;
        setUserId(id);
        getUserWatchlist(id); // pass id directly — state not yet updated at this point
    }, []);

    // FIX 8: WebSocket — only connect once, clean up on unmount
    useEffect(() => {
        if (!userId) return;

        // avoid creating a second WS if already connected
        if (wsRef.current) return;

        const ws = new WebSocket('ws://localhost:5001');
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("Connected to websocket!!", userId);
            ws.send(JSON.stringify({ userId }));
        };

        ws.onmessage = (ev) => {
            const watchlistData = JSON.parse(ev.data);
            if (watchlistData.scrips.length > 0) {
                setUserWatchlist(watchlistData.scrips);
            }
        };

        ws.onclose = () => {
            console.log("Connection closed!!");
            wsRef.current = null;
        };

        ws.onerror = (err) => {
            console.log("WebSocket error:", err);
        };

        // FIX 9: close WS when component unmounts to avoid memory leaks
        return () => {
            ws.close();
            wsRef.current = null;
        };
    }, [userId]);

    // FIX 10: clear search mode when user clears the input field
    const handleInputChange = (e) => {
        const val = e.target.value.toUpperCase();
        setInputStock(val);
        if (!val) {
            setIsSearchMode(false);
            setStocks([]);
        }
    };
useEffect(() => {
    const user = JSON.parse(localStorage.getItem('cmUser'));
    console.log('cmUser from localStorage:', user);
    console.log('userid value:', user?.userid);
}, []);
    return (
        <Box sx={{ width: '100%', height: '600px', background: '#ece9ff', paddingTop: 1 }}>
            <BuySellModal
                open={open}
                setOpen={setOpen}
                orderType={orderType}
                stock={stock} />
            <Box>
                <Stack direction="row" spacing={1} padding={2}>
                    <TextField
                        sx={{ width: '70%'}}
                        value={inputStock}
                        onChange={handleInputChange}  // FIX 10
                        color="secondary"
                        id="outlined-required"
                        label="Search stock"
                        variant="outlined" />
                    <Button onClick={handleSearchStock} sx={{
                        color: '#fff',
                        background: '#D43725',
                        fontSize: '0.9rem!important',
                        padding: '0.5rem 2rem',
                        '&:hover': { background: '#D43725', opacity: 0.8 },
                    }}>Search</Button>
                </Stack>
            </Box>
            <Box sx={{ overflowY: 'auto', height: '530px', margin: '1rem 0rem' }}>
                {
                    // FIX 1: use isSearchMode instead of inputStock to control which view shows
                    isSearchMode && stocks.length > 0 ?
                        <Stack>
                            {
                                stocks.map((stock) => (
                                    <Item key={stock._id}>
                                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                                            <Typography sx={{ color: '#000' }}>{stock.symbol}</Typography>
                                            {
                                                loadingId === stock._id ?
                                                    <Loading /> :
                                                    <AddIcon
                                                        onClick={() => handleAddStockToWatchlist(stock)}
                                                        sx={{ '&:hover': { cursor: 'pointer' } }} />
                                            }
                                        </Stack>
                                    </Item>
                                ))
                            }
                        </Stack>
                        : <Stack>
                            {
                                userWatchlist.length > 0 ?
                                    userWatchlist.map((stock) => (
                                        <Item key={stock._id}>
                                            <Grid container spacing={2}
                                                onMouseOver={() => setHoverIndex(stock._id)}
                                                onMouseLeave={() => setHoverIndex(-1)}>
                                                <Grid item xs={8}>
                                                    <Typography>{stock.scriptId.symbol}</Typography>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    {
                                                        hoverIndex === stock._id ?
                                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                                <Stack justifyContent="center" alignItems="center" sx={{
                                                                    background: "#1976d2", width: '22px', height: '22px',
                                                                    color: '#fff', borderRadius: '2px', cursor: 'pointer',
                                                                    boxShadow: '0px 0px 3px 2px #bddfc3'
                                                                }}>
                                                                    <Typography onClick={() => handleBuySellStock(stock, 'Buy')} sx={{ fontSize: '0.9rem' }}>B</Typography>
                                                                </Stack>
                                                                <Stack justifyContent="center" alignItems="center" sx={{
                                                                    background: "#d43725", width: '22px', height: '22px',
                                                                    color: '#fff', borderRadius: '2px', cursor: 'pointer',
                                                                    boxShadow: '0px 0px 3px 2px #bddfc3'
                                                                }}>
                                                                    <Typography onClick={() => handleBuySellStock(stock, 'Sell')} sx={{ fontSize: '0.9rem' }}>S</Typography>
                                                                </Stack>
                                                                <Stack sx={{ background: "#fff", cursor: 'pointer', boxShadow: '0px 0px 3px 2px #bddfc3' }}>
                                                                    <DeleteIcon onClick={() => handleRemoveStockToWatchlist(stock._id)} />
                                                                </Stack>
                                                                <Stack sx={{ background: "#fff", cursor: 'pointer', boxShadow: '0px 0px 3px 2px #bddfc3' }}>
                                                                    <InsertChartIcon onClick={() => handleShowChart(stock)} />
                                                                </Stack>
                                                            </Stack>
                                                            :
                                                            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                                                                <Typography sx={{
                                                                    color: parseFloat(stock.scriptId.percentageChange) > 0 ? '#0ee07b' : '#f64d41'
                                                                }}>
                                                                    {stock.scriptId.percentageChange ? stock.scriptId.percentageChange : 0}%
                                                                </Typography>
                                                                <Typography>{stock.scriptId.lastPrice ? stock.scriptId.lastPrice : 0}</Typography>
                                                            </Stack>
                                                    }
                                                </Grid>
                                            </Grid>
                                        </Item>
                                    ))
                                    : <Typography>No stocks in watchlist.</Typography>
                            }
                        </Stack>
                }
            </Box>
        </Box>
    );
}

export default Watchlist;