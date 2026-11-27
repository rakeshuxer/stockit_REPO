import React, { useMemo, useState } from 'react';
import moment from 'moment';
import { Box, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const DATE_FORMAT = 'DD-MMM-YYYY'; // NSE format, e.g. 25-Dec-2026
const UPCOMING_COUNT = 4;
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const BRAND = '#396dff';
const HOLIDAY_BG = '#2e7d4f';
const HOLIDAY_SOFT = '#e3f3e9';

function MiniCalendar({ holidaysByDate, month, setMonth }) {
    const today = moment().startOf('day');

    // 6-week grid starting on the Sunday on/before the 1st of the month.
    const days = useMemo(() => {
        const start = month.clone().startOf('month').startOf('week');
        return Array.from({ length: 42 }, (_, i) => start.clone().add(i, 'day'));
    }, [month]);

    return (
        <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Typography sx={{ fontSize: '1.05rem', fontWeight: 500 }}>
                    {month.format('MMMM YYYY')}
                </Typography>
                <Stack direction="row">
                    <IconButton size="small" aria-label="Previous month" onClick={() => setMonth(month.clone().subtract(1, 'month'))}>
                        <ChevronLeftIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" aria-label="Next month" onClick={() => setMonth(month.clone().add(1, 'month'))}>
                        <ChevronRightIcon fontSize="small" />
                    </IconButton>
                </Stack>
            </Stack>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 0.5, textAlign: 'center' }}>
                {WEEKDAYS.map((d, i) => (
                    <Typography key={i} sx={{ fontSize: '0.75rem', color: '#70757a', fontWeight: 500, pb: 0.5 }}>
                        {d}
                    </Typography>
                ))}

                {days.map((day) => {
                    const key = day.format(DATE_FORMAT);
                    const holiday = holidaysByDate.get(key);
                    const inMonth = day.month() === month.month();
                    const isToday = day.isSame(today, 'day');
                    const isWeekend = day.day() === 0 || day.day() === 6;

                    let sx = { color: inMonth ? (isWeekend ? '#9aa0a6' : '#3c4043') : '#c4c7c5' };
                    if (holiday) sx = { background: inMonth ? HOLIDAY_BG : HOLIDAY_SOFT, color: inMonth ? '#fff' : HOLIDAY_BG, fontWeight: 600 };
                    if (isToday) sx = { background: BRAND, color: '#fff', fontWeight: 600 };

                    const cell = (
                        <Box
                            sx={{
                                width: 30,
                                height: 30,
                                mx: 'auto',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.8rem',
                                cursor: holiday ? 'default' : 'inherit',
                                ...sx,
                            }}
                        >
                            {day.date()}
                        </Box>
                    );

                    return holiday ? (
                        <Tooltip key={key} title={holiday.description} arrow placement="top">
                            {cell}
                        </Tooltip>
                    ) : (
                        <Box key={key}>{cell}</Box>
                    );
                })}
            </Box>

            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Legend color={HOLIDAY_BG} label="Market holiday" />
                <Legend color={BRAND} label="Today" />
            </Stack>
        </Box>
    );
}

function Legend({ color, label }) {
    return (
        <Stack direction="row" alignItems="center" spacing={0.75}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
            <Typography sx={{ fontSize: '0.75rem', color: '#70757a' }}>{label}</Typography>
        </Stack>
    );
}

function HolidayRow({ holiday, isNext, onClick }) {
    const date = holiday.date;
    const days = date.diff(moment().startOf('day'), 'days');
    const remaining = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `in ${days} days`;

    return (
        <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            onClick={onClick}
            sx={{
                p: 1.5,
                borderRadius: 2,
                cursor: 'pointer',
                border: '1px solid',
                borderColor: isNext ? '#b9dcc6' : '#eceff1',
                background: isNext ? '#f3faf6' : '#fff',
                transition: 'background 150ms ease',
                '&:hover': { background: isNext ? '#eaf6ef' : '#f8f9fa' },
            }}
        >
            <Stack
                alignItems="center"
                justifyContent="center"
                sx={{ width: 56, minWidth: 56, height: 56, borderRadius: 2, background: HOLIDAY_BG, color: '#fff' }}
            >
                <Typography sx={{ fontSize: '0.7rem', textTransform: 'uppercase', lineHeight: 1.2, opacity: 0.9 }}>
                    {date.format('MMM')}
                </Typography>
                <Typography sx={{ fontSize: '1.35rem', fontWeight: 600, lineHeight: 1.1 }}>
                    {date.format('D')}
                </Typography>
            </Stack>

            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={holiday.description}>
                    {holiday.description}
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', color: '#70757a' }}>
                    {date.format('dddd, D MMMM YYYY')}
                </Typography>
            </Box>

            <Typography
                sx={{
                    fontSize: '0.8rem',
                    px: 1.25,
                    py: 0.5,
                    borderRadius: 5,
                    whiteSpace: 'nowrap',
                    background: isNext ? HOLIDAY_SOFT : '#f1f3f4',
                    color: isNext ? HOLIDAY_BG : '#5f6368',
                    fontWeight: isNext ? 600 : 400,
                }}
            >
                {remaining}
            </Typography>
        </Stack>
    );
}

export default function MarketHolidays({ holidays }) {
    const [month, setMonth] = useState(() => moment().startOf('month'));

    const parsed = useMemo(
        () => (holidays || [])
            .map((h) => ({ ...h, date: moment(h.tradingDate, DATE_FORMAT, true) }))
            .filter((h) => h.date.isValid())
            .sort((a, b) => a.date - b.date),
        [holidays]
    );

    const holidaysByDate = useMemo(
        () => new Map(parsed.map((h) => [h.date.format(DATE_FORMAT), h])),
        [parsed]
    );

    const upcoming = useMemo(() => {
        const today = moment().startOf('day');
        return parsed.filter((h) => !h.date.isBefore(today)).slice(0, UPCOMING_COUNT);
    }, [parsed]);

    return (
        <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, md: 3 } }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 3, md: 4 }}>
                <Box sx={{ width: { xs: '100%', md: 300 }, flexShrink: 0 }}>
                    <MiniCalendar holidaysByDate={holidaysByDate} month={month} setMonth={setMonth} />
                </Box>

                <Box sx={{ width: '1px', background: '#eceff1', display: { xs: 'none', md: 'block' } }} />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: '1.05rem', fontWeight: 500, mb: 1.5 }}>
                        Upcoming holidays
                    </Typography>
                    {upcoming.length > 0 ? (
                        <Stack spacing={1.25}>
                            {upcoming.map((h, i) => (
                                <HolidayRow
                                    key={h.tradingDate}
                                    holiday={h}
                                    isNext={i === 0}
                                    onClick={() => setMonth(h.date.clone().startOf('month'))}
                                />
                            ))}
                        </Stack>
                    ) : (
                        <Typography sx={{ color: '#70757a' }}>
                            No upcoming market holidays in the current list.
                        </Typography>
                    )}
                </Box>
            </Stack>
        </Paper>
    );
}
