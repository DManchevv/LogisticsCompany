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
    sender_id INTEGER REFERENCES users(id),
    receiver_id INTEGER REFERENCES users(id),
    sender_office_id INTEGER REFERENCES offices(id),
    receiver_office_id INTEGER REFERENCES offices(id),
    delivery_address TEXT,
    weight DECIMAL(10,2) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    shipment_type TEXT NOT NULL CHECK (shipment_type IN ('office', 'address')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_transit', 'delivered', 'canceled')) DEFAULT 'pending',
    created_by INTEGER REFERENCES staff(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP WITH TIME ZONE
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
