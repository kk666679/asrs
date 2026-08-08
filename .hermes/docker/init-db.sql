CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE tasks (id SERIAL PRIMARY KEY, job_id TEXT, status TEXT, payload JSONB);
CREATE TABLE inventory_items (id SERIAL PRIMARY KEY, sku TEXT, location_coords JSONB);
INSERT INTO inventory_items (sku, location_coords) VALUES ('SKU-1234', '{"x":10,"y":20}');
