CREATE TABLE IF NOT EXISTS canvas_ops (
    id SERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    op_index INT NOT NULL,
    op_data JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_canvas_ops_session_idx ON canvas_ops (session_id, op_index);
