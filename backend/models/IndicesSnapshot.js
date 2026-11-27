const mongoose = require('mongoose');

// Single-document store for the last successful index quotes, so the
// dashboard can show last traded values when Fyers is unavailable.
const IndicesSnapshotModel = new mongoose.Schema({
    indices: {
        type: Array
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('IndicesSnapshot', IndicesSnapshotModel);
