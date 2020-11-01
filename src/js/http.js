
import axios from 'axios';


const http = axios.create({
    baseURL: 'https://api.quickbase.com/v1/'
});

export default http;