import { Pool } from 'pg';

export const pg = new Pool({
    user: 'ls',
    password: 'ls',
    host: '0.0.0.0'
});
