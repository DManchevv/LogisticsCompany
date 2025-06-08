CREATE USER client WITH password 'parola123';
CREATE USER staff WITH password 'parola456';

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE staff (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    position TEXT CHECK (position IN ('courier', 'office')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE offices (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE shipments (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES users(id),
  receiver_id INTEGER REFERENCES users(id),
  recipient_first_name TEXT,  -- optional, for pending when receiver_id is null
  recipient_last_name TEXT,   -- optional, for pending
  delivery_address TEXT NOT NULL,
  weight NUMERIC(10,2) NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT receiver_id_required_if_not_pending CHECK (
    (status = 'pending' AND receiver_id IS NULL)
    OR
    (status <> 'pending' AND receiver_id IS NOT NULL)
  )
);

ALTER TABLE staff ADD COLUMN office_id INTEGER;

ALTER TABLE staff ADD CONSTRAINT fk_staff_office_id FOREIGN KEY (office_id) REFERENCES offices(id);

ALTER TABLE offices ADD COLUMN manager_id INTEGER;

ALTER TABLE offices ADD CONSTRAINT fk_offices_manager_id FOREIGN KEY (manager_id) REFERENCES staff(id);

-- Create function for password hashing
CREATE OR REPLACE FUNCTION hash_user_password()
RETURNS TRIGGER AS $$
BEGIN
	    -- First hash with SHA-256
    NEW.password = encode(digest(NEW.password, 'sha256'), 'hex');
    
    -- Then hash with bcrypt (work factor 14)
    NEW.password = crypt(NEW.password, gen_salt('bf', 14));
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for password hashing
CREATE TRIGGER hash_password_trigger
BEFORE INSERT OR UPDATE OF password ON users
FOR EACH ROW
	EXECUTE FUNCTION hash_user_password();

	-- Create password verification function
CREATE OR REPLACE FUNCTION check_user_password(
	    username_input TEXT,
	    password_input TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    stored_hash TEXT;
BEGIN
	    -- Get stored password hash
    SELECT password INTO stored_hash 
    FROM users 
    WHERE username = username_input;
    
    IF NOT FOUND THEN
	        RETURN FALSE;
		    END IF;
		    
		    -- First hash input with SHA-256
    password_input = encode(digest(password_input, 'sha256'), 'hex');
    
    -- Compare with bcrypt
    RETURN stored_hash = crypt(password_input, stored_hash);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.check_user_password(username_input text, password_input text)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    stored_hash TEXT;
BEGIN
    -- Get stored password hash
    SELECT password INTO stored_hash
    FROM users
    WHERE username = username_input;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- First hash input with SHA-256
    password_input = encode(digest(password_input, 'sha256'), 'hex');

    -- Compare with bcrypt
    RETURN stored_hash = crypt(password_input, stored_hash);
END;
$function$

GRANT SELECT,UPDATE,INSERT ON users TO client;

GRANT USAGE on users_id_seq TO client;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE "session" (
  "sid" TEXT NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" TIMESTAMP WITH TIME ZONE NOT NULL
);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid");

CREATE INDEX "IDX_session_expire" ON "session" ("expire");

GRANT INSERT, UPDATE, SELECT ON session TO client;

--CREATE TABLE pending_shipments (
--  id SERIAL PRIMARY KEY,
--  sender_id INTEGER NOT NULL REFERENCES users(id),
--  recipient_first_name TEXT NOT NULL,
--  recipient_last_name TEXT NOT NULL,
--  delivery_address TEXT NOT NULL,
--  weight NUMERIC(10,2) NOT NULL,
--  price NUMERIC(10,2) NOT NULL,
--  description TEXT,
--  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
--);

GRANT INSERT, UPDATE, SELECT ON pending_shipments TO client;

GRANT USAGE, SELECT ON pending_shipments_id_seq TO client;

-- 1. Roles table
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- 2. Permissions table
CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- 3. Staff_Roles join table
CREATE TABLE staff_roles (
  staff_id INTEGER NOT NULL,
  role_id INTEGER NOT NULL,
  PRIMARY KEY (staff_id, role_id),
  FOREIGN KEY (staff_id) REFERENCES staff(id),
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE INDEX idx_staff_roles_staff_id ON staff_roles(staff_id);
CREATE INDEX idx_staff_roles_role_id ON staff_roles(role_id);

-- 4. Roles_Permissions join table
CREATE TABLE roles_permissions (
  role_id INTEGER NOT NULL,
  permission_id INTEGER NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (permission_id) REFERENCES permissions(id)
);

CREATE INDEX idx_roles_permissions_role_id ON roles_permissions(role_id);
CREATE INDEX idx_roles_permissions_permission_id ON roles_permissions(permission_id);

ALTER TABLE users ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE staff ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE;

GRANT SELECT,UPDATE,INSERT ON staff TO staff;
GRANT USAGE,SELECT ON staff_id_seq TO staff;
GRANT SELECT,UPDATE,INSERT,DELETE ON staff_roles TO staff;
GRANT SELECT,UPDATE,INSERT,DELETE ON roles TO staff;
GRANT INSERT, UPDATE, DELETE, SELECT ON roles_permissions TO staff;
GRANT INSERT, UPDATE, DELETE, SELECT ON permissions TO staff;
INSERT INTO permissions (name) VALUES ('staff_roles_view');
INSERT INTO roles (name) VALUES ('staff-roles-access');
INSERT INTO offices (name,address) VALUES ('test', 'sofia');
INSERT INTO permissions (name) VALUES ('staff_roles_edit');
INSERT INTO permissions (name) VALUES ('staff_roles_delete');
INSERT INTO permissions (name) VALUES ('staff_roles_insert');
GRANT SELECT, USAGE ON roles_id_seq TO staff;
ALTER TABLE offices
ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE;
GRANT SELECT,UPDATE,DELETE,INSERT ON offices TO staff;
GRANT USAGE,SELECT ON offices_id_seq TO staff;
GRANT SELECT,UPDATE,INSERT,DELETE ON shipments TO staff;
GRANT USAGE,SELECT ON shipments_id_seq TO staff;
GRANT SELECT,INSERT,UPDATE ON users TO staff;
GRANT SELECT, INSERT ON shipments TO client;
GRANT USAGE, SELECT ON shipments_id_seq TO client;
