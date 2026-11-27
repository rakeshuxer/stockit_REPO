import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, IconButton, Paper, Skeleton, Stack, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import IndexChartDialog from './IndexChartDialog';

const VISIBLE = 4;
const GAP = 16; // px between cards
const REFRESH_MS = 60 * 1000;

const formatNumber = (n, digits = 2) =>
    typeof n === 'number'
        ? n.toLocaleString('en-IN', { minimumFractionDigits: digits, maximumFractionDigits: digits })
        : '-';

function IndexCard({ index, onClick }) {
    const up = (index?.change ?? 0) >= 0;
    const color = up ? '#23a15a' : '#d43725';

    return (
        <Paper
            variant="outlined"
            onClick={index ? () => onClick?.(index) : undefined}
            sx={{
                flex: `0 0 calc((100% - ${GAP * (VISIBLE - 1)}px) / ${VISIBLE})`,
                p: 2.5,
                borderRadius: 2,
                minWidth: 0,
                cursor: index ? 'pointer' : 'default',
                transition: 'box-shadow 150ms ease, border-color 150ms ease',
                '&:hover': index ? { borderColor: '#bbb', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' } : {},
            }}
        >
            <Typography
                title={index?.description}
                sx={{ fontSize: '1.1rem', fontWeight: 500, mb: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
                {index ? index.name : <Skeleton width="50%" />}
            </Typography>
            {index ? (
                <Stack direction="row" alignItems="baseline" spacing={1} flexWrap="wrap">
                    <Typography sx={{ fontSize: '1.15rem', fontWeight: 600 }}>
                        {formatNumber(index.lastPrice)}
                    </Typography>
                    <Typography sx={{ fontSize: '0.85rem', color }}>
                        {up ? '+' : ''}{formatNumber(index.change)} ({up ? '+' : ''}{formatNumber(index.percentChange)}%)
                    </Typography>
                </Stack>
            ) : (
                <Skeleton variant="rectangular" height={28} width="70%" />
            )}
        </Paper>
    );
}

export default function IndicesCarousel() {
    const [indices, setIndices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [start, setStart] = useState(0);
    const [selected, setSelected] = useState(null);

    const getIndices = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/analysis/indices`);
            if (response.status === 200) {
                setIndices(response.data?.indices || []);
            }
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getIndices();
        const timer = setInterval(getIndices, REFRESH_MS);
        return () => clearInterval(timer);
    }, []);

    const maxStart = Math.max(0, indices.length - VISIBLE);
    const canPrev = start > 0;
    const canNext = start < maxStart;

    const goPrev = () => setStart((s) => Math.max(0, s - VISIBLE));
    const goNext = () => setStart((s) => Math.min(maxStart, s + VISIBLE));

    const arrowSx = {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1,
        background: '#fff',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
        '&:hover': { background: '#f5f5f5' },
    };

    return (
        <Stack>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: '1.5rem' }}>Indices</Typography>
                {indices.length > 0 && (
                    <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                        {start + 1}–{Math.min(start + VISIBLE, indices.length)} of {indices.length}
                    </Typography>
                )}
            </Stack>

            {!loading && indices.length === 0 ? (
                <Typography>No data found.</Typography>
            ) : (
                <Box sx={{ position: 'relative', px: 2.5 }}>
                    {canPrev && (
                        <IconButton size="small" aria-label="Previous indices" onClick={goPrev} sx={{ ...arrowSx, left: 0 }}>
                            <ChevronLeftIcon />
                        </IconButton>
                    )}

                    <Box sx={{ overflow: 'hidden' }}>
                        <Box
                            sx={{
                                display: 'flex',
                                gap: `${GAP}px`,
                                transition: 'transform 300ms ease',
                                transform: `translateX(calc(-${start} * ((100% - ${GAP * (VISIBLE - 1)}px) / ${VISIBLE} + ${GAP}px)))`,
                            }}
                        >
                            {loading
                                ? Array.from({ length: VISIBLE }).map((_, i) => <IndexCard key={i} />)
                                : indices.map((index) => <IndexCard key={index.symbol} index={index} onClick={setSelected} />)}
                        </Box>
                    </Box>

                    {canNext && (
                        <IconButton size="small" aria-label="Next indices" onClick={goNext} sx={{ ...arrowSx, right: 0 }}>
                            <ChevronRightIcon />
                        </IconButton>
                    )}
                </Box>
            )}

            <IndexChartDialog
                open={Boolean(selected)}
                index={selected}
                onClose={() => setSelected(null)}
            />
        </Stack>
    );
}
