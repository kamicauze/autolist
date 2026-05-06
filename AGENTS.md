# Agent Instructions

## Playwright Cleanup

- Reuse an existing Playwright page when possible instead of opening a new tab for each step.
- If you create a Playwright `page`, `context`, or `browser`, close it before finishing the task or before opening another one that is not required for the same flow.
- Use cleanup in a `try/finally` block so pages are closed on both success and failure.
- The expected final state after browser automation is no leftover tabs, pages, or browser processes created by the agent.
