using Microsoft.Extensions.Logging;

namespace RestaurantPOS.Shared.Saga;

public interface ISagaStep<TContext>
{
    string Name { get; }
    Task ExecuteAsync(TContext context);
    Task CompensateAsync(TContext context);
}

public class SagaOrchestrator<TContext>
{
    private readonly List<ISagaStep<TContext>> _steps;
    private readonly ILogger<SagaOrchestrator<TContext>> _logger;

    public SagaOrchestrator(IEnumerable<ISagaStep<TContext>> steps, ILogger<SagaOrchestrator<TContext>> logger)
    {
        _steps = steps.ToList();
        _logger = logger;
    }

    public async Task ExecuteAsync(TContext context)
    {
        var completedSteps = new Stack<ISagaStep<TContext>>();

        foreach (var step in _steps)
        {
            try
            {
                _logger.LogInformation("Saga: Executing step '{Step}'", step.Name);
                await step.ExecuteAsync(context);
                completedSteps.Push(step);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Saga: Step '{Step}' failed. Starting compensation...", step.Name);
                await CompensateAsync(context, completedSteps);
                throw new SagaExecutionException($"Saga failed at step '{step.Name}'", ex);
            }
        }

        _logger.LogInformation("Saga: Completed successfully");
    }

    private async Task CompensateAsync(TContext context, Stack<ISagaStep<TContext>> completedSteps)
    {
        while (completedSteps.Count > 0)
        {
            var step = completedSteps.Pop();
            try
            {
                _logger.LogWarning("Saga: Compensating step '{Step}'", step.Name);
                await step.CompensateAsync(context);
            }
            catch (Exception ex)
            {
                _logger.LogCritical(ex, "Saga: Compensation for step '{Step}' failed!", step.Name);
            }
        }
    }
}

public class SagaExecutionException : Exception
{
    public SagaExecutionException(string message, Exception innerException)
        : base(message, innerException) { }
}
