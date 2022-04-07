import { Pool } from 'pg';

import {pgHost, pgPort, pgUsername, pgPassword} from '../env'

export const pg = new Pool({
    user: pgUsername,
    password: pgPassword,
    host: pgHost,
    port: pgPort
});
