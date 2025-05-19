import { SignalData } from "simple-peer";

/**
 * Returns the host URL for the server
 */
export const getBaseUrl = () => {
    return process.env.API_URL || 'https://send.xxsfish.com/';
};

/**
 * Sends a GET request to the server
 * @param uri {string} - The URI to append to the host URL
 * @returns {Promise<any>} - A promise that resolves with the response
 */
export const getApi = (uri: string): Promise<any> => {
    const url = getBaseUrl() + uri;
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response: any) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((response: any) => {
                resolve(response);
            })
            .catch(error => {
                const networkError = new Error('Network error');
                networkError.stack = error.stack;
                (networkError as any).originalMessage = error.message;
                reject(networkError);
            });
    });
};

/**
 * Posts data to the server
 * @param uri {string} - The URI to append to the host URL
 * @param data {any} - The data to send in the request
 * @returns {Promise<any>} - A promise that resolves with the response
 */
export const postApi = (uri: string, data: any): Promise<any> => {
    const url = getBaseUrl() + uri;
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: data,
        })
            .then((response: any) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((response: any) => {
                return resolve(response);
            })
            .catch(error => {
                const networkError = new Error('Network error');
                networkError.stack = error.stack;
                (networkError as any).originalMessage = error.message;
                reject(networkError)
            })
    });
};

/**
 * Creates a room for user
 * @param signalData {SignalData} - The signal data for RTC
 * @param fileName {string} - The name of the file to be sent
 * @param fileSize {number} - The size of the file to be sent
 * @returns {Promise<any>} - A promise that resolves with the response
 */
export const createRoomApi = (signalData: SignalData, fileName: string, fileSize: number): Promise<any> => {
    const body = {
        signal: signalData,
        fileName,
        fileSize,
    };
    return postApi('/create-room', JSON.stringify(body));
}

/**
 * Checks the status of a room
 * @param roomId {string} - The ID of the room to check
 * @returns {Promise<any>} - A promise that resolves with the response
 */
export const checkRoomStatusApi = (roomId: string): Promise<any> => {
    return getApi(`/room/${roomId}/status`);
};

/**
 * Joins a room
 * @param roomId {string} - The ID of the room to join
 * @param signalData {SignalData} - The signal data for RTC
 * @returns {Promise<any>} - A promise that resolves with the response
 */
export const joinRoomApi = (roomId: string, signalData: SignalData): Promise<any> => {
    const body = {
        signal: signalData,
        role: 'receiver',
    };
    return postApi(`/join/${roomId}`, JSON.stringify(body));
}

/**
 * Gets the signal data for a room
 * @param roomId {string} - The ID of the room
 * @returns {Promise<any>} - A promise that resolves with the response
 */
export const getSignalApi = (roomId: string): Promise<any> => {
    return getApi(`/signal/${roomId}`);
}
