import axios from 'axios';
// ============================================================================
// Error Types
// ============================================================================
export class NWSApiError extends Error {
    statusCode;
    response;
    constructor(message, statusCode, response) {
        super(message);
        this.statusCode = statusCode;
        this.response = response;
        this.name = 'NWSApiError';
    }
}
export class NWSRateLimitError extends NWSApiError {
    constructor(message = 'Rate limit exceeded') {
        super(message, 429);
        this.name = 'NWSRateLimitError';
    }
}
// ============================================================================
// NWS API Client
// ============================================================================
export class NWSClient {
    client;
    baseURL = 'https://api.weather.gov';
    userAgent = 'WeatherApp/1.0 (contact@example.com)';
    maxRetries = 3;
    backoffDelays = [5000, 10000, 20000]; // 5s, 10s, 20s for 429 errors
    constructor() {
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'User-Agent': this.userAgent,
                Accept: 'application/geo+json',
            },
            timeout: 30000, // 30 second timeout
        });
    }
    /**
     * Sleep utility for backoff delays
     */
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    /**
     * Generic request handler with retry logic and exponential backoff
     */
    async request(endpoint, attempt = 0) {
        try {
            const response = await this.client.get(endpoint);
            return response.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error;
                const status = axiosError.response?.status;
                // Handle 429 (Rate Limit) with exponential backoff
                if (status === 429) {
                    if (attempt < this.backoffDelays.length) {
                        const delay = this.backoffDelays[attempt];
                        if (delay !== undefined) {
                            console.warn(`Rate limit hit on ${endpoint}. Retrying in ${delay}ms (attempt ${attempt + 1}/${this.backoffDelays.length})`);
                            await this.sleep(delay);
                            return this.request(endpoint, attempt + 1);
                        }
                    }
                    throw new NWSRateLimitError(`Rate limit exceeded after ${this.backoffDelays.length} retries`);
                }
                // Handle 5xx errors with retry logic
                if (status && status >= 500 && status < 600) {
                    if (attempt < this.maxRetries) {
                        const delay = 1000 * Math.pow(2, attempt); // Exponential backoff: 1s, 2s, 4s
                        console.warn(`Server error ${status} on ${endpoint}. Retrying in ${delay}ms (attempt ${attempt + 1}/${this.maxRetries})`);
                        await this.sleep(delay);
                        return this.request(endpoint, attempt + 1);
                    }
                    else {
                        throw new NWSApiError(`Server error after ${this.maxRetries} retries: ${axiosError.message}`, status, axiosError.response?.data);
                    }
                }
                // Handle 404 and other client errors
                if (status === 404) {
                    throw new NWSApiError(`Resource not found: ${endpoint}`, 404, axiosError.response?.data);
                }
                // Other HTTP errors
                throw new NWSApiError(`HTTP error ${status}: ${axiosError.message}`, status, axiosError.response?.data);
            }
            // Non-Axios errors
            throw new NWSApiError(`Unknown error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Get point data (grid coordinates) from lat/lon
     * @param lat Latitude
     * @param lon Longitude
     * @returns Point data including grid coordinates
     */
    async getPointData(lat, lon) {
        // Round to 4 decimal places for NWS API
        const roundedLat = Math.round(lat * 10000) / 10000;
        const roundedLon = Math.round(lon * 10000) / 10000;
        return this.request(`/points/${roundedLat},${roundedLon}`);
    }
    /**
     * Get 7-day forecast
     * @param office Grid office identifier
     * @param gridX Grid X coordinate
     * @param gridY Grid Y coordinate
     * @returns 7-day forecast with day/night periods
     */
    async getForecast(office, gridX, gridY) {
        return this.request(`/gridpoints/${office}/${gridX},${gridY}/forecast`);
    }
    /**
     * Get hourly forecast
     * @param office Grid office identifier
     * @param gridX Grid X coordinate
     * @param gridY Grid Y coordinate
     * @returns Hourly forecast data
     */
    async getHourlyForecast(office, gridX, gridY) {
        return this.request(`/gridpoints/${office}/${gridX},${gridY}/forecast/hourly`);
    }
    /**
     * Get observation stations for a grid point
     * @param office Grid office identifier
     * @param gridX Grid X coordinate
     * @param gridY Grid Y coordinate
     * @returns List of nearby observation stations
     */
    async getStations(office, gridX, gridY) {
        return this.request(`/gridpoints/${office}/${gridX},${gridY}/stations`);
    }
    /**
     * Get latest observation from a station
     * @param stationId Station identifier (e.g., "KDFW")
     * @returns Latest observation data
     */
    async getLatestObservation(stationId) {
        return this.request(`/stations/${stationId}/observations/latest`);
    }
    /**
     * Get active alerts for a point
     * @param lat Latitude
     * @param lon Longitude
     * @returns Active weather alerts
     */
    async getActiveAlerts(lat, lon) {
        // Round to 4 decimal places for NWS API
        const roundedLat = Math.round(lat * 10000) / 10000;
        const roundedLon = Math.round(lon * 10000) / 10000;
        return this.request(`/alerts/active?point=${roundedLat},${roundedLon}`);
    }
    /**
     * Get full weather data for a location (convenience method)
     * @param lat Latitude
     * @param lon Longitude
     * @returns Object containing all weather data
     */
    async getWeatherData(lat, lon) {
        // Get point data first
        const pointData = await this.getPointData(lat, lon);
        const { gridId, gridX, gridY } = pointData.properties;
        // Fetch all data in parallel
        const [forecast, hourlyForecast, stations, alerts] = await Promise.all([
            this.getForecast(gridId, gridX, gridY),
            this.getHourlyForecast(gridId, gridX, gridY),
            this.getStations(gridId, gridX, gridY),
            this.getActiveAlerts(lat, lon),
        ]);
        // Get latest observation from first station
        let observation = null;
        if (stations.features.length > 0) {
            const firstStation = stations.features[0];
            if (firstStation?.properties?.stationIdentifier) {
                const stationId = firstStation.properties.stationIdentifier;
                try {
                    observation = await this.getLatestObservation(stationId);
                }
                catch (error) {
                    console.warn(`Failed to get observation from ${stationId}:`, error);
                }
            }
        }
        return {
            pointData,
            forecast,
            hourlyForecast,
            stations,
            observation,
            alerts,
        };
    }
}
// ============================================================================
// Default Export
// ============================================================================
export default new NWSClient();
//# sourceMappingURL=nwsClient.js.map