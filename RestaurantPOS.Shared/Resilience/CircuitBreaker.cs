namespace RestaurantPOS.Shared.Resilience;

public class CircuitBreaker
{
    private readonly int _failureThreshold;
    private readonly TimeSpan _resetTimeout;
    private readonly object _lock = new();
    private int _failureCount;
    private CircuitState _state = CircuitState.Closed;
    private DateTime _lastFailureTime;

    public CircuitState State
    {
        get
        {
            lock (_lock)
            {
                if (_state == CircuitState.Open && DateTime.UtcNow - _lastFailureTime > _resetTimeout)
                {
                    _state = CircuitState.HalfOpen;
                    _failureCount = 0;
                }
                return _state;
            }
        }
    }

    public CircuitBreaker(int failureThreshold = 5, int resetTimeoutSeconds = 30)
    {
        _failureThreshold = failureThreshold;
        _resetTimeout = TimeSpan.FromSeconds(resetTimeoutSeconds);
    }

    public async Task<T> ExecuteAsync<T>(Func<Task<T>> action, Func<Task<T>> fallback)
    {
        var state = State;
        if (state == CircuitState.Open)
            throw new CircuitBreakerOpenException("Circuit breaker is open");

        try
        {
            var result = await action();
            OnSuccess();
            return result;
        }
        catch
        {
            OnFailure();
            if (State == CircuitState.Open)
                return await fallback();
            throw;
        }
    }

    private void OnSuccess()
    {
        lock (_lock)
        {
            _failureCount = 0;
            _state = CircuitState.Closed;
        }
    }

    private void OnFailure()
    {
        lock (_lock)
        {
            _failureCount++;
            _lastFailureTime = DateTime.UtcNow;
            if (_failureCount >= _failureThreshold)
                _state = CircuitState.Open;
        }
    }
}

public enum CircuitState { Closed, Open, HalfOpen }

public class CircuitBreakerOpenException : Exception
{
    public CircuitBreakerOpenException(string message) : base(message) { }
}
