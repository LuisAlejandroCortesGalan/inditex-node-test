import logger from './logger';

/**
 * Estados posibles del circuit breaker
 */
export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

/**
 * Implementación del patrón Circuit Breaker para mayor resiliencia
 * Previene cascada de fallos cuando un servicio externo falla repetidamente
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: CircuitState = 'CLOSED';
  
  /**
   * Constructor del Circuit Breaker
   * @param name Nombre identificativo del circuit breaker
   * @param failureThreshold Número de fallos consecutivos antes de abrir el circuito
   * @param resetTimeout Tiempo en ms antes de intentar cerrar un circuito abierto
   */
  constructor(
    private readonly name: string,
    private readonly failureThreshold = 5,
    private readonly resetTimeout = 30000
  ) {
    logger.info(`CircuitBreaker [${name}] initialized with threshold=${failureThreshold}, resetTimeout=${resetTimeout}ms`);
  }
  
  /**
   * Ejecuta una función dentro de la protección del circuit breaker
   * @param fn Función a ejecutar
   * @param fallback Función opcional a ejecutar cuando el circuito está abierto
   */
  async execute<T>(fn: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      // Si el circuito está abierto, comprobar si ha pasado suficiente tiempo para intentar cerrarlo
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        logger.info(`CircuitBreaker [${this.name}] state changing from OPEN to HALF_OPEN`);
        this.state = 'HALF_OPEN';
      } else {
        logger.debug(`CircuitBreaker [${this.name}] is OPEN - fast failing`);
        // Si hay una función de fallback, utilizarla
        if (fallback) {
          return fallback();
        }
        throw new Error(`CircuitBreaker [${this.name}] is OPEN`);
      }
    }
    
    try {
      // Intentar ejecutar la función
      const result = await fn();
      
      // Si estamos en HALF_OPEN y todo va bien, resetear el circuit breaker
      if (this.state === 'HALF_OPEN') {
        this.reset();
        logger.info(`CircuitBreaker [${this.name}] closed after successful execution in HALF_OPEN state`);
      }
      
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.warn(`CircuitBreaker [${this.name}] registered failure: ${errorMessage}. Count: ${this.failures}/${this.failureThreshold}`);
      
      // Si alcanzamos el umbral de fallos, abrir el circuito
      if (this.failures >= this.failureThreshold) {
        this.state = 'OPEN';
        logger.error(`CircuitBreaker [${this.name}] changed to OPEN after ${this.failures} consecutive failures`);
      }
      
      throw error;
    }
  }
  
  /**
   * Obtiene el estado actual del circuit breaker
   */
  getState(): CircuitState {
    return this.state;
  }
  
  /**
   * Resetea el circuit breaker al estado cerrado
   */
  private reset(): void {
    this.failures = 0;
    this.state = 'CLOSED';
    logger.debug(`CircuitBreaker [${this.name}] has been reset to CLOSED state`);
  }
}