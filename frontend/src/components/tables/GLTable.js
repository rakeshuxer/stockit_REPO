import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import axios from 'axios';
import Loading from '../loading/Loading';

// NSE returns turnover either as a number (in lakhs) or as a string with a
// unit suffix, e.g. "638.83 Cr" or "45.20 L". Normalise everything to lakhs.
function toLakhs(value) {
    if (typeof value === 'number') return value.toFixed(2);
    if (typeof value !== 'string') return '-';

    const match = value.trim().match(/^([\d,.]+)\s*(cr|l)?/i);
    if (!match) return value;

    const num = parseFloat(match[1].replace(/,/g, ''));
    if (isNaN(num)) return value;

    const unit = (match[2] || 'l').toLowerCase();
    return (unit === 'cr' ? num * 100 : num).toFixed(2);
}

const VISIBLE_ROWS = 5;

function createData(
    symbol,
    open,
    high,
    low,
    prevPrice,
    ltp,
    perChange,
    volume,
    value
) {

    value = toLakhs(value);

    return {
        symbol,
        open,
        high,
        low,
        prevPrice,
        ltp,
        perChange,
        volume,
        value
    };
}

export default function GLTable({ type, refreshGL, setRefreshGL }) {

    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef(null);
    const [maxHeight, setMaxHeight] = useState(undefined);

    // Size the container to the header + first 5 rows; the rest scroll.
    useLayoutEffect(() => {
        const measure = () => {
            const el = containerRef.current;
            if (!el) return;
            const head = el.querySelector('thead');
            const rows = el.querySelectorAll('tbody tr');
            if (!head || rows.length <= VISIBLE_ROWS) {
                setMaxHeight(undefined);
                return;
            }
            let h = head.getBoundingClientRect().height;
            for (let i = 0; i < VISIBLE_ROWS; i++) h += rows[i].getBoundingClientRect().height;
            setMaxHeight(Math.ceil(h));
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, [tableData, loading]);

    const getGL = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/analysis/gl`);
            if (response.status === 200) {
                const glResponseData = response.data;
                let glData;
                if ( glResponseData.gainers && type === 'gainers')
                    glData = glResponseData.gainers[0]['NIFTY'].data;
                if( glResponseData.losers && type === 'losers' )
                    glData = glResponseData.losers[0]['NIFTY'].data;

                glData = glData?.map((scrip) => {
                    return createData(
                        scrip.symbol,
                        scrip.open_price,
                        scrip.high_price,
                        scrip.low_price,
                        scrip.prev_price,
                        scrip.ltp,
                        scrip.perChange,
                        scrip.trade_quantity,
                        scrip.turnover)
                });
                setTableData(glData);
                setLoading(false);
            }
        } catch (err) {
            console.log(err);
            setLoading(false);
            alert('Something went wrong');
        }
    }

    const refreshGainerLosers = async () => {
        try {
            const response = await axios.put(`${process.env.REACT_APP_BASE_URL}/analysis/gl/save`);
            if(response.status === 200) {
                getGL();
                setRefreshGL(false);
            }
        } catch (err) {
            console.log(err);
            setRefreshGL(false);
            alert("Something went wrong");
        }
    }

    useEffect(() => {
        getGL();
    }, [type]);

    useEffect(() => {
        if (refreshGL) {
            refreshGainerLosers();
        }
    }, [refreshGL]);

    return (
        <TableContainer component={Paper} ref={containerRef} sx={{ maxHeight, overflowY: 'auto' }}>
            <Table stickyHeader sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>SYMBOL</TableCell>
                        <TableCell align="right">OPEN</TableCell>
                        <TableCell align="right">HIGH</TableCell>
                        <TableCell align="right">LOW</TableCell>
                        <TableCell align="right">PREV. CLOSE</TableCell>
                        <TableCell align="right">LTP</TableCell>
                        <TableCell align="right" >%CHNG</TableCell>
                        <TableCell align="right">{`VOLUME (shares)`}</TableCell>
                        <TableCell align="right">{`VALUE (₹ Lakhs) `}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        loading ?
                        <TableRow>
                            <TableCell>
                                <Loading />
                            </TableCell>
                        </TableRow>
                        : tableData && tableData.length > 0 ?
                            tableData.map((scrip) => (
                                <TableRow
                                    key={scrip.symbol}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell scope="row">{scrip.symbol}</TableCell>
                                    <TableCell scope="row">{scrip.open}</TableCell>
                                    <TableCell align="right">{scrip.high}</TableCell>
                                    <TableCell align="right">{scrip.low}</TableCell>
                                    <TableCell align="right">{scrip.prevPrice}</TableCell>
                                    <TableCell align="right">{scrip.ltp}</TableCell>
                                    <TableCell align="right" sx={{
                                        color: type === 'gainers' ? '#23d160' : '#ff0000'
                                    }} >{scrip.perChange}{"%"}</TableCell>
                                    <TableCell align="right">{scrip.volume}</TableCell>
                                    <TableCell align="right">{scrip.value}</TableCell>
                                </TableRow>
                            )) :
                            <TableRow
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell scope="row">No data found.</TableCell>
                            </TableRow>
                    }
                </TableBody>
            </Table>
        </TableContainer>
    );
}