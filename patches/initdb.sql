CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'employee', 'client')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    position TEXT CHECK (position IN ('courier', 'office')),
 --   office_id INTEGER REFERENCES offices(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE offices (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT,
  --  manager_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE shipments (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    receiver_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    sender_office_id INTEGER REFERENCES offices(id) ON DELETE SET NULL,
    receiver_office_id INTEGER REFERENCES offices(id) ON DELETE SET NULL,
    delivery_address TEXT,
    weight DECIMAL(10,2) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    shipment_type TEXT NOT NULL CHECK (shipment_type IN ('office', 'address')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_transit', 'delivered', 'canceled')) DEFAULT 'pending',
    created_by INTEGER REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE employees ADD COLUMN office_id INTEGER;

ALTER TABLE employees ADD CONSTRAINT fk_employee_office_id FOREIGN KEY (office_id) REFERENCES offices(id);

ALTER TABLE offices ADD COLUMN manager_id INTEGER;

ALTER TABLE offices ADD CONSTRAINT fk_offices_manager_id FOREIGN KEY (manager_id) REFERENCES employees(id);
