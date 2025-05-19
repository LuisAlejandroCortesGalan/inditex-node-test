import axios, { AxiosInstance } from 'axios';
import HttpClient from './httpClient';
import { TimeoutError, ExternalApiError } from '../models/errors';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('HttpClient', () => {
    let httpClient: HttpClient;
    const mockBaseUrl = 'https://api.example.com';
    let mockAxiosInstance: {
        get: jest.Mock;
        interceptors: {
            request: { use: jest.Mock };
            response: { use: jest.Mock };
        };
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // Crear una instancia mock de Axios más completa
        mockAxiosInstance = {
            get: jest.fn(),
            interceptors: {
                request: { use: jest.fn() },
                response: { use: jest.fn() },
            },
        };

        // Mock axios.create para devolver nuestra instancia mock
        mockedAxios.create.mockReturnValue(mockAxiosInstance as unknown as AxiosInstance);

        httpClient = new HttpClient(mockBaseUrl);
    });

    describe('get', () => {
        it('should make a successful GET request', async () => {
            const mockResponse = { data: { id: '1', name: 'Test' } };

            mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

            const result = await httpClient.get<{ id: string; name: string }>('/resource/1');

            expect(result).toEqual(mockResponse.data);
            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/resource/1', undefined);
        });

        it('should use cache for repeated requests', async () => {
            const mockResponse = { data: { id: '1', name: 'Test' } };

            mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

            // First request should call axios
            await httpClient.get<{ id: string; name: string }>('/resource/1');

            // Second request with same URL should use cache
            await httpClient.get<{ id: string; name: string }>('/resource/1');

            // Axios should only have been called once
            expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
        });

        it('should retry on failure up to maxRetries', async () => {
            const mockError = {
                isAxiosError: true,
                response: { status: 500, data: { message: 'Server error' } },
            };

            // Fail twice, succeed on third attempt
            mockAxiosInstance.get
                .mockRejectedValueOnce(mockError)
                .mockRejectedValueOnce(mockError)
                .mockResolvedValueOnce({ data: { success: true } });

            const result = await httpClient.get<{ success: boolean }>('/resource/1', undefined, false, 3);

            expect(result).toEqual({ success: true });
            expect(mockAxiosInstance.get).toHaveBeenCalledTimes(3);
        });


        it('should throw TimeoutError on connection timeout', async () => {
            const mockError = {
                isAxiosError: true,
                code: 'ECONNABORTED',
                message: 'timeout of 3000ms exceeded',
            };

            mockAxiosInstance.get.mockRejectedValue(mockError);

            try {
                await httpClient.get('/resource/1', undefined, false, 0);
                fail('Expected to throw TimeoutError');
            } catch (error) {
                expect(error).toBeInstanceOf(TimeoutError);
            }
        });

        it('should throw ExternalApiError on server error', async () => {
            const mockError = {
                isAxiosError: true,
                response: { status: 500, data: { message: 'Internal server error' } },
            };

            mockAxiosInstance.get.mockRejectedValue(mockError);

            await expect(httpClient.get('/resource/1', undefined, false, 0)).rejects.toThrow(ExternalApiError);
        });
    });

    describe('clearCache', () => {
        it('should clear the cache', async () => {
            const mockResponse = { data: { id: '1', name: 'Test' } };

            mockAxiosInstance.get.mockResolvedValue(mockResponse);

            // First request - should call axios
            await httpClient.get<{ id: string; name: string }>('/resource/1');

            // Clear cache
            httpClient.clearCache();

            // Second request - should call axios again because cache was cleared
            await httpClient.get<{ id: string; name: string }>('/resource/1');

            expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
        });
    });
});