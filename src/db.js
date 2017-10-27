
import dotenv from 'dotenv'

dotenv.load();

export default callback => {
    
	// connect to a  Postgresql/postgis database, then pass it to `callback`:

	callback();
}
